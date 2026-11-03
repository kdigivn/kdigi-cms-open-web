import type { MarkdownIt, StateBlock, StateCore, Token } from "markdown-it"

import { iconSvg, isIconName, unknownIconMessage, type IconName } from "@/lib/icons"
import type { MarkdownEnv } from "@/lib/markdown"

/**
 * Visual Markdown (contract: content/README.md, "Visual blocks").
 *  - `:::cards [2|3]`, `:::steps`, `:::stats`, `:::check`, `:::pros-cons` ... `:::` containers holding one bullet list
 *  - `## :icon: Heading` badges (stripped from the id and the TOC label by markdown.ts, which reads the already-stripped tokens)
 *  - automatic icons: callouts, the "Tóm tắt nhanh" bullets, yes/no table cells
 * Everything is built from tokens: the only raw HTML in the output is made here from fixed strings and lucide SVG data; source text stays escaped.
 * Any structural mistake is pushed to env.errors; content.ts turns that into a build failure that names the file.
 */

const BLOCKS = ["cards", "steps", "stats", "check", "pros-cons"] as const
type BlockName = (typeof BLOCKS)[number]

const ICON_PREFIX = /^:([a-z0-9]+(?:-[a-z0-9]+)*):\s*/
const OPEN_LINE = /^:::([a-z][a-z-]*)?(?:[ \t]+(\S.*?))?[ \t]*$/

type Ctx = { env: MarkdownEnv; error: (message: string, line?: number) => void }

const report = (env: MarkdownEnv, message: string, line?: number) => {
  env.errors?.push(line === undefined ? message : `${message} (body line ${line + 1})`)
}

/* ---------- block rule: `:::name [arg]` ... `:::` ---------- */

function containerRule(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false
  const start = state.bMarks[startLine] + state.tShift[startLine]
  const line = state.src.slice(start, state.eMarks[startLine])
  if (!line.startsWith(":::")) return false
  if (silent) return true

  const env = state.env as MarkdownEnv
  const match = OPEN_LINE.exec(line)
  const consume = (message: string) => {
    report(env, message, startLine)
    state.line = startLine + 1
    return true
  }
  if (!match) return consume(`malformed block line "${line.trim()}"`)
  const [, name, arg] = match
  if (!name) return consume('stray ":::" without an opening ":::name"')
  if (!(BLOCKS as readonly string[]).includes(name)) return consume(`unknown block ":::${name}" (use ${BLOCKS.map((b) => `:::${b}`).join(", ")})`)

  let close = -1
  for (let next = startLine + 1; next < endLine; next++) {
    const text = state.src.slice(state.bMarks[next] + state.tShift[next], state.eMarks[next]).trim()
    if (text === ":::") {
      close = next
      break
    }
    if (OPEN_LINE.test(text) && text.length > 3) {
      report(env, `":::${name}" opened at line ${startLine + 1} is not closed before ":::" block at line ${next + 1} (nesting is not supported)`)
      break
    }
  }
  if (close === -1) {
    if (!env.errors?.some((e) => e.includes(`":::${name}" opened at line ${startLine + 1}`))) {
      report(env, `unclosed ":::${name}" block opened at line ${startLine + 1}; close it with a line containing only ":::"`)
    }
    state.line = endLine
    return true
  }

  const open = state.push("visual_open", "div", 1)
  open.block = true
  open.meta = { name, arg: arg ?? null }
  open.map = [startLine, close + 1]
  const previousParent = state.parentType
  const previousMax = state.lineMax
  state.parentType = "container" as unknown as typeof state.parentType
  state.lineMax = close
  state.md.block.tokenize(state, startLine + 1, close)
  state.parentType = previousParent
  state.lineMax = previousMax
  const closer = state.push("visual_close", "div", -1)
  closer.block = true
  state.line = close + 1
  return true
}

/* ---------- token helpers ---------- */

const html = (state: StateCore, content: string, type: "html_inline" | "html_block" = "html_inline"): Token => {
  const token = new state.Token(type, "", 0)
  token.content = content
  return token
}

/** A leading `:icon:` of an inline token. Returns the name and removes it from the children; null when there is none. */
function takeIcon(inline: Token): string | null {
  const first = inline.children?.[0]
  if (!first || first.type !== "text") return null
  const match = ICON_PREFIX.exec(first.content)
  if (!match) return null
  first.content = first.content.slice(match[0].length)
  if (first.content === "") inline.children!.shift()
  return match[1]
}

const iconHtml = (ctx: Ctx, name: string, where: string, line: number | undefined, className: string): string => {
  if (!isIconName(name)) {
    ctx.error(`${unknownIconMessage(name)} in ${where}`, line)
    return ""
  }
  return iconSvg(name, className)
}

/** `**Title** rest...` -> title tokens and the remaining tokens (leading space/softbreak trimmed). Empty text tokens markdown-it leaves around delimiters are ignored. */
function splitTitle(raw: Token[]): { title: Token[]; rest: Token[] } | null {
  const children = raw.filter((child) => !(child.type === "text" && child.content === ""))
  if (children[0]?.type !== "strong_open") return null
  const close = children.findIndex((child, index) => index > 0 && child.type === "strong_close" && child.level === children[0].level)
  if (close === -1) return null
  const rest = children.slice(close + 1)
  while (rest[0] && (rest[0].type === "softbreak" || (rest[0].type === "text" && rest[0].content.trim() === ""))) rest.shift()
  if (rest[0]?.type === "text") rest[0].content = rest[0].content.replace(/^\s+/, "")
  return { title: children.slice(1, close), rest }
}

type Item = { li: Token; inline: Token }

/** Reads the one bullet list a block must contain. Items must be a single paragraph each. */
function readList(tokens: Token[], start: number, ctx: Ctx, name: string): { items: Item[]; end: number; open: Token; close: Token } | null {
  const open = tokens[start]
  if (open?.type !== "bullet_list_open") {
    ctx.error(`":::${name}" must contain a "- " bullet list`, open?.map?.[0])
    return null
  }
  const items: Item[] = []
  let cursor = start + 1
  while (cursor < tokens.length && !(tokens[cursor].type === "bullet_list_close" && tokens[cursor].level === open.level)) {
    const [li, pOpen, inline, pClose, liClose] = tokens.slice(cursor, cursor + 5)
    if (
      li?.type !== "list_item_open" ||
      pOpen?.type !== "paragraph_open" ||
      inline?.type !== "inline" ||
      pClose?.type !== "paragraph_close" ||
      liClose?.type !== "list_item_close"
    ) {
      ctx.error(`":::${name}" items must be a single paragraph each (no nested lists, code or images)`, li?.map?.[0])
      return null
    }
    pOpen.hidden = true
    pClose.hidden = true
    items.push({ li, inline })
    cursor += 5
  }
  return { items, end: cursor, open, close: tokens[cursor] }
}

const styleList = (list: { open: Token; close: Token }, className: string, ordered = false) => {
  list.open.attrSet("class", className)
  if (!ordered) list.open.attrSet("role", "list")
  if (ordered) {
    list.open.type = "ordered_list_open"
    list.open.tag = "ol"
    list.close.type = "ordered_list_close"
    list.close.tag = "ol"
  }
}

/** Prepends an icon span to every item and wraps the text, for check lists and pros/cons. */
function checkItems(state: StateCore, items: Item[], icon: "check" | "x", variant: string) {
  for (const { inline } of items) {
    const svg = iconSvg(icon)
    inline.children = [
      html(state, `<span class="md-check-icon ${variant}">${svg}</span><span class="md-check-text">`),
      ...(inline.children ?? []),
      html(state, "</span>"),
    ]
  }
}

/* ---------- block transforms ---------- */

function transformBlock(state: StateCore, open: Token, inner: Token[], ctx: Ctx): Token[] {
  const { name, arg } = open.meta as { name: BlockName; arg: string | null }
  const line = open.map?.[0]
  const fail = (message: string) => ctx.error(`":::${name}" ${message}`, line)

  if (name !== "cards" && arg) fail(`takes no argument ("${arg}")`)

  if (name === "pros-cons") return transformProsCons(state, open, inner, ctx)

  const list = readList(inner, 0, ctx, name)
  if (!list) return inner
  if (list.end !== inner.length - 1) {
    fail('must contain only one bullet list and nothing else')
    return inner
  }
  if (list.items.length === 0) fail("has no items")

  if (name === "cards") {
    let columns = list.items.length === 4 || list.items.length <= 2 ? 2 : 3
    if (arg !== null) {
      if (arg !== "2" && arg !== "3") fail(`column count must be 2 or 3, got "${arg}"`)
      else columns = Number(arg)
    }
    open.attrSet("class", "md-block")
    styleList(list, `md-cards md-cols-${columns}`)
    list.items.forEach(({ li, inline }, index) => {
      li.attrSet("class", "md-card")
      const lineOfItem = li.map?.[0]
      const icon = takeIcon(inline)
      const parts = splitTitle(inline.children ?? [])
      if (!icon || !parts) {
        ctx.error(`":::cards" item ${index + 1} must start with :icon: then **Title**`, lineOfItem)
        return
      }
      const svg = iconHtml(ctx, icon, `":::cards" item ${index + 1}`, lineOfItem, "md-svg")
      inline.children = [
        html(state, `<span class="md-icon">${svg}</span><span class="md-body"><strong class="md-title">`),
        ...parts.title,
        html(state, "</strong>"),
        ...(parts.rest.length ? [html(state, ' <span class="md-text">'), ...parts.rest, html(state, "</span>")] : []),
        html(state, "</span>"),
      ]
    })
  } else if (name === "steps") {
    open.attrSet("class", "md-block")
    styleList(list, "md-steps", true)
    list.items.forEach(({ li, inline }, index) => {
      li.attrSet("class", "md-step")
      const lineOfItem = li.map?.[0]
      const icon = takeIcon(inline)
      const parts = splitTitle(inline.children ?? [])
      if (!parts) {
        ctx.error(`":::steps" item ${index + 1} must start with **Title** (optionally after :icon:)`, lineOfItem)
        return
      }
      const svg = icon ? iconHtml(ctx, icon, `":::steps" item ${index + 1}`, lineOfItem, "md-svg md-title-icon") : ""
      inline.children = [
        html(state, `<span class="md-body"><strong class="md-title">${svg}<span>`),
        ...parts.title,
        html(state, "</span></strong>"),
        ...(parts.rest.length ? [html(state, ' <span class="md-text">'), ...parts.rest, html(state, "</span>")] : []),
        html(state, "</span>"),
      ]
    })
  } else if (name === "stats") {
    open.attrSet("class", "md-block")
    styleList(list, "md-stats")
    list.items.forEach(({ li, inline }, index) => {
      li.attrSet("class", "md-stat")
      const parts = splitTitle(inline.children ?? [])
      if (!parts) {
        ctx.error(`":::stats" item ${index + 1} must start with **number** then the label`, li.map?.[0])
        return
      }
      inline.children = [
        html(state, '<strong class="md-stat-num">'),
        ...parts.title,
        html(state, "</strong>"),
        ...(parts.rest.length ? [html(state, ' <span class="md-stat-label">'), ...parts.rest, html(state, "</span>")] : []),
      ]
    })
  } else {
    open.attrSet("class", "md-block md-check-box")
    styleList(list, "md-check")
    list.items.forEach(({ li }) => li.attrSet("class", "md-check-item"))
    checkItems(state, list.items, "check", "md-yes")
  }
  return inner
}

function transformProsCons(state: StateCore, open: Token, inner: Token[], ctx: Ctx): Token[] {
  const line = open.map?.[0]
  open.attrSet("class", "md-block md-proscons")
  const out: Token[] = []
  let cursor = 0
  let groups = 0
  while (cursor < inner.length) {
    const [pOpen, inline, pClose] = inner.slice(cursor, cursor + 3)
    const heading = inline?.children?.filter((child) => !(child.type === "text" && child.content === ""))
    if (pOpen?.type !== "paragraph_open" || inline?.type !== "inline" || pClose?.type !== "paragraph_close" || heading?.[0]?.type !== "strong_open" || heading.at(-1)?.type !== "strong_close") {
      ctx.error('":::pros-cons" must be **Ưu điểm** (bold line) + bullet list, then **Hạn chế** + bullet list', line)
      return inner
    }
    const list = readList(inner, cursor + 3, ctx, "pros-cons")
    if (!list) return inner
    const pros = groups === 0
    pOpen.attrSet("class", "md-pc-title")
    inline.children = [html(state, `<span class="md-check-icon ${pros ? "md-yes" : "md-no"}">${iconSvg(pros ? "check" : "x")}</span>`), ...heading]
    styleList(list, "md-pc-list")
    list.items.forEach(({ li }) => li.attrSet("class", "md-check-item"))
    checkItems(state, list.items, pros ? "check" : "x", pros ? "md-yes" : "md-no")
    out.push(html(state, `<div class="md-pc ${pros ? "md-pc-pros" : "md-pc-cons"}">\n`, "html_block"), pOpen, inline, pClose, ...inner.slice(cursor + 3, list.end + 1), html(state, "</div>\n", "html_block"))
    cursor = list.end + 1
    groups++
  }
  if (groups !== 2) ctx.error(`":::pros-cons" needs exactly two groups (**Ưu điểm** then **Hạn chế**), found ${groups}`, line)
  return out
}

/* ---------- core rules ---------- */

const YES_NO: Record<string, { kind: "yes" | "no"; label: string }> = {
  "✓": { kind: "yes", label: "Có" },
  "✔": { kind: "yes", label: "Có" },
  "có": { kind: "yes", label: "Có" },
  "✗": { kind: "no", label: "Không" },
  "✘": { kind: "no", label: "Không" },
  "✕": { kind: "no", label: "Không" },
  "không": { kind: "no", label: "Không" },
}

/** Runs before the heading/callout rule in markdown.ts: containers, heading icons, yes/no cells. */
function visualCore(state: StateCore): boolean {
  const env = state.env as MarkdownEnv
  const ctx: Ctx = { env, error: (message, line) => report(env, message, line) }
  const tokens = state.tokens

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === "heading_open") {
      const inline = tokens[i + 1]
      const name = inline?.type === "inline" ? takeIcon(inline) : null
      if (name !== null && inline) {
        inline.content = inline.content.replace(ICON_PREFIX, "")
        if (!isIconName(name)) ctx.error(`${unknownIconMessage(name)} in heading "${inline.content}"`, token.map?.[0])
        else if (!inline.children?.length) ctx.error(`heading with icon ":${name}:" has no text`, token.map?.[0])
        else inline.children!.unshift(html(state, `<span class="md-h-icon" aria-hidden="true">${iconSvg(name)}</span>`))
      }
    } else if (token.type === "td_open") {
      const inline = tokens[i + 1]
      const hit = inline?.type === "inline" ? YES_NO[inline.content.trim().toLowerCase()] : undefined
      if (hit && inline) {
        inline.children = [html(state, `<span class="md-yn md-${hit.kind}">${iconSvg(hit.kind === "yes" ? "check" : "x")}<span class="md-sr">${hit.label}</span></span>`)]
      }
    }
  }

  const out: Token[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type !== "visual_open") {
      if (token.type === "visual_close") continue
      out.push(token)
      continue
    }
    const close = tokens.findIndex((candidate, index) => index > i && candidate.type === "visual_close")
    const inner = tokens.slice(i + 1, close === -1 ? tokens.length : close)
    out.push(token, ...transformBlock(state, token, inner, ctx))
    const closer = close === -1 ? undefined : tokens[close]
    if (closer) out.push(closer)
    i = close === -1 ? tokens.length : close
  }
  state.tokens = out
  return true
}

const CALLOUT_ICON: Record<string, IconName> = { keyfacts: "zap", note: "info", tip: "lightbulb", warning: "triangle-alert" }

/** Runs after markdown.ts classified the callouts: callout icons and check icons in the key-facts list. */
function calloutIcons(state: StateCore): boolean {
  const tokens = state.tokens
  const out: Token[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    out.push(token)
    if (token.type !== "blockquote_open") continue
    const kind = /\bcallout-(keyfacts|note|tip|warning)\b/.exec(String(token.attrGet("class") ?? ""))?.[1]
    if (!kind) continue
    out.push(html(state, `<span class="md-callout-icon" aria-hidden="true">${iconSvg(CALLOUT_ICON[kind])}</span>`, "html_block"))
    if (kind !== "keyfacts") continue
    for (let j = i + 1; j < tokens.length; j++) {
      const inner = tokens[j]
      if (inner.type === "blockquote_close" && inner.level === token.level) break
      if (inner.type === "bullet_list_open" && inner.level === token.level + 1) {
        inner.attrSet("class", "md-keyfacts-list")
        inner.attrSet("role", "list")
      }
      if (inner.type === "inline" && tokens[j - 1]?.type === "paragraph_open" && tokens[j - 2]?.type === "list_item_open" && tokens[j - 2].level === token.level + 2) {
        inner.children = [html(state, `<span class="md-li-icon">${iconSvg("check")}</span>`), ...(inner.children ?? [])]
      }
    }
  }
  state.tokens = out
  return true
}

export function installVisualBlocks(md: MarkdownIt, position: "before-headings" | "after-headings"): void {
  if (position === "before-headings") {
    md.block.ruler.before("fence", "visual_container", containerRule, { alt: ["paragraph", "reference", "blockquote", "list"] })
    md.core.ruler.push("visual-blocks", visualCore)
  } else {
    md.core.ruler.push("visual-callout-icons", calloutIcons)
  }
}
