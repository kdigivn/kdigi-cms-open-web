#!/usr/bin/env node
/**
 * check-mermaid.mjs — cổng chặn cú pháp Mermaid cho site tài liệu
 *
 * Bối cảnh: trên site tài liệu nguồn (mermaid 11.17.2) từng có 23/137 khối vỡ trên production
 * ("Syntax error in text"). Các luật dưới đây được giữ lại vì mỗi luật ứng với một lỗi
 * parse THẬT đã đo được, không phải suy đoán.
 *
 * Script này lint tĩnh, không cần trình duyệt, chạy được trong CI.
 * Mỗi luật dưới đây tương ứng một lỗi parse THẬT đã quan sát được.
 *
 * Dùng:  node scripts/check-mermaid.mjs [--json]
 * Exit:  0 sạch · 1 có lỗi
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'src/content/docs');

/** Từ khoá mở đầu một diagram hợp lệ. */
const DIAGRAM_KINDS =
  /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|block(-beta)?|quadrantChart|requirementDiagram|sankey(-beta)?|xychart(-beta)?|C4Context|architecture(-beta)?)\b/;

/** Chỉ thị đứng trước phần thân diagram. */
const PREAMBLE = /^\s*(%%|---|\s*$|config\s*:|title\s*:|accTitle\s*:|accDescr\b)/;

async function walk(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (/\.mdx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/** Tách mọi khối ```mermaid trong một file. */
function extractBlocks(source, file) {
  const lines = source.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^(\s*)```+\s*mermaid\s*$/);
    if (!fence) continue;
    const indent = fence[1];
    const start = i + 1;
    let end = start;
    while (end < lines.length && !new RegExp(`^${indent}\`\`\`+\\s*$`).test(lines[end])) end++;
    blocks.push({ file, startLine: start + 1, lines: lines.slice(start, end) });
    i = end;
  }
  return blocks;
}

/** Bỏ phần nằm trong ngoặc kép để soi ký tự điều khiển "trần". */
function stripQuoted(line) {
  return line.replace(/"[^"]*"/g, '""');
}

function isComment(line) {
  return /^\s*%%/.test(line);
}

const RULES = [
  {
    id: 'entity-in-fence',
    // Chuỗi đi qua 2 lớp decode (Astro escape → textContent → mermaid decode).
    // Entity viết tay sống sót được hay không phụ thuộc vị trí → cấm tuyệt đối.
    test: (line) => {
      const m = line.match(/&(amp|lt|gt|quot|apos|nbsp|#\d+);/);
      return m
        ? `HTML entity "${m[0]}" trong khối mermaid. Chuỗi bị decode nhiều lớp trước khi tới mermaid nên entity là nguồn lỗi "Syntax error in text". Viết ký tự thật, hoặc đổi sang {id} nếu định viết <id>.`
        : null;
    },
  },
  {
    id: 'angle-bracket',
    // Hai tác hại khác nhau:
    //  - ngoài ngoặc kép: "<jwt>" phá grammar của sequenceDiagram → parse error;
    //  - trong ngoặc kép: "Map<K,V>" parse được nhưng htmlLabels coi là thẻ HTML
    //    và NUỐT MẤT khi render.
    // Lối thoát an toàn cho cả hai: mã ký tự mermaid #lt; #gt;, hoặc {id}.
    test: (line) => {
      const scrubbed = line.replace(/<br\s*\/?>/gi, '');
      const m = scrubbed.match(/<[A-Za-z_#][\w.,\s#;-]*>/);
      if (!m) return null;
      const inner = m[0].slice(1, -1);
      return `Dấu ngoặc nhọn "${m[0]}": ngoài ngoặc kép thì phá grammar, trong nhãn thì bị htmlLabels nuốt khi render. Dùng "#lt;${inner}#gt;" hoặc "{${inner}}".`;
    },
  },
  {
    id: 'bare-ampersand',
    // "&" là toán tử nối node; ngoài ngữ cảnh đó nó phá parser.
    test: (line, ctx) => {
      const bare = stripQuoted(line);
      if (!/&/.test(bare)) return null;
      // Hợp lệ: "A & B --> C" trong flowchart (khoảng trắng hai bên).
      if (ctx.kind === 'flowchart' && /\w\s+&\s+\w/.test(bare) && !/\w&\w/.test(bare)) return null;
      return `Dấu "&" trần ngoài ngoặc kép — mermaid hiểu là toán tử nối node. Viết "và", "+", hoặc bọc cả nhãn trong ngoặc kép.`;
    },
  },
  {
    id: 'semicolon-in-label',
    test: (line) => (/;/.test(stripQuoted(line)) ? `Dấu ";" trần — mermaid hiểu là kết thúc câu lệnh. Bọc nhãn trong ngoặc kép.` : null),
  },
  {
    id: 'nested-quote',
    test: (line) =>
      /"[^"]*\\"/.test(line) ? `Nháy kép escape lồng trong nhãn — mermaid không hỗ trợ. Dùng nháy đơn bên trong.` : null,
  },
  {
    id: 'literal-newline-escape',
    test: (line) => (/\\n/.test(line) ? `Chuỗi "\\n" trong nhãn — mermaid in ra nguyên văn, không xuống dòng. Dùng <br/>.` : null),
  },
  {
    id: 'state-id-hyphen',
    // stateDiagram: định danh chỉ nhận [A-Za-z0-9_].
    test: (line, ctx) => {
      if (ctx.kind !== 'stateDiagram') return null;
      const bare = stripQuoted(line).trim();
      if (/^stateDiagram/.test(bare) || /^state\s/.test(bare) || /^note\b/.test(bare) || /^direction\b/.test(bare)) return null;
      const ids = bare
        .split(/-->|:/)[0]
        .trim()
        .split(/\s+/)
        .filter((tok) => /^[A-Za-z_][\w-]*$/.test(tok));
      const offender = ids.find((tok) => tok.includes('-'));
      return offender
        ? `State id "${offender}" chứa dấu gạch ngang — chỉ dùng [A-Za-z0-9_]. Muốn hiện tên có gạch: state "${offender}" as ${offender.replace(/-/g, '_')}.`
        : null;
    },
  },
];

const files = await walk(docsDir);
const findings = [];
let blockCount = 0;

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const block of extractBlocks(source, file)) {
    blockCount++;
    const body = block.lines;
    const header = body.find((l) => !PREAMBLE.test(l) && l.trim() !== '');

    if (!header || !DIAGRAM_KINDS.test(header.trim())) {
      findings.push({
        file: path.relative(root, file),
        line: block.startLine,
        rule: 'unknown-diagram-kind',
        message: `Khối mermaid không bắt đầu bằng loại diagram hợp lệ (thấy: ${JSON.stringify((header || '').trim().slice(0, 40))}).`,
      });
      continue;
    }

    const kindWord = header.trim().split(/\s|-/)[0];
    const ctx = { kind: /^(graph|flowchart)$/.test(kindWord) ? 'flowchart' : kindWord };

    body.forEach((line, idx) => {
      if (isComment(line) || line.trim() === '') return;
      for (const rule of RULES) {
        const message = rule.test(line, ctx);
        if (!message) continue;
        findings.push({
          file: path.relative(root, file),
          line: block.startLine + idx,
          rule: rule.id,
          message,
          snippet: line.trim().slice(0, 100),
        });
        // Entity là lỗi gốc; các luật sau chỉ bắt lại dấu ";" "&" nằm TRONG
        // chính entity đó. Báo một lần cho gọn.
        if (rule.id === 'entity-in-fence') break;
      }
    });
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ files: files.length, blocks: blockCount, findings }, null, 2));
} else if (findings.length) {
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  for (const [file, list] of byFile) {
    console.error(`\n${file}`);
    for (const f of list) {
      console.error(`  ${String(f.line).padStart(4)}  [${f.rule}] ${f.message}`);
      if (f.snippet) console.error(`        ${f.snippet}`);
    }
  }
  const blocksAffected = new Set(findings.map((f) => `${f.file}`)).size;
  console.error(`\nMermaid check FAILED: ${findings.length} lỗi trong ${blocksAffected} file (đã quét ${blockCount} khối / ${files.length} file).`);
  process.exit(1);
}

if (!findings.length) console.log(`Mermaid check passed: ${blockCount} khối trong ${files.length} file.`);
