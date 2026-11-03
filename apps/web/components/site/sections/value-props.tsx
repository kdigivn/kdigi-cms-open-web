import { Boxes, DatabaseZap, FileSearch, Repeat2 } from "lucide-react"

import { Container } from "../section"

const ITEMS = [
  { icon: Boxes, title: "Nhiều website, một nơi", text: "Mỗi website là một site riêng với nội dung, người dùng và cấu hình riêng, nhưng chung một trang quản trị." },
  { icon: FileSearch, title: "SEO có sẵn", text: "Tiêu đề, mô tả, Open Graph và JSON-LD tự sinh theo mẫu, kèm công cụ kiểm tra SEO cho cả site." },
  { icon: Repeat2, title: "Chuyển từ WordPress", text: "Nhập bài viết, ảnh, SEO, menu và redirect qua quy trình có bước duyệt trước khi ghi." },
  { icon: DatabaseZap, title: "API cho mọi frontend", text: "REST và GraphQL công khai, nội dung Markdown trả về HTML sạch. Frontend nào cũng gọi được." },
]

/** Four short value props right under the hero. */
export function ValueProps() {
  return (
    <section aria-label="Điểm nổi bật" className="py-6 md:py-10">
      <Container>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <li key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
