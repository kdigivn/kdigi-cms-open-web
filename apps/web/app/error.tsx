"use client"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
      <h1 className="t-h2">Trang tạm thời không tải được</h1>
      <p className="mt-3 text-muted-foreground">Máy chủ nội dung đang bận. Bạn thử lại sau ít phút nhé.</p>
      <Button variant="brand" className="mt-6" onClick={reset}>
        Thử lại
      </Button>
    </main>
  )
}
