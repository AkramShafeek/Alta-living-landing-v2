import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { RIBBON_CARD_HEIGHT, RIBBON_CARD_WIDTH } from "./PropertyRibbonCard"

/**
 * A marquee of property cards, stretched taller toward the edges.
 *
 * Replaces an earlier version of this component that turned the strip into a
 * 3D cylinder — perspective, `rotateY`, a depth axis, a fade mask at both
 * ends. That went next, in favour of literally resizing each card so the
 * strip had a "smile" silhouette. This is a third pass: the box itself no
 * longer changes size, it is warped. A card near the centre renders at its
 * normal proportions; a card near either edge is stretched vertically by a
 * CSS `scaleY`, the way a reflection looks pulled long at the edge of a
 * funhouse mirror. The photo and the caption stretch along with the card,
 * which is the point — it should read as distortion, not as "a taller card."
 *
 * ── Why this still is not `MarqueeRow` ────────────────────────────────────
 *
 * `MarqueeRow` is a single CSS `@keyframes` translating a flex track — no JS
 * runs per frame, the compositor does everything. That works because every
 * card in that row looks the same regardless of where it sits. Here a card
 * stretch depends on how far it currently is from the centre of the
 * viewport, and CSS has no way to ask an element how far from centre it is
 * right now — so something has to compute that continuously. This still
 * counts as "a marquee" in every way that matters to the visitor: one
 * continuous strip, constant speed, looping seamlessly. It just needs one
 * `requestAnimationFrame` loop under the hood to get the stretch right.
 *
 * The loop never reads the DOM back (no `getBoundingClientRect`) — it already
 * knows every card x from the offset it is driving, so it only ever writes.
 *
 * ── Why `scaleY` and not a height change ──────────────────────────────────
 *
 * An earlier version of this file set `element.style.height` directly and
 * argued against `scaleY` on the grounds that scaling distorts the photo and
 * the text. That argument is still correct — it is now the goal rather than
 * the objection. `scaleY` stretches the element and everything painted inside
 * it, image and caption alike, which is what "the ends look stretched" means.
 * A height change could not produce this: `object-cover` would keep the photo
 * undistorted and only the box would grow, which reads as "a bigger card,"
 * not a pulled one.
 *
 * The box itself keeps a fixed layout height (`RIBBON_CARD_HEIGHT`); only its
 * transform grows taller. Percentage-based positioning (`top: 50%` plus a
 * `-50%` translate for vertical centring) resolves against that fixed layout
 * height, not the visually stretched size, so a card stays centred on the
 * strip regardless of how far it is currently stretched — nothing needs
 * recomputing when the stretch changes.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Space between cards, centre to centre. */
const GAP = 28
const PITCH = RIBBON_CARD_WIDTH + GAP

/** Every card's real, unstretched height. */
const BASE_HEIGHT = RIBBON_CARD_HEIGHT

/** How tall a card at the very edge is stretched, as a multiple of its own height. */
const STRETCH_MAX = 1.35

/** A card is drawn while it is within this many px of the viewport. */
const CULL_MARGIN = 40

export function PropertyMarquee<T>({
  items,
  renderItem,
  /** Pixels per second the strip travels. */
  speed = 46,
  className,
}: {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  speed?: number
  className?: string
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])

  /** Distance travelled, in px. A ref, not state — it changes every frame. */
  const offset = useRef(0)
  const paused = useRef(false)

  const [repeats, setRepeats] = useState(1)

  // Enough passes of `items` that the track is always wider than the viewport
  // plus a card at each end, which is what makes the wrap invisible.
  useLayoutEffect(() => {
    const measure = () => {
      const width = viewportRef.current?.offsetWidth ?? 0
      if (width === 0 || items.length === 0) return

      const needed = Math.max(1, Math.ceil((width + 2 * PITCH) / (items.length * PITCH)))
      setRepeats((current) => (current === needed ? current : needed))
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    return () => observer.disconnect()
  }, [items.length])

  const count = items.length * repeats

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || count === 0) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const total = count * PITCH

    /** Places and stretches every card from the current offset. No DOM reads. */
    const layout = () => {
      const width = viewport.offsetWidth
      const half = width / 2
      if (half === 0) return

      for (let index = 0; index < count; index += 1) {
        const slot = slotRefs.current[index]
        if (!slot) continue

        // Wrapped into a window that starts one card left of the viewport, so a
        // card leaving the right edge reappears on the left with no jump.
        let x = (((index * PITCH - offset.current) % total) + total) % total
        if (x > width + PITCH) x -= total

        // Culled on geometry: a card is drawn as long as any part of it is
        // within CULL_MARGIN of the viewport, regardless of viewport size.
        const offscreen = x > width + CULL_MARGIN || x + RIBBON_CARD_WIDTH < -CULL_MARGIN
        slot.style.visibility = offscreen ? "hidden" : "visible"
        if (offscreen) continue

        // 0 at dead centre, 1 at either edge.
        const t = clamp(Math.abs(x + RIBBON_CARD_WIDTH / 2 - half) / half, 0, 1)
        const stretch = 1 + (STRETCH_MAX - 1) * t

        // scaleY is what does the actual distorting; translate3d only ever
        // moves the card, it never resizes it.
        slot.style.transform = `translate3d(${x.toFixed(2)}px, -50%, 0) scaleY(${stretch.toFixed(3)})`
      }
    }

    let frame = 0
    let previous = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.min((now - previous) / 1000, 0.05) // tab-switch guard
      previous = now

      if (!paused.current && !reduced.matches) {
        offset.current = (offset.current + speed * elapsed) % total
      }
      layout()
      frame = requestAnimationFrame(tick)
    }

    layout()
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [count, speed])

  return (
    <div
      ref={viewportRef}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      // Pausing on focus too, or a keyboard user tabbing through the cards is
      // chasing a moving target.
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
      className={cn("relative w-full overflow-hidden border-y-2 border-black py-6", className)}
      // Tall enough for the most-stretched card at the edge, plus breathing
      // room against the border lines, so the distortion is never clipped.
      style={{ height: Math.round(BASE_HEIGHT * STRETCH_MAX) + 48 }}
    >
      {Array.from({ length: count }, (_, index) => {
        const item = items[index % items.length]
        // Everything past the first pass is the same card again — present for
        // the geometry, not for a screen reader to read out twice.
        const isEcho = index >= items.length

        return (
          <div
            key={index}
            ref={(node) => {
              slotRefs.current[index] = node
            }}
            aria-hidden={isEcho}
            {...(isEcho ? { inert: true } : {})}
            className="absolute top-1/2 left-0 will-change-transform"
            style={{ width: RIBBON_CARD_WIDTH, height: BASE_HEIGHT }}
          >
            {renderItem(item, index % items.length)}
          </div>
        )
      })}
    </div>
  )
}
