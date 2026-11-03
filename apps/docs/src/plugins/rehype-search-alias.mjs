/**
 * rehype-search-alias — bổ sung từ khoá không dấu cho chữ "đ" vào chỉ mục tìm kiếm.
 *
 * Pagefind bỏ dấu thanh/dấu mũ khi lập chỉ mục và khi tìm ("hoa" khớp "hoá"), nhưng KHÔNG đổi
 * "đ" thành "d" (U+0111 không phân rã trong Unicode). Vì vậy gõ "dang nhap" không ra
 * "Đăng nhập". Plugin này gom mọi từ có "đ" trong bài, bỏ dấu hoàn toàn, rồi thêm một
 * <span hidden> ở cuối bài; Pagefind lập chỉ mục chữ trong đó nên "dau", "don", "dong bo" khớp.
 *
 * Tiêu đề trang được xử lý riêng ở src/components/PageTitle.astro (cùng hàm `foldVietnamese`).
 * Xem DESIGN.md §Tìm kiếm.
 */

/** Bỏ dấu tiếng Việt, gồm cả đ/Đ; giữ chữ thường. */
export function foldVietnamese(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function collectText(node, out) {
  if (node.type === 'text') out.push(node.value);
  if (node.type === 'element' && (node.tagName === 'pre' || node.tagName === 'code')) return;
  if (Array.isArray(node.children)) for (const child of node.children) collectText(child, out);
}

export default function rehypeSearchAlias() {
  return (tree) => {
    const chunks = [];
    collectText(tree, chunks);
    const words = new Set();
    for (const word of chunks.join(' ').split(/[^\p{L}\p{M}\p{N}]+/u)) {
      if (/[đĐ]/.test(word)) words.add(foldVietnamese(word));
    }
    if (words.size === 0) return;
    tree.children.push({
      type: 'element',
      tagName: 'span',
      properties: { hidden: true, className: ['hd-search-alias'] },
      children: [{ type: 'text', value: [...words].join(' ') }],
    });
  };
}
