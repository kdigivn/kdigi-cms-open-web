/**
 * Hàm thuần cho khung bài viết: dựng breadcrumb từ cây sidebar.
 * Không phụ thuộc Astro runtime để dễ kiểm chứng.
 */
import type { StarlightRouteData } from '@astrojs/starlight/route-data';

/** Một mục trong cây sidebar (đã được plugin lọc theo khu vực). */
export type NavEntry = StarlightRouteData['sidebar'][number];

/** Đệ quy: nhánh này có chứa trang đang đọc không? */
function containsCurrent(entries: NavEntry[]): boolean {
  return entries.some((entry) =>
    entry.type === 'link' ? Boolean(entry.isCurrent) : containsCurrent(entry.entries),
  );
}

/**
 * Nhãn các nhóm cha của trang đang đọc, từ ngoài vào trong.
 * Trả `[]` khi trang đang đọc là mục cấp một, `undefined` khi không thấy trang
 * trong cây sidebar.
 */
export function findTrail(entries: NavEntry[]): string[] | undefined {
  for (const entry of entries) {
    if (entry.type === 'link') {
      if (entry.isCurrent) return [];
      continue;
    }
    if (containsCurrent(entry.entries)) {
      return [entry.label, ...(findTrail(entry.entries) ?? [])];
    }
  }
  return undefined;
}
