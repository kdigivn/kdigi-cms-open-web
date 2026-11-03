import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { topics } from '../sidebar.mjs';

/**
 * /llms.txt — mục lục tài liệu cho trình đọc của mô hình ngôn ngữ (llmstxt.org).
 *
 * Sinh từ `src/sidebar.mjs` và collection `docs` ở lúc build nên không lệch khi thêm/bớt trang:
 * thứ tự và nhóm lấy từ sidebar, tiêu đề và mô tả lấy từ frontmatter. Link trỏ tới markdown thô
 * (`src/pages/[...slug].md.ts`). Tiếng Việt trước, sau đó bản tiếng Anh cho trang đã dịch.
 */
type SidebarItem = { slug?: string; items?: SidebarItem[] };
type Lang = 'vi' | 'en';

function slugsOf(items: SidebarItem[]): string[] {
  return items.flatMap((item) => (item.slug ? [item.slug] : slugsOf(item.items ?? [])));
}

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://docs.opencms.kdigi.vn')).origin;
  const entries = new Map((await getCollection('docs')).map((entry) => [entry.id, entry]));

  const section = (lang: Lang) =>
    topics.flatMap((topic) => {
      const lines = slugsOf(topic.items as SidebarItem[]).flatMap((slug) => {
        // Slug sidebar → id trong collection: `index` → `index` / `en`, `a/b` → `a/b` / `en/a/b`.
        const id = lang === 'vi' ? slug : slug === 'index' ? 'en' : `en/${slug}`;
        const entry = entries.get(id);
        if (!entry) return [];
        return [`- [${entry.data.title}](${origin}/${id}.md): ${entry.data.description ?? ''}`.trimEnd()];
      });
      return lines.length ? [`## ${topic.label[lang]}\n\n${lines.join('\n')}`] : [];
    });

  const english = section('en');
  const reference = [...entries.values()]
    .filter((entry) => entry.id.startsWith('en/tham-khao/'))
    .map((entry) => `- [${entry.data.title}](${origin}/${entry.id}.md): ${entry.data.description ?? ''}`.trimEnd());
  const body = `# KDIGI CMS

> KDIGI CMS is an AI-native, open-source (MIT) headless multi-site CMS built on Payload, Next.js and PostgreSQL: a built-in MCP server and the kcms CLI let AI agents (Claude Code, Codex, Cursor, VS Code, OMP) write, publish and SEO-check content with a user's API key and role; Markdown editor, SEO and JSON-LD, media library, roles, WordPress migration, REST/GraphQL, self-hosted with Docker or Coolify. Website: https://opencms.kdigi.vn · Source: https://github.com/kdigivn/kdigi-cms-open

${section('vi').join('\n\n')}
${english.length ? `\n# English\n\n${english.join('\n\n')}\n` : ''}${reference.length ? `\n## Technical reference (English)\n\n${reference.join('\n')}\n` : ''}`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
