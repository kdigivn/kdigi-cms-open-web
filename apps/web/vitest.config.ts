import path from "node:path"
import { defineConfig } from "vitest/config"

// Pure logic only (CMS response parsing, secret check). Layout and behaviour are checked in a browser, not in jsdom.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
})
