import { ArrowRight, Bot, GitMerge, History, KeyRound } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { docsLinks } from "@/lib/site"

import { CopyButton } from "../copy-button"
import { Container } from "../section"

const COMMANDS = [
  "npm install -g @kdigi/kcms-cli",
  "export KCMS_API_KEY=change-me",
  "kcms setup claude-code --url https://cms.example.com --write --with-skill",
]

const CLIENTS = ["Claude Code", "Codex", "Cursor", "VS Code", "OMP"]

const POINTS = [
  { icon: Bot, title: "Máy chủ MCP có sẵn", text: "23 công cụ: tìm, viết, hẹn giờ, đăng bài, media, chuyên mục, kiểm tra SEO. Không cần plugin." },
  { icon: KeyRound, title: "Đúng quyền của bạn", text: "Agent dùng API key của một người dùng: cùng vai trò, cùng site. Author vẫn không đăng được bài." },
  { icon: GitMerge, title: "Không ghi đè ai", text: "Mỗi lần sửa kèm mốc updatedAt; có người vừa lưu hoặc đang mở bài thì agent dừng lại." },
  { icon: History, title: "Bản nháp trước, hoàn tác được", text: "Bài mới là bản nháp; thùng rác và lịch sử phiên bản như trong trang quản trị." },
]

/** AI-native: the built-in MCP server and the kcms CLI, right under the value props. */
export function AiAgents() {
  const script = COMMANDS.join("\n")
  return (
    <section id="ai-agent" aria-labelledby="ai-agent-title" className="py-16 md:py-24">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="eyebrow mb-3">AI-native</p>
            <h2 id="ai-agent-title" className="t-h2">
              AI agent viết, sửa và đăng bài ngay trong CMS
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              KDIGI CMS có sẵn máy chủ MCP. Bạn giao việc cho công cụ AI quen dùng, nó làm trên CMS với đúng quyền của tài khoản bạn cấp, còn người biên tập vẫn duyệt trong trang quản trị.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Công cụ AI kết nối được">
              {CLIENTS.map((client) => (
                <li key={client} className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium">
                  {client}
                </li>
              ))}
            </ul>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-ink text-ink-foreground shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-ink-muted">
                <span>Kết nối Claude Code bằng CLI kcms</span>
                <span className="text-ink-foreground [&_button]:text-ink-foreground [&_button:hover]:bg-white/10">
                  <CopyButton value={script} label="các lệnh kết nối AI agent" />
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
            <p className="mt-3 text-sm text-muted-foreground">
              Có từ KDIGI CMS 1.2.0. Tài khoản demo công khai không tạo được API key; thử MCP trên bản tự host.
            </p>
          </div>

          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {POINTS.map((point) => (
                <li key={point.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary-strong">
                    <point.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold">{point.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{point.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/tinh-nang/ai-agent-mcp" variant="outline" size="lg">
                Xem AI agent và MCP
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href={docsLinks.aiAgents} variant="ghost" size="lg">
                Hướng dẫn kết nối
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
