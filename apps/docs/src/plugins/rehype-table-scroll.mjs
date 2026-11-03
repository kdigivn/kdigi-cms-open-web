/**
 * rehype-table-scroll — bọc mỗi <table> trong `<div class="hd-table-scroll">`.
 *
 * Bảng Starlight mặc định là `display: block; overflow: auto`: hộp chứa cuộn được nhưng bảng
 * bên trong co theo nội dung, nên nền hàng tiêu đề không phủ hết bề rộng khung. Bọc div cho
 * phép bảng dùng `width: 100%` bình thường và vẫn cuộn ngang trên màn hình hẹp (xem content.css).
 * Script ở src/components/Head.astro gắn `tabindex="0"` cho div khi nó thực sự tràn, để bàn phím cuộn được.
 */

function wrap(node) {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.map((child) => {
    if (child.type === 'element' && child.tagName === 'table') {
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['hd-table-scroll'] },
        children: [child],
      };
    }
    wrap(child);
    return child;
  });
}

export default function rehypeTableScroll() {
  return (tree) => wrap(tree);
}
