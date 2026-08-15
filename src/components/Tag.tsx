import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  outline: "bg-transparent border border-black/70 text-black",
  solid: "bg-black text-white border border-black",
  glass: "bg-black/50 backdrop-blur-sm text-white border-0",
} as const

export const Tag = ({
  children,
  tone = "outline",
  className,
}: {
  children: ReactNode
  tone?: keyof typeof TONE_CLASSES
  className?: string
}) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] leading-none",
      TONE_CLASSES[tone],
      className
    )}
  >
    {children}
  </span>
)
