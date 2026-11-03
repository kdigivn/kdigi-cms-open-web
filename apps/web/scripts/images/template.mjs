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
 * Safe zone: where text and logo may sit so that every crop keeps them: the centred square, the
 * 1.91:1 OG crop and the 2:1 crop (X), inset by `safe.margin`.
 */
export function safeBox(style) {
  const { width, height } = style.canvas;
  const sq = Math.min(style.safe.square, width, height);
  const bands = [
    sq,
    cropHeight(style, style.safe.ogRatio),
    cropHeight(style, style.safe.wideRatio),
  ];
  const m = style.safe.margin;
  const half = Math.min(...bands) / 2;
  return {
    x0: (width - sq) / 2 + m,
    x1: (width + sq) / 2 - m,
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

/** "Head: tail" breaks after the colon and sets the tail in the accent colour (as the site's hero heading does). */
function titleHtml(title) {
  const m = title.match(/^([^:]{3,60}:)\s+(\S.*)$/);
  return m
    ? `<span class="head">${esc(m[1])}</span><span class="tail">${esc(m[2])}</span>`
    : esc(title);
}

export function buildHtml(p) {
  const { style, kind, treatment, text, assets } = p;
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

  const debug = p.debugSafe
    ? `<div class="dbg" style="left:${(width - style.safe.square) / 2}px;top:0;width:${style.safe.square}px;height:${height}px;border-color:#00e5ff"><b style="color:#00e5ff">1:1 · 1080×1080</b></div>
<div class="dbg" style="left:0;top:${(height - cropHeight(style, style.safe.ogRatio)) / 2}px;width:${width}px;height:${cropHeight(style, style.safe.ogRatio)}px;border-color:#ff2bd6"><b style="color:#ff2bd6;top:auto;bottom:4px">1.91:1 · 1200×630</b></div>
<div class="dbg" style="left:0;top:${(height - cropHeight(style, style.safe.wideRatio)) / 2}px;width:${width}px;height:${cropHeight(style, style.safe.wideRatio)}px;border-color:#ffa500"><b style="color:#ffa500;top:auto;bottom:4px;left:auto;right:6px">2:1 (X)</b></div>
<div class="dbg" style="left:${safe.x0}px;top:${safe.y0}px;width:${safe.x1 - safe.x0}px;height:${safe.y1 - safe.y0}px;border:3px dashed #a6ff00"><b style="color:#a6ff00;left:auto;right:6px">text + logo zone</b></div>`
    : "";

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
.testtag{position:absolute;left:${safe.x0}px;top:${safe.y0}px;padding:10px 20px;background:#ffd400;color:#000;font-weight:700;font-size:28px;border-radius:8px}
.dbg{position:absolute;border:4px solid;pointer-events:none}
.dbg b{position:absolute;left:6px;top:4px;font:700 22px/1 sans-serif;background:rgba(0,0,0,.6);padding:4px 8px}
</style></head>
<body><div id="stage">
${background}
<div id="wrap"><div id="panel">
<div id="chip">${inlineSvg(assets[t.dot], "dot", 18)}<span id="eyebrow">${esc(text.eyebrow)}</span></div>
<h1 id="title">${titleHtml(text.title)}</h1>
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
