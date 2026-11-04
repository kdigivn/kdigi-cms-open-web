import { ArrowUpRight, History, Lock, Users } from "lucide-react"

import { Illustration } from "@/components/brand/illustration"
import { ButtonLink } from "@/components/ui/button"
import { DEMO, SHOWCASE_SITES } from "@/lib/site"

import { CopyButton } from "../copy-button"
import { Container } from "../section"

const RULES = [
  { icon: Users, text: "Dùng chung cho mọi người, đừng nhập dữ liệu riêng tư." },
  { icon: Lock, text: "Chỉ vào được website demo; không tạo được người dùng, không đổi được mật khẩu." },
  { icon: History, text: "Nội dung được đặt lại mỗi đêm, bài bạn viết không được giữ lại." },
]

function Credential({ label, value, copyLabel }: { label: string; value: string; copyLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-input bg-card py-1.5 pr-1.5 pl-4">
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate font-mono text-[15px] font-medium select-all">{value}</dd>
      </div>
      <CopyButton value={value} label={copyLabel} />
    </div>
  )
}

export function Demo() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="py-16 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-lg md:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-14">
            <div>
              <p className="eyebrow mb-3">Demo trực tuyến</p>
              <h2 id="demo-title" className="t-h2">
                Thử ngay trên bản chạy thật, không cần cài gì
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                Đăng nhập bằng tài khoản biên tập viên dưới đây để viết bài, tải ảnh và chỉnh SEO.
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <Credential label="Email" value={DEMO.email} copyLabel="email demo" />
                <Credential label="Mật khẩu" value={DEMO.password} copyLabel="mật khẩu demo" />
              </dl>

              <div className="mt-6">
                <ButtonLink href={DEMO.adminUrl} variant="brand" size="lg" external>
                  Mở trang quản trị demo
                  <ArrowUpRight aria-hidden="true" />
                </ButtonLink>
              </div>

              <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                {RULES.map((rule) => (
                  <li key={rule.text} className="flex items-start gap-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary-strong">
                      <rule.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="pt-1">{rule.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-semibold">Website mẫu: sáu framework, cùng một nội dung</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  Cùng một site trong KDIGI CMS, đọc qua REST API và dựng bằng sáu framework với giao diện như nhau.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {SHOWCASE_SITES.map((site) => (
                    <li key={site.framework}>
                      <ButtonLink href={site.url} variant="outline" external>
                        {site.framework}
                        <ArrowUpRight aria-hidden="true" />
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative mx-auto grid w-full max-w-[420px] place-items-center">
              <Illustration name="icon-demo" sizes="260px" className="float-idle w-[min(260px,70%)]" />
              <Illustration name="icon-key" sizes="120px" decorative className="absolute right-2 bottom-0 w-[28%] min-w-20" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
