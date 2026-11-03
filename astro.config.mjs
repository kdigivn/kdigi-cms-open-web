import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import rehypeFigure from './src/plugins/rehype-figure.mjs';
import rehypeTableScroll from './src/plugins/rehype-table-scroll.mjs';
import rehypeSearchAlias from './src/plugins/rehype-search-alias.mjs';
import { topics, referenceHome } from './src/sidebar.mjs';

const SITE = 'https://opencms.kdigi.vn';

export default defineConfig({
  site: SITE,
  // Thư mục chỉ là nhóm trong sidebar, không có trang riêng → chuyển về trang gần nhất thay vì 404.
  redirects: {
    '/huong-dan/': '/huong-dan/bat-dau-nhanh/',
    '/wordpress/': '/wordpress/di-chuyen-tu-wordpress/',
    '/api/': '/api/rest-graphql/',
    '/en/huong-dan/': '/en/huong-dan/bat-dau-nhanh/',
    '/en/wordpress/': '/en/wordpress/di-chuyen-tu-wordpress/',
    '/en/api/': '/en/api/rest-graphql/',
    '/tham-khao/': `/en${referenceHome}`,
    '/en/tham-khao/': `/en${referenceHome}`,
    // Tab "Tham khảo kỹ thuật" ở bản tiếng Việt: nội dung chỉ có tiếng Anh nên chuyển sang `/en/`.
    [referenceHome]: `/en${referenceHome}`,
  },
  markdown: {
    // GFM đặt tường minh: @astrojs/mdx lấy `markdown.gfm` làm mặc định, và Astro 6.4 không còn điền
    // giá trị này → bảng trong .mdx không được dựng. Tắt smartypants để dấu nháy/gạch giữ nguyên ở cả .md và .mdx.
    gfm: true,
    smartypants: false,
    // Ảnh đứng riêng một dòng → <figure> có chú thích từ alt text; bảng bọc trong khung cuộn ngang;
    // từ có "đ" được thêm bản không dấu vào chỉ mục tìm kiếm.
    rehypePlugins: [rehypeFigure, rehypeTableScroll, rehypeSearchAlias],
  },
  integrations: [
    starlight({
      title: { vi: 'KDIGI CMS', en: 'KDIGI CMS' },
      description:
        'KDIGI CMS: CMS headless đa website mã nguồn mở (MIT). Soạn thảo Markdown, SEO và JSON-LD, thư viện media, phân quyền, chuyển từ WordPress, REST/GraphQL, tự host bằng Docker/Coolify.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Tiếng Việt', lang: 'vi' },
        en: { label: 'English', lang: 'en' },
      },
      favicon: '/favicon.svg',
      // TOC giữ H2–H3 toàn site.
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      // Ngày cập nhật lấy từ `git log`; build context của CI có thể không có `.git`
      // nên tắt để mọi trang nhất quán.
      lastUpdated: false,
      // Khối mã luôn nền navy đậm (như `.code` ở wireframe) cho cả hai theme.
      expressiveCode: {
        themes: ['github-dark-default'],
        styleOverrides: {
          borderRadius: '14px',
          borderColor: '#1E3160',
          codeBackground: '#07112B',
          codeFontFamily: 'var(--hd-font-mono)',
          codeFontSize: '0.8125rem',
          codeLineHeight: '1.7',
          frames: {
            frameBoxShadowCssValue: 'none',
            editorTabBarBackground: '#0C1A3D',
            editorActiveTabBackground: '#07112B',
            editorActiveTabBorderColor: '#1B55E0',
            terminalTitlebarBackground: '#0C1A3D',
            terminalBackground: '#07112B',
          },
        },
      },
      // Thứ tự quan trọng: font + token trước, rồi từng vùng giao diện.
      // Không dùng Tailwind — xem src/styles/tokens.css và DESIGN.md.
      customCss: [
        './src/styles/ferry-vn.css',
        './src/styles/tokens.css',
        './src/styles/chrome.css',
        './src/styles/content.css',
        './src/styles/landing.css',
      ],
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Sidebar: './src/components/Sidebar.astro',
        PageTitle: './src/components/PageTitle.astro',
        Footer: './src/components/Footer.astro',
        Hero: './src/components/Hero.astro',
        SiteTitle: './src/components/SiteTitle.astro',
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kdigivn/kdigi-cms-open' }],
      head: [
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/favicon.svg' } },
        { tag: 'meta', attrs: { property: 'og:image', content: `${SITE}/og.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'KDIGI CMS' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${SITE}/og.png` } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#1B55E0' } },
        // mermaid.min.js (3,5 MB) KHÔNG nạp sẵn: `public/mermaid-init.js` chỉ tải khi
        // trang thực sự có sơ đồ (nhận biết theo nội dung khối mã).
        { tag: 'script', attrs: { src: '/mermaid-init.js', defer: true } },
      ],
      // Chia sidebar thành các khu vực (Hướng dẫn · API · Webhook · Nhật ký thay đổi)
      // — xem src/sidebar.mjs. Plugin lọc route.sidebar về đúng khu và bó phân trang
      // trong khu đó.
      // Trang `en/tham-khao/**` vào sidebar bằng link (không phải slug) nên gắn vào khu `reference` bằng pattern.
      plugins: [starlightSidebarTopics(topics, { topics: { reference: ['/en/tham-khao/**'] } })],
    }),
    sitemap(),
  ],
});
