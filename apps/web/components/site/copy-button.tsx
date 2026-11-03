"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

/** Copies `value` to the clipboard; the label flips to "Đã chép" for two seconds and is announced politely. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the value stays visible and selectable */
    }
  }
  return (
    <>
      <Button variant="ghost" size="icon" onClick={copy} aria-label={`Chép ${label}`} className="size-10 md:size-8">
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
      <span className="sr-only" role="status">
        {copied ? `Đã chép ${label}` : ""}
      </span>
    </>
  )
}
