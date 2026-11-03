import { ArrowRight, Scale, GitPullRequest, Server } from "lucide-react"

import { Illustration } from "@/components/brand/illustration"
import { ButtonLink } from "@/components/ui/button"
import { GITHUB_URL } from "@/lib/site"

import { GitHubIcon } from "../icons"
import { Container } from "../section"

const POINTS = [
  { icon: Scale, title: "Giấy phép MIT", text: "Dùng cho dự án cá nhân hay thương mại, sửa và triển khai tự do." },
  { icon: Server, title: "Xây trên nền quen thuộc", text: "Payload 3, Next.js và PostgreSQL. Đội dev nào biết TypeScript cũng đọc được mã." },
  { icon: GitPullRequest, title: "Mở cho đóng góp", text: "Báo lỗi, góp ý hoặc gửi pull request trên GitHub. KDIGI duy trì và phát hành bản vá." },
]

export function OpenSource() {
  return (
    <section id="ma-nguon-mo" aria-labelledby="ma-nguon-mo-title" className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div>
            <p className="eyebrow mb-3">Mã nguồn mở</p>
            <h2 id="ma-nguon-mo-title" className="t-h2">
              Mã nguồn công khai trên GitHub, giấy phép MIT
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              Toàn bộ CMS, trình nhập WordPress và tài liệu nằm trong một kho mã. Bạn đọc được cách nó hoạt động trước khi tin nó.
            </p>
            <ul className="mt-7 space-y-5">
              {POINTS.map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <point.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{point.title}</h3>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">{point.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={GITHUB_URL} variant="default" size="lg" external>
                <GitHubIcon />
                Xem trên GitHub
              </ButtonLink>
              <ButtonLink href={`${GITHUB_URL}/blob/main/LICENSE`} variant="ghost" size="lg" external>
                Đọc giấy phép
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[520px]">
            <Illustration name="scene-opensource" sizes="(min-width: 1024px) 480px, 90vw" className="float-idle" />
          </div>
        </div>
      </Container>
    </section>
  )
}
