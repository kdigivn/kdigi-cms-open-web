import { ArrowRight, Check, CloudDownload, Database, ShieldCheck, WandSparkles, X } from "lucide-react"

import { Illustration } from "@/components/brand/illustration"
import { ButtonLink } from "@/components/ui/button"
import { docsLinks } from "@/lib/site"

import { Container } from "../section"

const STEPS = [
  { icon: CloudDownload, title: "Tải bản chụp", text: "Kéo nội dung từ WordPress qua WPGraphQL hoặc REST API, giữ một bản gốc không sửa." },
  { icon: WandSparkles, title: "Chuẩn hoá", text: "Bài viết, trang, danh mục, thẻ, menu, tác giả và bình luận thành JSON dễ đọc." },
  { icon: ShieldCheck, title: "Duyệt và khoá", text: "Bạn sửa tay, chạy kiểm tra, rồi khoá. Chưa khoá thì chưa ghi gì vào cơ sở dữ liệu." },
  { icon: Database, title: "Nhập vào CMS", text: "Chạy lại được, có chế độ chạy thử, tự sao lưu cơ sở dữ liệu trước khi ghi." },
]

const MOVES = ["Bài viết, trang, danh mục, thẻ", "Ảnh trong thư viện media", "SEO của Yoast và RankMath", "Menu, tác giả, bình luận", "Redirect 301 từ đường dẫn cũ", "Sản phẩm WooCommerce (tuỳ chọn)"]
const STAYS = ["Giao diện (theme) và plugin", "Cấu hình form", "Tài khoản đăng nhập WordPress", "Nội dung do page builder lưu ngoài bài viết"]

export function Migration() {
  return (
    <section id="wordpress" aria-labelledby="wordpress-title" className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div>
            <p className="eyebrow mb-3">Chuyển từ WordPress</p>
            <h2 id="wordpress-title" className="t-h2">
              Chuyển site WordPress mà không mất bài, ảnh và thứ hạng SEO
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              Quy trình nhập tám giai đoạn cho site WordPress. Bạn xem kết quả trước khi ghi, không phải cầu may rồi dọn lỗi.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <span className="mb-3 flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary-strong">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">Bước {index + 1}</span>
                  </span>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mx-auto w-full max-w-[560px]">
            <Illustration name="scene-migrate" sizes="(min-width: 1024px) 520px, 90vw" className="float-idle" />
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Được chuyển sang</h3>
            <ul className="space-y-2">
              {MOVES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Không chuyển, bạn dựng lại</h3>
            <ul className="space-y-2">
              {STAYS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-muted-foreground">
                  <X className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <ButtonLink href={docsLinks.wordpress} variant="outline" size="lg">
            Đọc hướng dẫn chuyển từ WordPress
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
