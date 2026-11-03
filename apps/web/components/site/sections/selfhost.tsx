import { ArrowRight } from "lucide-react"

import { Illustration } from "@/components/brand/illustration"
import { ButtonLink } from "@/components/ui/button"
import { docsLinks } from "@/lib/site"

import { CopyButton } from "../copy-button"
import { Container } from "../section"

const COMMANDS = [
  "git clone https://github.com/kdigivn/kdigi-cms-open.git",
  "cd kdigi-cms-open",
  "SEED_DEMO=true docker compose up --build",
]

const POINTS = [
  { title: "Một lệnh là chạy", text: "Docker Compose dựng sẵn ứng dụng và PostgreSQL. Cờ SEED_DEMO nạp một site mẫu để bạn có gì đó để xem ngay." },
  { title: "Triển khai trên Coolify", text: "Có tệp docker-compose.coolify.yml sẵn cho Coolify; chạy trên máy chủ của bạn, dữ liệu nằm ở nhà bạn." },
  { title: "Không khoá nhà cung cấp", text: "Mã nguồn MIT, dữ liệu trong PostgreSQL, ảnh để ở ổ đĩa hoặc Cloudflare R2 theo từng website." },
]

export function SelfHost() {
  const script = COMMANDS.join("\n")
  return (
    <section id="tu-host" aria-labelledby="tu-host-title" className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-14">
          <div className="order-2 mx-auto w-full max-w-[560px] lg:order-1">
            <Illustration name="scene-selfhost" sizes="(min-width: 1024px) 520px, 90vw" className="float-idle" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow mb-3">Tự host</p>
            <h2 id="tu-host-title" className="t-h2">
              Chạy trên máy chủ của bạn bằng Docker
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              KDIGI CMS không có bản thuê bao. Bạn tự cài, tự giữ dữ liệu, và cập nhật khi muốn.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink text-ink-foreground shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-ink-muted">
                <span>Terminal</span>
                <span className="text-ink-foreground [&_button]:text-ink-foreground [&_button:hover]:bg-white/10">
                  <CopyButton value={script} label="các lệnh cài đặt" />
                </span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[13.5px] leading-7" tabIndex={0}>
                <code>
                  {COMMANDS.map((line) => (
                    <span key={line} className="block whitespace-pre">
                      <span className="select-none text-code-comment">$ </span>
                      {line}
                    </span>
                  ))}
                </code>
              </pre>
            </div>

            <ul className="mt-6 space-y-4">
              {POINTS.map((point) => (
                <li key={point.title}>
                  <h3 className="text-base font-semibold">{point.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{point.text}</p>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={docsLinks.docker} variant="outline" size="lg">
                Cài bằng Docker
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href={docsLinks.coolify} variant="ghost" size="lg">
                Triển khai trên Coolify
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
