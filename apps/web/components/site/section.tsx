import { cn } from "@/lib/utils"

/** Page width wrapper used by every section. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1180px] px-5 md:px-6", className)} {...props} />
}

/** Section shell: anchor id, vertical rhythm, optional eyebrow + title + lead. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  className,
  headClassName,
  children,
}: {
  id?: string
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  className?: string
  headClassName?: string
  children?: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("py-16 md:py-24", className)}>
      <Container>
        <header className={cn("mx-auto mb-10 max-w-3xl text-center md:mb-14", headClassName)}>
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h2 id={id ? `${id}-title` : undefined} className="t-h2">
            {title}
          </h2>
          {lead ? <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{lead}</p> : null}
        </header>
        {children}
      </Container>
    </section>
  )
}
