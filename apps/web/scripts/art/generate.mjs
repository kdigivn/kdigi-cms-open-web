#!/usr/bin/env node
// Codex image generation + chroma key + WebP export + provenance manifest.
//
//   node scripts/art/generate.mjs [key ...] [--spec scripts/art/specs.json] [--jobs 6] [--force] [--no-gen]
//
// For each spec item: `codex exec` (built-in image_gen, logged-in CLI, no API key) renders a PNG on a flat chroma
// background into scripts/art/raw/<key>.png (gitignored); scripts/art/keyer.py removes the background, adds the soft
// contact shadow, fits the canvas and encodes WebP into public/images/art/<key>.webp within the byte budget.
// Provenance (prompt, tool + version, date, raw + output sha256) goes to public/images/art/_manifest.json.
// Requires: codex >= 0.166 logged in; python with Pillow (PYTHON env, default /root/.venvs/ai-mm/bin/python).
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const WEB = resolve(HERE, '..', '..')
const OUT = join(WEB, 'public', 'images', 'art')
const RAW = join(HERE, 'raw')
const PY = process.env.PYTHON || '/root/.venvs/ai-mm/bin/python'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d)
const valueFlags = new Set(['--spec', '--jobs'])
const keys = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]))
const specPath = resolve(WEB, opt('spec', 'scripts/art/specs.json'))
const jobs = Number(opt('jobs', 6))
const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex')
const codexVersion = execFileSync('codex', ['--version'], { encoding: 'utf8' }).trim()
mkdirSync(RAW, { recursive: true })
mkdirSync(OUT, { recursive: true })

const manifestPath = join(OUT, '_manifest.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

const bg = spec.bg
const prompt = (it) =>
  `${spec.style.replaceAll('{BG}', bg)}. Subject: ${it.subject}.${it.shadow ? ` ${spec.scene}.` : ''} ${spec.notext}`

function codex(it) {
  const png = join(RAW, `${it.key}.png`)
  const p = prompt(it)
  return new Promise((done) => {
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '-s', 'workspace-write',
        `Use your built-in image_gen tool to generate exactly ONE image from the prompt below, then copy the generated PNG file to ${png} and reply with that path only. Prompt: ${p}`],
      { cwd: RAW, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const timer = setTimeout(() => child.kill('SIGKILL'), 900_000)
    child.on('close', () => { clearTimeout(timer); done(existsSync(png) && statSync(png).size > 0) })
  })
}

function process_(it, rawFile) {
  const out = join(OUT, `${it.key}.webp`)
  const [w, h] = it.size
  execFileSync(PY, [join(HERE, 'keyer.py'), rawFile, out, String(w), String(h), String(it.limit_kb * 1024), it.shadow ? '1' : '0'])
  manifest[it.key] = {
    file: `${it.key}.webp`,
    kind: it.kind,
    w, h,
    alt: it.alt,
    bytes: statSync(out).size,
    sha256: sha(out),
    provenance: {
      tool: `codex exec (built-in image_gen) ${codexVersion}`,
      date: new Date(statSync(rawFile).mtime).toISOString().slice(0, 10),
      prompt: it.rawFile ? it.subject : prompt(it),
      rawSha256: sha(rawFile),
      processing: 'scripts/art/keyer.py: chroma flood-fill key, despill, soft navy contact shadow, fit, WebP',
    },
  }
  writeFileSync(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n')
}

const todo = spec.items.filter((it) => keys.length === 0 || keys.includes(it.key))
let next = 0
async function worker() {
  while (next < todo.length) {
    const it = todo[next++]
    const raw = it.rawFile ? resolve(HERE, it.rawFile) : join(RAW, `${it.key}.png`)
    if (!existsSync(raw) || (flag('force') && !it.rawFile)) {
      if (flag('no-gen')) { console.log(`skip ${it.key} (no raw)`); continue }
      console.log(`gen  ${it.key}`)
      if (!(await codex(it))) { console.log(`FAIL ${it.key}`); continue }
    }
    try { process_(it, raw); console.log(`ok   ${it.key} ${manifest[it.key].bytes >> 10} KB`) } catch (e) { console.log(`FAIL ${it.key} keyer: ${e.message}`) }
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, worker))
