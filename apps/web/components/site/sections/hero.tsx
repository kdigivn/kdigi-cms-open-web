import { ArrowRight } from "lucide-react"

import { Illustration } from "@/components/brand/illustration"
import { ButtonLink } from "@/components/ui/button"
import { docsLinks, GITHUB_URL } from "@/lib/site"

import { GitHubIcon } from "../icons"
import { Container } from "../section"
import { Shot } from "../shot"

/** Hero: promise + two actions on the left, the real admin in a browser frame on the right (LCP), clay scene overlapping its corner. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pt-12 pb-10 md:pt-20 md:pb-16">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] lg:gap-10">
          <div className="text-center lg:text-left">
            <p className="eyebrow mb-4">AI-native · Mã nguồn mở · Giấy phép MIT</p>
            <h1 id="hero-title" className="t-display">
              Một CMS cho mọi website, cả người và AI cùng làm
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              CMS headless AI-native: nhiều website trong một trang quản trị, AI agent viết và đăng bài qua MCP với đúng quyền của bạn, soạn bằng Markdown, SEO và JSON-LD có sẵn, tự host bằng Docker.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <ButtonLink href="/#demo" variant="brand" size="lg">
                Dùng thử demo
              </ButtonLink>
              <ButtonLink href={docsLinks.quickstart} variant="outline" size="lg">
                Bắt đầu nhanh
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-foreground hover:text-primary-strong md:min-h-0"
              >
                <GitHubIcon className="size-4" />
                Mã nguồn trên GitHub
              </a>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span>Payload · Next.js · PostgreSQL</span>
            </p>
          </div>

          <div className="relative">
            <Shot
              name="dashboard"
              alt="Trang quản trị KDIGI CMS: bảng điều khiển với danh sách bài viết, trang và website đang quản lý"
              priority
              sizes="(min-width: 1024px) 700px, 100vw"
            />
            <div className="pointer-events-none absolute -right-3 -bottom-10 hidden w-[34%] min-w-36 sm:block md:-right-6 md:-bottom-14">
              <Illustration name="hero-scene" decorative sizes="240px" className="float-idle drop-shadow-xl" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
