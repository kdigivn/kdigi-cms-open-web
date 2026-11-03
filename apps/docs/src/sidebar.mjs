import reference from './reference.json' with { type: 'json' };

/**
 * Sidebar tường minh, chia theo khu vực tài liệu (tab trên header). Nhãn tiếng Việt là gốc,
 * `en` là bản dịch cho locale `/en/`.
 *
 * Khu vực: Hướng dẫn · Di chuyển WordPress · API · Tham khảo kỹ thuật. Thêm khu vực = thêm một phần tử `topics`.
 *
 * Mỗi trang tiếng Việt trong `src/content/docs/` PHẢI xuất hiện đúng một lần ở đây; trang tiếng Anh
 * nằm cùng đường dẫn dưới `en/` và dùng chung mục sidebar. `scripts/check-docs.mjs` import file này
 * và báo trang mồ côi / slug không tồn tại / bản dịch không có trang gốc.
 * File này không import gì của Astro để script Node đọc được.
 *
 * Khu "Tham khảo kỹ thuật" là bản sao tài liệu `docs/` của repo kdigi-cms-open (chủ yếu tiếng Anh), do
 * `scripts/sync-docs.mjs` sinh ra cùng `src/reference.json`; không sửa tay các trang đó.
 */

/** Trang theo slug; `label`/`en` ghi đè tiêu đề trang khi nhãn sidebar cần ngắn hơn. */
const page = (slug, label, en) => (label ? { slug, label, translations: { en } } : { slug });

/** Nhóm trang có nhãn hai thứ tiếng. */
const group = (label, en, items) => ({ label, translations: { en }, items });

/** Đường dẫn (không tiền tố locale) của trang đầu khu tham khảo. */
export const referenceHome = `/${reference[0].slug}/`;

export const topics = [
  {
    label: { vi: 'Hướng dẫn', en: 'Guides' },
    link: '/huong-dan/bat-dau-nhanh/',
    icon: 'open-book',
    items: [
      group('Bắt đầu', 'Get started', [
        page('index', 'Giới thiệu', 'Introduction'),
        page('huong-dan/bat-dau-nhanh', 'Bắt đầu nhanh', 'Quick start'),
        page('huong-dan/cai-dat-docker', 'Tự host bằng Docker', 'Self-host with Docker'),
        page('huong-dan/trien-khai-coolify', 'Triển khai trên Coolify', 'Deploy on Coolify'),
      ]),
      group('Tính năng', 'Features', [
        page('huong-dan/nhieu-website', 'Nhiều website', 'Multiple sites'),
        page('huong-dan/soan-thao-markdown', 'Soạn thảo Markdown', 'Markdown editor'),
        page('huong-dan/seo-json-ld', 'SEO và JSON-LD', 'SEO and JSON-LD'),
        page('huong-dan/thu-vien-media', 'Thư viện media', 'Media library'),
        page('huong-dan/vai-tro-phan-quyen', 'Vai trò và phân quyền', 'Roles and permissions'),
      ]),
    ],
  },
  {
    label: { vi: 'Di chuyển WordPress', en: 'WordPress migration' },
    link: '/wordpress/di-chuyen-tu-wordpress/',
    icon: 'right-caret',
    items: [group('Di chuyển', 'Migrate', [page('wordpress/di-chuyen-tu-wordpress', 'Di chuyển từ WordPress', 'Migrate from WordPress')])],
  },
  {
    label: { vi: 'API', en: 'API' },
    link: '/api/rest-graphql/',
    icon: 'laptop',
    items: [group('Headless', 'Headless', [page('api/rest-graphql', 'REST và GraphQL', 'REST and GraphQL')])],
  },
  {
    id: 'reference',
    label: { vi: 'Tham khảo kỹ thuật', en: 'Technical reference' },
    // Link không có tiền tố locale: plugin tự thêm `/en` ở locale tiếng Anh; ở tiếng Việt, `astro.config.mjs` chuyển hướng sang bản `/en/`.
    link: referenceHome,
    icon: 'document',
    items: [
      group(
        'Tài liệu của repo',
        'Repository docs',
        // Trang tiếng Anh nằm ở `/en/tham-khao/…`; dùng link thay vì slug để cả hai locale trỏ tới cùng một trang.
        reference.map(({ slug, title }) => ({ label: title, link: `/en/${slug}/` })),
      ),
    ],
  },
];
