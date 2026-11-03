import { ArrowRight, Check } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { docsLinks } from "@/lib/site"
import { cn } from "@/lib/utils"

import { Container } from "../section"
import { Shot, type ShotName } from "../shot"

type Feature = {
  id: string
  eyebrow: string
  title: string
  text: string
  points: string[]
  shot: ShotName
  shotAlt: string
  shotUrl: string
  docs: { label: string; href: string }
}

const FEATURES: Feature[] = [
  {
    id: "nhieu-website",
    eyebrow: "Nhiều website",
    title: "Quản lý nhiều website mà nội dung không lẫn vào nhau",
    text: "Mỗi website là một site riêng, có tên miền, ngôn ngữ và thương hiệu riêng. Cả đội làm việc trong cùng một trang quản trị.",
    points: [
      "Nội dung, menu và người dùng tách theo từng site",
      "Mỗi site khai báo tên miền của frontend để CMS báo làm mới khi có thay đổi",
      "Thêm site mới không cần khởi động lại hay triển khai lại CMS",
    ],
    shot: "sites",
    shotAlt: "Danh sách các website trong KDIGI CMS, mỗi website có khoá và tên miền riêng",
    shotUrl: "app.opencms.kdigi.vn/admin/collections/sites",
    docs: { label: "Tìm hiểu nhiều website", href: docsLinks.multiSite },
  },
  {
    id: "soan-thao",
    eyebrow: "Soạn thảo",
    title: "Soạn bài bằng Markdown ngay trong trình quản trị",
    text: "Trình soạn thảo Milkdown hiển thị kết quả khi bạn gõ. Bài lưu dạng Markdown, API trả về HTML đã làm sạch.",
    points: [
      "Shortcode dùng lại các đoạn nội dung giữa nhiều bài",
      "Bản nháp, lên lịch đăng và lịch sử phiên bản",
      "Xoá vào thùng rác, khôi phục khi cần",
    ],
    shot: "editor",
    shotAlt: "Trình soạn thảo Markdown của KDIGI CMS đang mở một bài viết",
    shotUrl: "app.opencms.kdigi.vn/admin/collections/posts",
    docs: { label: "Xem hướng dẫn soạn thảo", href: docsLinks.markdown },
  },
  {
    id: "seo",
    eyebrow: "SEO",
    title: "SEO và JSON-LD có sẵn, không cần cài plugin",
    text: "Tiêu đề, mô tả và Open Graph sinh theo mẫu bạn đặt. Dữ liệu có cấu trúc JSON-LD được tạo mỗi khi bài lưu.",
    points: [
      "Đổi đường dẫn bài thì CMS tự tạo redirect 301",
      "Ảnh Open Graph lấy từ ảnh đại diện hoặc ảnh mặc định của site",
      "Công cụ kiểm tra SEO cho cả website",
    ],
    shot: "seo",
    shotAlt: "Thẻ SEO của một bài viết với bản xem trước kết quả tìm kiếm và JSON-LD",
    shotUrl: "app.opencms.kdigi.vn/admin/collections/posts",
    docs: { label: "Xem hướng dẫn SEO", href: docsLinks.seo },
  },
  {
    id: "media",
    eyebrow: "Thư viện media",
    title: "Thư viện media gọn gàng, lưu ở nơi bạn chọn",
    text: "Tải ảnh lên một lần, dùng lại ở mọi bài. Mỗi website chọn nơi lưu riêng.",
    points: [
      "Lưu trên ổ đĩa của máy chủ, hoặc Cloudflare R2 theo từng website",
      "Văn bản thay thế (alt) cho từng ảnh",
      "Kích thước ảnh được ghi vào HTML, trang không bị nhảy khi tải",
    ],
    shot: "media",
    shotAlt: "Thư viện media của KDIGI CMS dạng lưới ảnh",
    shotUrl: "app.opencms.kdigi.vn/admin/collections/media",
    docs: { label: "Xem hướng dẫn media", href: docsLinks.media },
  },
  {
    id: "phan-quyen",
    eyebrow: "Phân quyền",
    title: "Phân quyền theo vai trò và theo từng website",
    text: "Bốn vai trò, mỗi người chỉ thấy và sửa được website được giao.",
    points: [
      "Super-admin, admin, editor và author với quyền khác nhau",
      "Người dùng gắn với danh sách website; website khác không hiện ra",
      "Khoá API riêng cho tích hợp, tách khỏi tài khoản đăng nhập",
    ],
    shot: "roles",
    shotAlt: "Màn hình người dùng với vai trò và danh sách website được phép truy cập",
    shotUrl: "app.opencms.kdigi.vn/admin/collections/users",
    docs: { label: "Xem hướng dẫn phân quyền", href: docsLinks.roles },
  },
  {
    id: "api",
    eyebrow: "Headless",
    title: "REST và GraphQL cho bất kỳ frontend nào",
    text: "Website của bạn gọi API công khai, không cần đăng nhập, và chỉ nhận nội dung đã xuất bản.",
    points: [
      "Lọc theo website, ngôn ngữ, trang và sắp xếp",
      "Nội dung Markdown trả về HTML đã làm sạch",
      "Webhook làm mới frontend ngay khi bạn bấm đăng",
    ],
    shot: "api",
    shotAlt: "Phản hồi JSON của API bài viết trong KDIGI CMS",
    shotUrl: "app.opencms.kdigi.vn/api/posts",
    docs: { label: "Xem tài liệu API", href: docsLinks.api },
  },
]

/** One block per feature: copy beside a real screenshot of the admin, alternating sides on desktop. */
export function Features() {
  return (
    <section id="tinh-nang" aria-labelledby="tinh-nang-title" className="py-16 md:py-24">
      <Container>
        <header className="mx-auto mb-12 max-w-3xl text-center md:mb-20">
          <p className="eyebrow mb-3">Tính năng</p>
          <h2 id="tinh-nang-title" className="t-h2">
            Mọi thứ một website nội dung cần, trong một trang quản trị
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Ảnh dưới đây chụp từ bản KDIGI CMS đang chạy thật, không phải ảnh minh hoạ.
          </p>
        </header>

        <div className="space-y-16 md:space-y-24">
          {FEATURES.map((feature, index) => (
            <article key={feature.id} id={feature.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={cn(index % 2 === 1 && "lg:order-2")}>
                <p className="eyebrow mb-3">{feature.eyebrow}</p>
                <h3 className="font-display text-[26px] leading-tight font-bold tracking-tight md:text-[30px]">{feature.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">{feature.text}</p>
                <ul className="mt-5 space-y-2.5">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[15.5px] leading-relaxed">
                      <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={feature.docs.href} variant="ghost" className="mt-5 -ml-3 text-primary-strong">
                  {feature.docs.label}
                  <ArrowRight aria-hidden="true" />
                </ButtonLink>
              </div>
              <div className={cn(index % 2 === 1 && "lg:order-1")}>
                <Shot name={feature.shot} alt={feature.shotAlt} url={feature.shotUrl} sizes="(min-width: 1024px) 560px, 100vw" />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
