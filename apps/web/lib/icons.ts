import {
  DatabaseIcon,
  ShieldCheckIcon,
  GlobeIcon,
  LayersIcon,
  ImageIcon,
  SearchIcon,
  ZapIcon,
  GitBranchIcon,
  ServerIcon,
  UsersIcon,
  FileTextIcon,
  WorkflowIcon,
  CodeIcon,
  RocketIcon,
  LockIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  ArrowRightIcon,
  HardDriveIcon,
  RefreshCwIcon,
  GaugeIcon,
  LanguagesIcon,
  BoxesIcon,
  NewspaperIcon,
  ShoppingCartIcon,
  Building2Icon,
  BriefcaseIcon,
  ScaleIcon,
  BookOpenIcon,
  TerminalIcon,
  CloudUploadIcon,
  HistoryIcon,
  KeyRoundIcon,
  LinkIcon,
  ListChecksIcon,
  PenLineIcon,
  SparklesIcon,
  SettingsIcon,
  PackageIcon,
  HeartHandshakeIcon,
  WandSparklesIcon,
  LayoutTemplateIcon,
  TagsIcon,
  CalendarClockIcon,
  EyeIcon,
  BotIcon,
  MapIcon,
  LifeBuoyIcon,
  InfoIcon,
  LightbulbIcon,
  TriangleAlertIcon,
  CloudDownloadIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  FileSearchIcon,
  DatabaseZapIcon,
  Repeat2Icon,
  GitPullRequestIcon,
  GitMergeIcon,
  ArrowUpRightIcon,
  DownloadIcon,
  FolderTreeIcon,
  TrendingUpIcon,
  TargetIcon,
  WrenchIcon,
  PlugIcon,
  MailIcon,
  ContainerIcon,
  ShieldIcon,
} from "lucide-react"
import { type ComponentType, createElement, type ReactElement } from "react"

import { GitHubIcon, GITHUB_MARK_PATH } from "@/components/site/icons"

/**
 * Icon allowlist for the whole site: Markdown (`:icon:` in headings and blocks, `icon:` in frontmatter), navigation, cards and badges.
 * Explicit named imports only (tree-shakeable); an unknown name fails the build with the file that used it.
 * Add an icon = one import + one line in ICONS. Names are lucide kebab-case; `github` is the brand mark from components/site/icons.tsx
 * (lucide v1 has no brand icons).
 */
export type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>

const ICONS = {
  github: GitHubIcon,
  "database": DatabaseIcon,
  "shield-check": ShieldCheckIcon,
  "globe": GlobeIcon,
  "layers": LayersIcon,
  "image": ImageIcon,
  "search": SearchIcon,
  "zap": ZapIcon,
  "git-branch": GitBranchIcon,
  "server": ServerIcon,
  "users": UsersIcon,
  "file-text": FileTextIcon,
  "workflow": WorkflowIcon,
  "code": CodeIcon,
  "rocket": RocketIcon,
  "lock": LockIcon,
  "clock": ClockIcon,
  "check": CheckIcon,
  "x": XIcon,
  "arrow-right": ArrowRightIcon,
  "hard-drive": HardDriveIcon,
  "refresh-cw": RefreshCwIcon,
  "gauge": GaugeIcon,
  "languages": LanguagesIcon,
  "boxes": BoxesIcon,
  "newspaper": NewspaperIcon,
  "shopping-cart": ShoppingCartIcon,
  "building-2": Building2Icon,
  "briefcase": BriefcaseIcon,
  "scale": ScaleIcon,
  "book-open": BookOpenIcon,
  "terminal": TerminalIcon,
  "cloud-upload": CloudUploadIcon,
  "history": HistoryIcon,
  "key-round": KeyRoundIcon,
  "link": LinkIcon,
  "list-checks": ListChecksIcon,
  "pen-line": PenLineIcon,
  "sparkles": SparklesIcon,
  "settings": SettingsIcon,
  "package": PackageIcon,
  "heart-handshake": HeartHandshakeIcon,
  "wand-sparkles": WandSparklesIcon,
  "layout-template": LayoutTemplateIcon,
  "tags": TagsIcon,
  "calendar-clock": CalendarClockIcon,
  "eye": EyeIcon,
  "bot": BotIcon,
  "map": MapIcon,
  "life-buoy": LifeBuoyIcon,
  "info": InfoIcon,
  "lightbulb": LightbulbIcon,
  "triangle-alert": TriangleAlertIcon,
  "cloud-download": CloudDownloadIcon,
  "circle-check": CircleCheckIcon,
  "circle-help": CircleHelpIcon,
  "file-search": FileSearchIcon,
  "database-zap": DatabaseZapIcon,
  "repeat-2": Repeat2Icon,
  "git-pull-request": GitPullRequestIcon,
  "git-merge": GitMergeIcon,
  "arrow-up-right": ArrowUpRightIcon,
  "download": DownloadIcon,
  "folder-tree": FolderTreeIcon,
  "trending-up": TrendingUpIcon,
  "target": TargetIcon,
  "wrench": WrenchIcon,
  "plug": PlugIcon,
  "mail": MailIcon,
  "container": ContainerIcon,
  "shield": ShieldIcon,
} satisfies Record<string, IconComponent>

export type IconName = keyof typeof ICONS

export const ICON_NAMES = Object.keys(ICONS) as IconName[]

export const DEFAULT_ICON: IconName = "file-text"

export const isIconName = (name: string): name is IconName => Object.hasOwn(ICONS, name)

/** Message for an unknown icon; callers prefix the file path. */
export const unknownIconMessage = (name: string): string =>
  `unknown icon "${name}" (not in apps/web/lib/icons.ts). Allowed: ${ICON_NAMES.join(", ")}`

/** Validate a name coming from content. Throws with the file path when the name is not in the registry. */
export function requireIconName(name: string, file: string): IconName {
  if (!isIconName(name)) throw new Error(`${file}: ${unknownIconMessage(name)}`)
  return name
}

/** Decorative icon element for a registry name (null/undefined = the default file icon). For server components: cards, menus, badges. */
export function pageIcon(name: IconName | null | undefined, className?: string): ReactElement {
  return createElement(ICONS[name ?? DEFAULT_ICON], { className, "aria-hidden": true })
}

type IconNode = [tag: string, attrs: Record<string, string>][]

const nodeCache = new Map<IconName, IconNode>()

/** Path data of a lucide component. The component is a forwardRef whose render returns an <Icon icon={{ node }} />, so the data is read without react-dom/server. */
function nodeOf(name: IconName): IconNode {
  const cached = nodeCache.get(name)
  if (cached) return cached
  let node: IconNode | undefined
  if (name === "github") node = [["path", { d: GITHUB_MARK_PATH }]]
  else {
    const rendered = (ICONS[name] as unknown as { render?: (props: object, ref: null) => { props?: { icon?: { node?: IconNode } } } }).render?.({}, null)
    node = rendered?.props?.icon?.node
  }
  if (!Array.isArray(node) || node.length === 0) throw new Error(`lib/icons.ts: cannot read the SVG data of "${name}" (lucide-react internals changed?)`)
  nodeCache.set(name, node)
  return node
}

const escapeAttr = (value: string): string => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

/** Static decorative SVG string for Markdown output (server-rendered, no client JS). Always aria-hidden. */
export function iconSvg(name: IconName, className = "md-svg"): string {
  const children = nodeOf(name)
    .map(([tag, attrs]) => `<${tag}${Object.entries(attrs).filter(([key]) => key !== "key").map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join("")}/>`)
    .join("")
  const paint = name === "github" ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ${paint} class="${escapeAttr(className)}" aria-hidden="true" focusable="false">${children}</svg>`
}
