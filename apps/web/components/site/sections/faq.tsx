import { ChevronDown } from "lucide-react"

import type { FaqGroup } from "@/lib/cms"

import { Section } from "../section"

/** FAQ from the CMS `faqs` collection. Native <details>: keyboard and screen-reader support without client JS. */
export function Faq({ groups }: { groups: FaqGroup[] }) {
  if (groups.length === 0) return null
  const multiple = groups.length > 1
  return (
    <Section
      id="hoi-dap"
      eyebrow="Hỏi đáp"
      title="Câu hỏi thường gặp"
      lead="Nội dung quản lý ngay trong KDIGI CMS, nên khi chúng tôi sửa câu trả lời, trang này tự cập nhật."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        {groups.map((group) => (
          <div key={group.id}>
            {multiple && group.group ? <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{group.group}</h3> : null}
            <div className="space-y-3">
              {group.items.map((item) => (
                <details key={item.question} className="group rounded-2xl border border-border bg-card shadow-sm open:shadow-md">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-base font-semibold [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="blog-prose px-5 pb-5 !text-[16px]" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
