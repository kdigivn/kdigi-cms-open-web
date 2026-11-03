/**
 * rehype-figure — biến ảnh đứng riêng một đoạn thành <figure> có chú thích.
 *
 * Markdown `![Chú thích](../../assets/x.webp)` đứng riêng một dòng sinh ra
 * `<p><img alt="Chú thích"></p>`. Alt text không hiển thị trên trang, nên người
 * đọc không biết ảnh minh hoạ điều gì. Plugin đổi thành:
 *
 *   <figure class="hd-figure">
 *     <img …>
 *     <figcaption>Chú thích</figcaption>
 *   </figure>
 *
 * Bấm vào ảnh mở ảnh đầy đủ ở tab mới (script ở src/components/Head.astro) — URL ảnh đã
 * tối ưu chỉ có sau khi Astro xử lý, nên không dựng thẻ <a> ở đây.
 * Ảnh nằm lẫn trong câu văn (inline) giữ nguyên.
 */

function isWhitespace(node) {
  return node.type === 'text' && node.value.trim() === '';
}

function soleImage(paragraph) {
  const meaningful = paragraph.children.filter((child) => !isWhitespace(child));
  if (meaningful.length !== 1) return null;
  const [only] = meaningful;
  return only.type === 'element' && only.tagName === 'img' ? only : null;
}

function toFigure(img) {
  const alt = typeof img.properties?.alt === 'string' ? img.properties.alt.trim() : '';
  // Trang hướng dẫn có nhiều ảnh chụp màn hình; tải lười để trang mở nhanh.
  img.properties = { ...img.properties, loading: 'lazy', decoding: 'async' };
  const children = [img];
  if (alt) {
    children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] });
  }
  return { type: 'element', tagName: 'figure', properties: { className: ['hd-figure'] }, children };
}

function transform(node) {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.map((child) => {
    if (child.type === 'element' && child.tagName === 'p') {
      const img = soleImage(child);
      if (img) return toFigure(img);
    }
    transform(child);
    return child;
  });
}

export default function rehypeFigure() {
  return (tree) => transform(tree);
}
