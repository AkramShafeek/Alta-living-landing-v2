import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Infinite horizontal scroller for arbitrary card content — generic over
 * `renderItem` so it works for testimonials today and any other card row later,
 * instead of being a testimonial-specific carousel.
 *
 * ── What "infinite" actually requires ───────────────────────────────────
 *
 * The trick is two identical copies and a `translateX(-50%)` loop: when copy
 * one has slid exactly its own width off the left, copy two is sitting where
 * copy one began, and the animation restarting is invisible. Two conditions
 * have to hold for that, and both are easy to miss:
 *
 *   1. **One copy must be at least as wide as the viewport.** Otherwise the
 *      track runs out before the loop comes round and you watch blank space
 *      cross the screen. Three 360px cards is 1128px, which is narrower than
 *      most desktops — so the items are repeated until one copy covers the
 *      container, and only then doubled.
 *
 *   2. **The 50% must land on a copy boundary.** With flex `gap`, it does not:
 *      n items have n−1 internal gaps, 2n items have 2n−1, and half of
 *      `2n·w + (2n−1)·g` is half a gap short of `n·w + n·g`, where copy two
 *      really starts. The row snapped 12px every loop. Fixed by dropping `gap`
 *      and giving every item a trailing margin instead: each item is then
 *      exactly `w + g` wide, the track is pure repetition, and -50% is exact.
 *
 * The repeat count is measured rather than guessed, because it depends on the
 * container width and on whatever `renderItem` produces.
 */
export function MarqueeRow<T>({
  items,
  renderItem,
  direction = "left",
  speed = 40,
  gap = 24,
  className,
}: {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  direction?: "left" | "right"
  speed?: number
  /** Space between cards, in px. Applied as a trailing margin — see above. */
  gap?: number
  className?: string
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const [repeats, setRepeats] = useState(1)

  // Measured, not assumed: how many passes of `items` it takes for one copy to
  // cover the container. Derived from the *base* width (current copy ÷ current
  // repeats) so the answer does not depend on the answer — it settles in one
  // pass instead of oscillating.
  useLayoutEffect(() => {
    const measure = () => {
      const copyWidth = copyRef.current?.offsetWidth ?? 0
      const viewport = viewportRef.current?.offsetWidth ?? 0
      if (copyWidth === 0 || viewport === 0) return

      const baseWidth = copyWidth / repeats
      const needed = Math.max(1, Math.ceil(viewport / baseWidth))
      if (needed !== repeats) setRepeats(needed)
    }

    measure()

    // Both ends are watched. The container tells us when the window resized;
    // the copy tells us when the cards themselves changed size — a webfont
    // swapping in for its fallback is the usual cause, and it happens after
    // the first measurement.
    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    if (copyRef.current) observer.observe(copyRef.current)
    return () => observer.disconnect()
  }, [repeats, items.length])

  const pass = Array.from({ length: repeats }, () => items).flat()

  /** One copy. Two of these make the loop. */
  const copy = (copyIndex: number) => (
    <div
      key={copyIndex}
      ref={copyIndex === 0 ? copyRef : undefined}
      className="flex shrink-0"
      // The duplicate is decoration; a screen reader should hear the
      // testimonials once, not twice.
      aria-hidden={copyIndex > 0}
    >
      {pass.map((item, index) => (
        // `flex` on the wrapper, not just on the copy. The wrapper is already a
        // flex item so it stretches to the tallest card on its own — but its
        // child is then a block box and stops at its own content height, which
        // is what left the row ragged. Making the wrapper a flex container
        // passes the stretch through to whatever `renderItem` returned, so a
        // caller does not have to remember `h-full`.
        <div key={index} style={{ marginRight: gap }} className="flex shrink-0">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )

  return (
    <div
      ref={viewportRef}
      className={cn("w-full overflow-hidden py-4", className)}
    >
      <div
        className={cn(
          "flex w-max",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse",
          // Moving content that cannot be paused is a WCAG 2.2.2 problem, and
          // these are meant to be read.
          "hover:[animation-play-state:paused]",
          "motion-reduce:animate-none"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {copy(0)}
        {copy(1)}
      </div>
    </div>
  )
}
