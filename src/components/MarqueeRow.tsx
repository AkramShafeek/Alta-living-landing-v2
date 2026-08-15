import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Infinite horizontal scroller for arbitrary card content — generic over
 * `renderItem` so it works for testimonials today and any other card row
 * later, instead of being a testimonial-specific carousel.
 */
export function MarqueeRow<T>({
  items,
  renderItem,
  direction = "left",
  speed = 40,
  className,
}: {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  direction?: "left" | "right"
  speed?: number
  className?: string
}) {
  const doubled = [...items, ...items]
  return (
    <div className={cn("overflow-hidden w-full py-4", className)}>
      <div
        className={cn(
          "flex gap-6 w-max",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  )
}
