import { useRef } from "react"
import { Link } from "react-router-dom"
import { ArrowRightIcon } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { Button } from "@/components/ui/button"
import { scatterReveal } from "@/content/site"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * A parallax hold: the headline arrives centred and stays put; photos
 * scattered around it, tied together in a chain, rise up and clear the frame
 * before the page lets go and ordinary scrolling continues.
 *
 * ── Why a tall section with a sticky inner panel, not `ScrollTrigger`'s pin ──
 *
 * `ScrollTrigger` can pin an element itself (`pin: true`) by switching it to
 * `position: fixed` and inserting a spacer to hold its place. That works, but
 * it is a second pinning mechanism living next to the one CSS already has.
 * `Property.tsx`'s gallery column already pins itself with plain
 * `position: sticky` while its details column scrolls past — so this reuses
 * that same idiom: an outer section tall enough to scroll through
 * (`h-[240vh]`), with an inner `sticky top-0 h-dvh` panel that the browser
 * holds in place natively. `ScrollTrigger` is only asked to do the one thing
 * CSS cannot — read scroll progress across that tall section and scrub a
 * timeline with it. `pin` stays `false`.
 *
 * ── The parallax ──────────────────────────────────────────────────────────
 *
 * The headline does not fade or move — it is laid out, centred, and static
 * for the whole hold. What moves is the photo layer, which sits at a higher
 * `z-index` than the text (so a rising photo is always drawn in front of the
 * words it is passing over) and starts scattered around the headline rather
 * than piled on it. Scrolling further sends every photo straight up and off
 * the top of the frame, each to its own `vh` distance with a little sideways
 * drift, so the rise reads as several things moving at their own speed.
 *
 * `ease: "none"` on the rise: `scrub: 1` already supplies the only smoothing
 * this needs, and a photo whose own tween is *also* eased stops tracking the
 * scrollbar 1:1 — the thing that would make this feel like it is playing
 * rather than being dragged by the scroll.
 *
 * ── The string ────────────────────────────────────────────────────────────
 *
 * A thread runs tile 0 → 1 → 2 → … in DOM order, redrawn every frame from
 * each tile's *live* centre. No physics library is involved, and none is
 * needed: a force-graph engine (d3-force and the like) exists to solve for
 * where nodes should settle under simulated forces — a genuinely different
 * problem from ours, where every tile's position is already fully determined,
 * frame by frame, by the GSAP tween above. Running a simulation on top would
 * be a second authority fighting the first for the same elements. All the
 * string needs is what the tiles already have: read each one's centre with
 * `getBoundingClientRect()` (cheap at ten elements, and only while the scrub
 * is actually moving, via the tween's own `onUpdate` — never a second rAF
 * loop) and draw a line between consecutive centres.
 *
 * The "pulled along" read is not an extra effect layered on — it falls out of
 * the two things above being true at once. The stagger is sequential (0 first,
 * 1 shortly after, and so on, not the shuffled order a decorative scatter
 * would use) so a tile further down the chain is still sitting still while
 * the ones ahead of it have already set off; the string is a straight line
 * between wherever the two currently are, so a taut segment between a tile
 * that has moved and one that has not is exactly what a leash looks like.
 * Nothing about the string is authored to "look pulled" — it is a plain
 * distance-and-angle between two live points, and the pull is just what that
 * looks like when one end is already gone and the other has not moved yet.
 *
 * The path sags very slightly rather than running dead straight — a real
 * string is never taut in a straight line, it has a little weight to it — by
 * bowing a quadratic curve's control point a few pixels below the midpoint,
 * scaled to how far apart the two ends currently are.
 *
 * (The `<svg>` that renders the string is currently commented out below —
 * `layerRef`, `stringRefs` and `drawStrings` are still wired up and running
 * every frame regardless, so re-enabling it later is a one-line uncomment.)
 */

type ScatterTile = {
  src: string
  /** Px offset from centre at rest — scattered, not stacked. */
  start: { x: number; y: number; rotation: number }
  /** Where it rises to. `y` is what clears the frame; `x` is the drift. */
  rise: { x: string; y: string; rotation: number }
}

// Only three distinct property photos exist in /public today — cycled here
// deliberately. Spread this wide, ten tiles from three photos still reads as
// a loose gallery rather than a visible repeat.
//
// `start` is chosen so no tile overlaps the headline block, not just so it
// looks roughly clear. The text column tops out around 300px of half-width
// and 200px of half-height (a two-line display headline, the body copy, the
// button, at this section's own type scale); a tile is up to 144px of
// half-width and 128px of half-height at the tile size below. Two boxes
// centred on the same point miss each other entirely once they are separated
// on *either* axis by the sum of their half-sizes — so every tile clears on
// one axis with real margin, and is free to wander on the other: half of them
// are held apart by distance left or right, the rest by distance above or
// below, and only the axis that is NOT doing the clearing varies wildly. That
// is what makes the scatter look scattered rather than gridded, without ever
// risking a tile landing on the words.
const TILES: ScatterTile[] = [
  {
    src: "/homes/1.jpg",
    start: { x: -530, y: -250, rotation: 3 },
    rise: { x: "-11vw", y: "-142vh", rotation: -30 },
  },
  {
    src: "/homes/2.jpg",
    start: { x: 470, y: 100, rotation: 3 },
    rise: { x: "10vw", y: "-150vh", rotation: 24 },
  },
  {
    src: "/homes/3.jpg",
    start: { x: -460, y: 210, rotation: 25 },
    rise: { x: "-9vw", y: "-122vh", rotation: 28 },
  },
  {
    src: "/homes/1.jpg",
    // Bumped out from 440: the tile grew wider than the value was checked
    // against, and 440 cleared the text box by only 4px at this size.
    start: { x: 470, y: -230, rotation: -12 },
    rise: { x: "9vw", y: "-160vh", rotation: -24 },
  },
  {
    src: "/homes/2.jpg",
    start: { x: 60, y: -400, rotation: 5 },
    rise: { x: "3vw", y: "-172vh", rotation: 11 },
  },
  {
    src: "/homes/3.jpg",
    start: { x: -90, y: 380, rotation: -7 },
    rise: { x: "-4vw", y: "-120vh", rotation: -15 },
  },
  {
    src: "/homes/1.jpg",
    start: { x: -560, y: -40, rotation: -18 },
    rise: { x: "-14vw", y: "-135vh", rotation: -11 },
  },
  {
    src: "/homes/2.jpg",
    start: { x: 640, y: 40, rotation: 14 },
    rise: { x: "13vw", y: "-148vh", rotation: 1 },
  },
  {
    src: "/homes/3.jpg",
    start: { x: -220, y: -370, rotation: 9 },
    rise: { x: "-6vw", y: "-158vh", rotation: 17 },
  },
  {
    src: "/homes/1.jpg",
    start: { x: 200, y: 400, rotation: -10 },
    rise: { x: "7vw", y: "-130vh", rotation: -18 },
  },
]

export const PropertyScatterReveal = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const stringRefs = useRef<(SVGPathElement | null)[]>([])

  useGSAP(
    () => {
      const tiles = tileRefs.current.filter((el): el is HTMLDivElement => el !== null)
      const strings = stringRefs.current.filter((el): el is SVGPathElement => el !== null)
      const layer = layerRef.current
      if (!layer || tiles.length === 0) return

      // Reads every tile's live centre and redraws the thread between each
      // consecutive pair. This is the only DOM read in the file, and it is
      // deliberately not fired on its own timer — it rides the same tick the
      // tween below is already producing, via `onUpdate`, so there is exactly
      // one thing driving frames, not two.
      const drawStrings = () => {
        const layerBox = layer.getBoundingClientRect()
        const centres = tiles.map((tile) => {
          const box = tile.getBoundingClientRect()
          return {
            x: box.left + box.width / 2 - layerBox.left,
            y: box.top + box.height / 2 - layerBox.top,
          }
        })

        strings.forEach((path, i) => {
          const a = centres[i]
          const b = centres[i + 1]
          if (!a || !b) return

          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          const distance = Math.hypot(b.x - a.x, b.y - a.y)
          // A little weight, not a bow — a taut real string still sags a few
          // percent of its own length, never runs perfectly straight.
          const sag = Math.min(distance * 0.06, 40)

          path.setAttribute(
            "d",
            `M ${a.x} ${a.y} Q ${midX} ${midY + sag} ${b.x} ${b.y}`
          )
        })
      }

      // Rest position, always set first: a flock of photos rising the height
      // of the screen is exactly the kind of large, continuous motion
      // `prefers-reduced-motion` exists for, so reduced motion stops right
      // here — the photos sit scattered around the headline, the string sits
      // wherever that leaves it, and neither ever moves again.
      tiles.forEach((tile, i) => {
        const { start } = TILES[i]
        gsap.set(tile, { xPercent: -50, yPercent: -50, ...start })
      })
      drawStrings()

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        })
        .to(tiles, {
          x: (i) => TILES[i].rise.x,
          y: (i) => TILES[i].rise.y,
          rotation: (i) => TILES[i].rise.rotation,
          ease: "none",
          // Sequential and in DOM order on purpose — this is the half of the
          // "pulled along" effect that is not the string. Tile 3 has to still
          // be sitting at rest while tile 0 is already well into its rise for
          // the thread between them to read as taut rather than merely drawn.
          stagger: 0.045,
          onUpdate: drawStrings,
        })
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-white">
        <div
          ref={layerRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          {/* Painted first, so it sits behind the tiles it connects — a
              thread that runs into a photo rather than over it. */}
          {/* <svg className="absolute inset-0 h-full w-full overflow-visible">
            {TILES.slice(1).map((_, i) => (
              <path
                key={i}
                ref={(node) => {
                  stringRefs.current[i] = node
                }}
                fill="none"
                stroke="#8a8a8a"
                strokeWidth={1}
                strokeLinecap="round"
              />
            ))}
          </svg> */}

          {TILES.map((tile, i) => (
            <div
              key={i}
              ref={(node) => {
                tileRefs.current[i] = node
              }}
              className="absolute top-1/2 left-1/2 h-52 w-64 overflow-hidden rounded-2xl border-2 border-black bg-white shadow-lg will-change-transform
              sm:h-64
              sm:w-72
              "
            >
              <img src={tile.src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <div className="relative z-0 mx-auto flex max-w-2xl flex-col items-center gap-5 px-8 text-center">
          <p className="cedarville-cursive-regular text-2xl text-black/70">
            {scatterReveal.eyebrow}
          </p>
          <h2 className="text-4xl leading-[0.95] tracking-tight text-balance md:text-6xl">
            {scatterReveal.headline}
          </h2>
          <p className="text-base leading-relaxed text-black/70 text-balance md:text-lg">
            {scatterReveal.body}
          </p>
          <Button
            asChild
            className={cn(
              "mt-2 h-14 rounded-full border-2 border-black bg-white px-8 text-black",
              "shadow-[5px_6px_0px_#000] transition-shadow hover:bg-yellow-400 hover:text-black active:shadow-none"
            )}
          >
            <Link to="/listings" className="flex items-center gap-2">
              {scatterReveal.ctaLabel} <ArrowRightIcon size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
