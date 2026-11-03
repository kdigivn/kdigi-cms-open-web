import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** One `brand` button per screen (the glossy primary action); the rest are `outline` / `ghost`. Touch targets >= 44px below md. */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent text-[15px] font-medium transition-[background-color,filter,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        brand: "btn-brand",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-input bg-card text-foreground hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
      },
      size: {
        default: "h-11 px-5 md:h-10",
        lg: "h-12 px-6 text-base",
        icon: "size-11 md:size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ComponentProps<"button"> & ButtonVariants) {
  return <button type="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

/** Link styled as a button. External hosts (docs, app, GitHub) open normally; pass `external` to add rel/target. */
export function ButtonLink({
  className,
  variant,
  size,
  external = false,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants & { external?: boolean }) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  )
}
