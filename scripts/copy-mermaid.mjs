import { copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const source = require.resolve('mermaid/dist/mermaid.min.js');
const target = path.resolve('public/mermaid.min.js');
await copyFile(source, target);
