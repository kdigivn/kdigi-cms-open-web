import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** Dòng nhỏ phía trên tiêu đề hero (trang chủ). Xử lý ở `src/components/Hero.astro`. */
        heroEyebrow: z.string().optional(),
        /** Lệnh chạy thử hiện dưới nút của hero. */
        heroCommand: z.string().optional(),
        /** Từ khoá gợi ý "Hay tìm:" dưới ô tìm kiếm của hero. */
        heroChips: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
        /**
         * Trang còn chờ khớp với bản triển khai thật (UI hoặc API chưa xong).
         * `scripts/check-drafts.mjs` liệt kê các trang này; `--release` chặn phát hành khi còn trang nào.
         */
        draft_status: z.enum(['awaiting-implementation']).optional(),
      }),
    }),
  }),
  /**
   * Chuỗi giao diện. Chỉ khai báo khoá site tự thêm (`hd.*`); khoá của
   * Starlight/Pagefind/Expressive Code đã có trong schema nền.
   */
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({
      extend: z.object({
        'hd.sectionNav': z.string(),
        'hd.breadcrumb': z.string(),
        'hd.rootCrumb': z.string(),
        'hd.draftTitle': z.string(),
        'hd.draftBody': z.string(),
        'hd.popularQueries': z.string(),
        'hd.markdownActions': z.string(),
        'hd.copyMarkdown': z.string(),
        'hd.copiedMarkdown': z.string(),
        'hd.copyFailed': z.string(),
        'hd.viewMarkdown': z.string(),
      }),
    }),
  }),
};
