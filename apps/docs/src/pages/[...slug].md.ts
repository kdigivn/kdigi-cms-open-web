import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Markdown thô của từng trang cho nút "Sao chép markdown" / "Xem markdown" (`MarkdownActions.astro`)
 * và `llms.txt`. `index` → `/index.md`, `huong-dan/bat-dau` → `/huong-dan/bat-dau.md`, `en` → `/en.md`.
 *
 * Nội dung = tiêu đề + mô tả + thân trang gốc; bỏ dòng `import` và thẻ component tự đóng (`<HomeRoles />`)
 * của MDX vì AI không dựng được chúng.
 */
export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('docs')).map((entry) => ({
    params: { slug: entry.id },
    props: { title: entry.data.title, description: entry.data.description, body: entry.body ?? '' },
  }));

export const GET: APIRoute = ({ props }) => {
  const { title, description, body } = props as { title: string; description?: string; body: string };
  const content = body
    .replace(/^import\s.+\sfrom\s.+;?\n/gm, '')
    .replace(/^[ \t]*<[A-Z][\w.]*(\s[^>]*)?\/>[ \t]*\n/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const lead = description ? `\n\n> ${description}` : '';
  return new Response(`# ${title}${lead}\n\n${content}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
