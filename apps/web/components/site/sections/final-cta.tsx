import { ArrowRight } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { docsLinks } from "@/lib/site"

import { Container } from "../section"

/** Closing band: dark navy, one brand action (demo) and two quiet ones. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="py-16 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center text-ink-foreground md:px-12 md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -top-28 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="cta-title" className="t-h2">
              Sẵn sàng gom các website về một chỗ?
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">
              Mở bản demo để xem trang quản trị, hoặc cài bản của riêng bạn trong vài phút.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/#demo" variant="brand" size="lg">
                Dùng thử demo
              </ButtonLink>
              <ButtonLink href={docsLinks.quickstart} variant="outline" size="lg" className="border-white/30 bg-transparent text-ink-foreground hover:bg-white/10">
                Bắt đầu nhanh
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
