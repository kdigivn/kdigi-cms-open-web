// Glyph coverage of a TrueType font (cmap format 4 and 12), so a render can refuse text the font
// cannot draw instead of silently falling back to another typeface (Vietnamese diacritics).
import { readFileSync } from "node:fs";

function subtableCovers(buf, off) {
  const format = buf.readUInt16BE(off);
  if (format === 4) {
    const segX2 = buf.readUInt16BE(off + 6);
    const endOff = off + 14;
    const startOff = endOff + segX2 + 2;
    const deltaOff = startOff + segX2;
    const rangeOff = deltaOff + segX2;
    return (cp) => {
      if (cp > 0xffff) return false;
      for (let i = 0; i < segX2; i += 2) {
        if (buf.readUInt16BE(endOff + i) < cp) continue;
        if (buf.readUInt16BE(startOff + i) > cp) return false;
        const ro = buf.readUInt16BE(rangeOff + i);
        const delta = buf.readInt16BE(deltaOff + i);
        if (ro === 0) return ((cp + delta) & 0xffff) !== 0;
        const pos =
          rangeOff + i + ro + 2 * (cp - buf.readUInt16BE(startOff + i));
        if (pos + 2 > buf.length) return false;
        const g = buf.readUInt16BE(pos);
        return g !== 0 && ((g + delta) & 0xffff) !== 0;
      }
      return false;
    };
  }
  if (format === 12) {
    const n = buf.readUInt32BE(off + 12);
    return (cp) => {
      for (let i = 0; i < n; i++) {
        const g = off + 16 + i * 12;
        if (cp >= buf.readUInt32BE(g) && cp <= buf.readUInt32BE(g + 4))
          return true;
      }
      return false;
    };
  }
  return null;
}

/** Returns `(codePoint) => boolean` for the font file. */
export function fontCoverage(file) {
  const buf = readFileSync(file);
  const numTables = buf.readUInt16BE(4);
  let cmap = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString("latin1", rec, rec + 4) === "cmap")
      cmap = buf.readUInt32BE(rec + 8);
  }
  if (cmap < 0) throw new Error(`${file}: no cmap table`);
  const count = buf.readUInt16BE(cmap + 2);
  const checks = [];
  for (let i = 0; i < count; i++) {
    const rec = cmap + 4 + i * 8;
    const check = subtableCovers(buf, cmap + buf.readUInt32BE(rec + 4));
    if (check) checks.push(check);
  }
  if (checks.length === 0) throw new Error(`${file}: unsupported cmap format`);
  return (cp) => checks.some((c) => c(cp));
}

/** Characters of `text` that `file` cannot draw (control characters and newlines are ignored). */
export function missingGlyphs(file, text) {
  const has = fontCoverage(file);
  const missing = new Set();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < 0x20 || cp === 0x7f) continue;
    if (!has(cp)) missing.add(ch);
  }
  return [...missing];
}
