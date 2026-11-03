import type { Metadata } from "next"

import { ButtonLink } from "@/components/ui/button"

export const metadata: Metadata = { title: "Không tìm thấy trang", robots: { index: false } }

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow mb-3">Lỗi 404</p>
      <h1 className="t-h2">Không tìm thấy trang này</h1>
      <p className="mt-3 text-muted-foreground">Đường dẫn có thể đã đổi hoặc bài viết đã bị gỡ.</p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/" variant="brand">
          Về trang chủ
        </ButtonLink>
        <ButtonLink href="/blog" variant="outline">
          Xem blog
        </ButtonLink>
      </div>
    </main>
  )
}
