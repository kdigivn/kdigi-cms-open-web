// HTML for one thumbnail (1920×1080). Pure string building: all inputs are passed in.
import { pathToFileURL } from "node:url";

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );

/** Height of the centred crop of `ratio` ([w, h]) on the canvas. */
export const cropHeight = (style, [rw, rh]) => (style.canvas.width * rh) / rw;

/**
 * Safe zone: where text and logo may sit so that every crop keeps them. For this site only the social
 * crops exist (1.91:1 OG, 2:1 for X); blog cards and the post header show the full 16:9 frame. Side limit =
 * `safe.sideMargin` + `safe.margin`; vertical limit = the shorter crop band inset by `safe.margin`.
 * A `safe.square` (khoi.pro heritage) is only applied when set.
 */
export function safeBox(style) {
  const { width, height } = style.canvas;
  const sq = style.safe.square ? Math.min(style.safe.square, width, height) : null;
  const bands = [cropHeight(style, style.safe.ogRatio), cropHeight(style, style.safe.wideRatio)];
  if (sq) bands.push(sq);
  const m = style.safe.margin;
  const half = Math.min(...bands) / 2;
  const side = sq ? (width - sq) / 2 + m : (style.safe.sideMargin ?? 0) + m;
  return {
    x0: side,
    x1: width - side,
    y0: height / 2 - half + m,
    y1: height / 2 + half - m,
  };
}

/** Pull the `d` attributes out of the three-path mark SVG. */
export function markPaths(svg) {
  const viewBox = svg
    .match(/viewBox="([^"]+)"/)?.[1]
    .split(/\s+/)
    .map(Number);
  const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (!viewBox || ds.length !== 3)
    throw new Error("mark.svg must have a viewBox and exactly 3 paths");
  return { viewBox, ds };
}

function geometrySvg(style, preset, paths) {
  const { width, height } = style.canvas;
  const [vx, vy, vw, vh] = paths.viewBox;
  const mx = vx + vw / 2;
  const my = vy + vh / 2;
  const g = preset.shapes
    .map(
      (s, i) =>
        `<path d="${paths.ds[i]}" fill="${s.color}" fill-opacity="${s.opacity}"/>`
    )
    .join("");
  return `<svg class="geo" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g transform="translate(${preset.cx} ${preset.cy}) scale(${preset.scale}) translate(${-mx} ${-my})">${g}</g></svg>`;
}

const inlineSvg = (svg, cls, height) => {
  const vb = svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(/\s+/)
    .map(Number);
  const w = Math.round(((height * vb[2]) / vb[3]) * 100) / 100;
  return svg.replace(
    "<svg ",
    `<svg class="${cls}" width="${w}" height="${height}" aria-hidden="true" `
  );
};

const WORD = "[\\p{L}\\d.]+";
const NOBREAK = new RegExp(
  [
    `KDIGI CMS(?: \\d[\\d.]*)?`, // brand + version: "KDIGI CMS 1.1.0"
    `${WORD}(?: CMS)? vs ${WORD}(?: CMS)?`, // "Strapi vs Payload CMS", "Ghost vs WordPress"
    `(?:Payload|Strapi|Directus|Headless|headless|Ghost|Self|self) (?:CMS|host)`,
    `Core Web Vitals`,
    `Docker Compose`,
    `Next\\.js`,
    `JSON-LD`,
    `llms\\.txt`,
    `sitemap\\.xml`,
    `WordPress`,
    `[Tt]ự host`,
    `[Pp]hát hành`,
    `[Cc]ông khai`,
    `[Hh]ướng dẫn`,
    `[Gg]iải thích`,
    `[Cc]ú pháp`,
    `[Bb]án hàng`,
    `[Ưư]u nhược(?: điểm)?`,
    `\\d+ (?:cách|bước|bài|lỗi|năm|trang|phút|ngày|mẫu|lý do|tính năng|công cụ)`, // number + unit: "15 cách"
  ].join("|"),
  "gu"
);

/** Keep brand/product names and number+unit pairs on one line (white-space:nowrap span). Input is already escaped. */
const protect = (escaped) => escaped.replace(NOBREAK, (m) => `<span class="nb">${m}</span>`);

/**
 * "Head: tail" sets the tail in the accent colour (as the site's hero heading does). Two renderings are
 * returned: `block` (break after the colon, each clause balanced on its own) and `inline` (one flowing,
 * balanced paragraph); the wide layout keeps whichever lets the title grow larger.
 */
function titleHtml(title) {
  const m = title.match(/^([^:]{3,60}:)\s+(\S.*)$/);
  if (!m) return { block: protect(esc(title)) };
  const head = protect(esc(m[1]));
  const tail = protect(esc(m[2]));
  return {
    block: `<span class="head">${head}</span><span class="tail">${tail}</span>`,
    inline: `<span class="head">${head}</span> <span class="tail">${tail}</span>`,
  };
}

function debugBoxes(style, safe) {
  const { width, height } = style.canvas;
  const og = cropHeight(style, style.safe.ogRatio);
  const wd = cropHeight(style, style.safe.wideRatio);
  const sq = style.safe.square
    ? `<div class="dbg" style="left:${(width - style.safe.square) / 2}px;top:0;width:${style.safe.square}px;height:${height}px;border-color:#00e5ff"><b style="color:#00e5ff">1:1 · ${style.safe.square}×${style.safe.square}</b></div>`
    : "";
  return `${sq}
<div class="dbg" style="left:0;top:${(height - og) / 2}px;width:${width}px;height:${og}px;border-color:#ff2bd6"><b style="color:#ff2bd6;top:auto;bottom:4px">1.91:1 · 1200×630</b></div>
<div class="dbg" style="left:0;top:${(height - wd) / 2}px;width:${width}px;height:${wd}px;border-color:#ffa500"><b style="color:#ffa500;top:auto;bottom:4px;left:auto;right:6px">2:1 (X)</b></div>
<div class="dbg" style="left:${safe.x0}px;top:${safe.y0}px;width:${safe.x1 - safe.x0}px;height:${safe.y1 - safe.y0}px;border:3px dashed #a6ff00"><b style="color:#a6ff00;left:auto;right:6px">text + logo zone</b></div>`;
}

/**
 * `wide` layout (default for cards): full-bleed, no floating panel. Eyebrow chip top-left, left-aligned title
 * across `layout.wide.textWidth`, KDIGI logo bottom-left, domain bottom-right, category art bleeding off the
 * right/bottom edge plus the brand geometry. `solid` = light background, `glass` = dark navy with a glass sheen.
 */
function buildWideHtml(p) {
  const { style, treatment, text, assets } = p;
  const t = style.treatments[treatment];
  const W = style.layout.wide;
  const { width, height } = style.canvas;
  const safe = safeBox(style);
  const fontFace = (weight, file) =>
    `@font-face{font-family:"KhoiSans";font-weight:${weight};src:url("${pathToFileURL(file).href}") format("truetype")}`;
  const long = text.title.length > 80;
  const modes = titleHtml(text.title);
  const cfg = {
    minSize: long ? W.titleMinSizeLong : W.titleMinSize,
    maxSize: W.titleMaxSize,
    maxLines: W.titleMaxLines,
    fourLinesBelow: long ? W.titleMinSize : 0,
    lineHeight: W.titleLineHeight,
    wrapHeight: height,
    padding: 0,
    sample: `${text.title}${text.eyebrow}`,
    preferBlockMin: W.preferBlockMin ?? 96,
    fallbackMin: W.titleMinSizeLong,
    fallbackFourBelow: W.titleMinSize,
    modes,
  };
  const art = p.art
    ? `<img class="art" src="${pathToFileURL(p.art.file).href}" alt="" style="width:${W.art.width}px;right:${W.art.right}px">`
    : "";
  const debug = p.debugSafe ? debugBoxes(style, safe) : "";
  const colH = height - W.top - W.bottom;
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>${esc(text.title)}</title>
<style>
${fontFace(400, assets.fontRegular)}
${fontFace(700, assets.fontBold)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${width}px;height:${height}px;overflow:hidden;background:#000}
#stage{position:relative;width:${width}px;height:${height}px;overflow:hidden;font-family:"KhoiSans",sans-serif;-webkit-font-smoothing:antialiased;background:${t.wideBg}}
.glow{position:absolute;left:${W.glow.left}px;top:${W.glow.top}px;width:${W.glow.size}px;height:${W.glow.size}px;border-radius:50%;background:${t.glow}}
.art{position:absolute;display:block;height:auto;top:50%;transform:translateY(-50%)}
#panel{position:absolute;left:${W.left}px;top:${W.top}px;width:${W.textWidth}px;height:${colH}px;display:flex;flex-direction:column;color:${t.ink}}
#chip{align-self:flex-start;display:inline-flex;align-items:center;gap:12px;height:${style.layout.chipHeight}px;padding:0 26px 0 20px;border-radius:${style.layout.chipHeight}px;
  background:${t.chipBg};color:${t.chipInk};font-weight:700;font-size:28px;line-height:1.3;letter-spacing:.01em;white-space:nowrap}
#chip svg{display:block;flex:none}
#mid{flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:${W.chipGap}px}
#title{width:100%;font-weight:700;line-height:${W.titleLineHeight};letter-spacing:-.015em;text-wrap:balance;overflow-wrap:break-word;color:${t.ink}}
#title.block .head,#title.block .tail{display:block;text-wrap:balance}
#title.inline .head,#title.inline .tail{display:inline}
#title .tail{color:${t.accent}}
#title .nb{white-space:nowrap}
#foot svg{display:block}
.dbg{position:absolute;border:4px solid;pointer-events:none}
.dbg b{position:absolute;left:6px;top:4px;font:700 22px/1 sans-serif;background:rgba(0,0,0,.6);padding:4px 8px}
</style></head>
<body><div id="stage">
<div class="glow"></div>
${art}
<div id="panel">
<div id="foot">${inlineSvg(assets[t.logo], "logo", W.logoHeight)}</div>
<div id="mid">
<div id="chip">${inlineSvg(assets[t.dot], "dot", 20)}<span id="eyebrow">${esc(text.eyebrow)}</span></div>
<h1 id="title" class="block">${modes.block}</h1>
</div>
</div>
${debug}
</div>
<script>
const CFG=${JSON.stringify(cfg).replace(/</g, "\\u003c")};
const rect=(id)=>{const r=document.getElementById(id).getBoundingClientRect();return{x0:r.left,y0:r.top,x1:r.right,y1:r.bottom}};
function fitMode(mode){
  const title=document.getElementById("title"),mid=document.getElementById("mid");
  title.className=mode;title.innerHTML=CFG.modes[mode];
  const ok=(s)=>{title.style.fontSize=s+"px";
    const lines=Math.round(title.getBoundingClientRect().height/(s*CFG.lineHeight));
    return lines<=(s<CFG.fourLinesBelow?CFG.maxLines+1:CFG.maxLines)&&title.scrollWidth<=title.clientWidth+1&&mid.scrollHeight<=mid.clientHeight+1};
  let lo=CFG.minSize,hi=CFG.maxSize,best=null;
  while(lo<=hi){const m=(lo+hi)>>1;if(ok(m)){best=m;lo=m+1}else hi=m-1}
  return best;
}
function fit(){
  const title=document.getElementById("title");
  let sizes={};
  const run=()=>{sizes={};for(const mode of Object.keys(CFG.modes))sizes[mode]=fitMode(mode);return Object.entries(sizes).filter(([,s])=>s!==null).sort((a,b)=>b[1]-a[1])[0]};
  let best=run();
  // Title too long for 3 lines at the base minimum: allow 4 lines below the base size, down to the long-title minimum.
  if(!best){CFG.minSize=Math.min(CFG.minSize,CFG.fallbackMin);CFG.fourLinesBelow=CFG.fallbackFourBelow;best=run()}
  if(!best){fitMode("block");title.style.fontSize=CFG.minSize+"px";return null}
  let pick={mode:best[0],s:best[1]};
  const b=sizes.block;
  if(b!==null&&b>=CFG.preferBlockMin&&b>=0.8*best[1])pick={mode:"block",s:b};
  fitMode(pick.mode);title.style.fontSize=pick.s+"px";window.__mode=pick.mode;return pick.s;
}
window.__ready=(async()=>{
  const loaded=await Promise.all([document.fonts.load("400 32px KhoiSans",CFG.sample),document.fonts.load("700 32px KhoiSans",CFG.sample)]);
  if(loaded.some((f)=>f.length===0||f.some((x)=>x.status!=="loaded")))throw new Error("font KhoiSans did not load");
  await document.fonts.ready;
  const img=document.querySelector(".art");
  if(img)await img.decode();
  const size=fit();
  const title=document.getElementById("title");
  const chipR=document.getElementById("chip").getBoundingClientRect(),panelR=document.getElementById("panel").getBoundingClientRect();
  return{fits:size!==null,mode:window.__mode??"block",eyebrowFits:chipR.right<=panelR.right+1,titleSize:size??CFG.minSize,
    lines:Math.round(title.getBoundingClientRect().height/((size??CFG.minSize)*CFG.lineHeight)),
    rects:{panel:rect("panel"),chip:rect("chip"),title:rect("title"),foot:rect("foot")}};
})();
</script></body></html>`;
}

export function buildHtml(p) {
  const { style, kind, treatment, text, assets } = p;
  if (kind === "card" && p.layout !== "panel") return buildWideHtml(p);
  const t = style.treatments[treatment];
  const L = style.layout;
  const { width, height } = style.canvas;
  const safe = safeBox(style);
  const isPhoto = kind === "photo";
  const area = isPhoto ? L.photo : L.card;
  const wrapLeft = (width - L.panelWidth) / 2;

  const fontFace = (weight, file) =>
    `@font-face{font-family:"KhoiSans";font-weight:${weight};src:url("${pathToFileURL(file).href}") format("truetype")}`;

  const cfg = {
    minSize: L.titleMinSize,
    maxSize: L.titleMaxSize,
    maxLines: L.titleMaxLines,
    lineHeight: L.titleLineHeight,
    wrapHeight: height - area.top - area.bottom,
    padding: L.panelPadding,
    sample: `${text.title}${text.eyebrow}`,
  };

  const background = isPhoto
    ? `<img id="photo" class="photo" src="${pathToFileURL(p.photo.file).href}" alt="" style="object-position:${p.photo.focus[0]}% ${p.photo.focus[1]}%"><div class="scrim"></div>`
    : `${geometrySvg(style, style.geometry[p.geometry], assets.markPaths)}`;

  const debug = p.debugSafe ? debugBoxes(style, safe) : "";

  const testTag = p.testTag
    ? `<div class="testtag">TEST SOURCE · NOT FOR PUBLICATION</div>`
    : "";

  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>${esc(text.title)}</title>
<style>
${fontFace(400, assets.fontRegular)}
${fontFace(700, assets.fontBold)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${width}px;height:${height}px;overflow:hidden;background:#000}
#stage{position:relative;width:${width}px;height:${height}px;overflow:hidden;font-family:"KhoiSans",sans-serif;-webkit-font-smoothing:antialiased;
  background:${isPhoto ? style.colors.navy : style.card.background}}
.geo,.photo,.scrim{position:absolute;left:0;top:0}
.photo{width:${width}px;height:${height}px;object-fit:cover}
.scrim{width:${width}px;height:${height}px;background:${style.photo.scrim}}
#wrap{position:absolute;left:${wrapLeft}px;width:${L.panelWidth}px;top:${area.top}px;bottom:${area.bottom}px;display:flex;flex-direction:column;justify-content:${isPhoto ? "flex-end" : "center"}}
#panel{display:flex;flex-direction:column;padding:${L.panelPadding}px;border-radius:${L.panelRadius}px;
  background:${t.panelBg};border:${t.panelBorder};box-shadow:${t.panelShadow};
  backdrop-filter:${t.backdrop};-webkit-backdrop-filter:${t.backdrop};color:${t.ink}}
#chip{align-self:flex-start;display:inline-flex;align-items:center;gap:12px;height:${L.chipHeight}px;padding:0 24px 0 18px;border-radius:${L.chipHeight}px;
  background:${t.chipBg};color:${t.chipInk};font-weight:700;font-size:25px;line-height:1.3;letter-spacing:.01em;white-space:nowrap}
#chip svg{display:block;flex:none}
#title{margin-top:36px;font-weight:700;line-height:${L.titleLineHeight};letter-spacing:-.012em;text-wrap:balance;overflow-wrap:break-word;color:${t.ink}}
#foot{margin-top:44px;padding-top:30px;border-top:1.5px solid ${t.rule};display:flex;align-items:center;justify-content:space-between;color:${t.footerInk}}
#foot svg{display:block;color:${t.ink}}
#foot span{font-size:27px;font-weight:400;letter-spacing:.01em}
#title .head,#title .tail{display:block;text-wrap:balance}
#title .tail{color:${t.accent}}
#title .nb{white-space:nowrap}
.testtag{position:absolute;left:${safe.x0}px;top:${safe.y0}px;padding:10px 20px;background:#ffd400;color:#000;font-weight:700;font-size:28px;border-radius:8px}
.dbg{position:absolute;border:4px solid;pointer-events:none}
.dbg b{position:absolute;left:6px;top:4px;font:700 22px/1 sans-serif;background:rgba(0,0,0,.6);padding:4px 8px}
</style></head>
<body><div id="stage">
${background}
<div id="wrap"><div id="panel">
<div id="chip">${inlineSvg(assets[t.dot], "dot", 18)}<span id="eyebrow">${esc(text.eyebrow)}</span></div>
<h1 id="title">${titleHtml(text.title).block}</h1>
<div id="foot">${inlineSvg(assets[t.logo], "logo", L.logoHeight)}<span id="domain">${esc(style.footerText)}</span></div>
</div></div>
${testTag}${debug}
</div>
<script>
const CFG=${JSON.stringify(cfg).replace(/</g, "\\u003c")};
const rect=(id)=>{const r=document.getElementById(id).getBoundingClientRect();return{x0:r.left,y0:r.top,x1:r.right,y1:r.bottom}};
function fit(){
  const title=document.getElementById("title"),panel=document.getElementById("panel");
  const ok=(s)=>{title.style.fontSize=s+"px";
    const lines=Math.round(title.getBoundingClientRect().height/(s*CFG.lineHeight));
    return lines<=CFG.maxLines&&panel.getBoundingClientRect().height<=CFG.wrapHeight&&title.scrollWidth<=title.clientWidth+1};
  let lo=CFG.minSize,hi=CFG.maxSize,best=null;
  while(lo<=hi){const m=(lo+hi)>>1;if(ok(m)){best=m;lo=m+1}else hi=m-1}
  if(best===null){ok(CFG.minSize);return null}
  ok(best);return best;
}
window.__ready=(async()=>{
  const loaded=await Promise.all([document.fonts.load("400 32px KhoiSans",CFG.sample),document.fonts.load("700 32px KhoiSans",CFG.sample)]);
  if(loaded.some((f)=>f.length===0||f.some((x)=>x.status!=="loaded")))throw new Error("font KhoiSans did not load");
  await document.fonts.ready;
  const img=document.getElementById("photo");
  if(img)await img.decode();
  const size=fit();
  const title=document.getElementById("title");
  const chipR=document.getElementById("chip").getBoundingClientRect(),panelR=document.getElementById("panel").getBoundingClientRect();
  return{fits:size!==null,eyebrowFits:chipR.right<=panelR.right-CFG.padding+1,titleSize:size??CFG.minSize,
    lines:Math.round(title.getBoundingClientRect().height/((size??CFG.minSize)*CFG.lineHeight)),
    rects:{panel:rect("panel"),chip:rect("chip"),title:rect("title"),foot:rect("foot")}};
})();
</script></body></html>`;
}
