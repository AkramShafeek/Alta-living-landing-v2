import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PinnedCard } from "@/components/PinnedCard"

// ─── data ─────────────────────────────────────────────────────────────

// Photos are pinned onto the map itself — percentage positions scale with
// the panel instead of needing hand-tuned breakpoint scale factors.
const PHOTOS = [
  { left: "5%", top: "8%", width: 168, height: 128, z: 2, url: "1.jpg" },
  { left: "44%", top: "3%", width: 148, height: 128, z: 1, url: "2.jpg" },
  { left: "68%", top: "28%", width: 172, height: 128, z: 3, url: "3.jpg" },
  { left: "8%", top: "48%", width: 148, height: 128, z: 1, url: "1.jpg" },
  { left: "42%", top: "60%", width: 168, height: 128, z: 2, url: "2.jpg" },
]

const NOTES = [
  { id: "note-homes", value: "12+", label: "homes on file", color: "bg-amber-100", rotate: -5 },
  { id: "note-years", value: "5", label: "yrs on the case", color: "bg-sky-100", rotate: 4 },
  { id: "note-residents", value: "100+", label: "cases closed", color: "bg-rose-100", rotate: -3 },
  { id: "note-response", value: "24h", label: "reply, always", color: "bg-lime-100", rotate: 6 },
  { id: "note-fee", value: "₹0", label: "broker fee, ever", color: "bg-violet-100", rotate: -4 },
] as const

const NEIGHBORHOODS = [
  { name: "Indiranagar", rate: "₹42k", stripe: "bg-red-500" },
  { name: "Koramangala", rate: "₹48k", stripe: "bg-blue-500" },
  { name: "HSR Layout", rate: "₹38k", stripe: "bg-emerald-600" },
  { name: "Whitefield", rate: "₹32k", stripe: "bg-purple-500" },
]

// String traces the case: pin on the map → business card → article → each
// stat → testimonial. The article is the visual hub the thread fans out from.
const CONNECTIONS: [string, string][] = [
  ["map-marker", "business-card"],
  ["business-card", "article"],
  ["article", "note-homes"],
  ["note-homes", "note-years"],
  ["note-years", "note-residents"],
  ["note-residents", "note-response"],
  ["note-response", "note-fee"],
  ["article", "testimonial"],
]

// Irregular edge — many small deviations so the panel reads as scissor-cut
const MAP_CUT =
  "polygon(0.6% 1.2%,12% 0.3%,26% 1.6%,39% 0.5%,53% 1.8%,67% 0.4%,81% 1.5%,93% 0.6%,99.4% 1.4%,98.6% 14%,99.7% 27%,98.4% 41%,99.6% 55%,98.5% 69%,99.5% 83%,98.8% 96%,88% 99.4%,74% 98.3%,61% 99.6%,47% 98.4%,33% 99.5%,19% 98.6%,7% 99.4%,1% 98.2%,0.4% 85%,1.5% 71%,0.3% 57%,1.6% 43%,0.4% 29%,1.4% 15%)"

// ─── helpers ──────────────────────────────────────────────────────────

type Point = { x: number; y: number }

function computeEdgePath(p0: Point, p1: Point, bow: number, side: 1 | -1): string {
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const len = Math.hypot(dx, dy) || 1
  const perpX = (-dy / len) * bow * side
  const perpY = (dx / len) * bow * side
  const cx = (p0.x + p1.x) / 2 + perpX
  const cy = (p0.y + p1.y) / 2 + perpY
  return `M ${p0.x} ${p0.y} Q ${cx} ${cy} ${p1.x} ${p1.y}`
}

const riseVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    // `as const` on the outer object does not reach inside this function's
    // return, so the easing name needs narrowing of its own.
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.1 + i * 0.08 },
  }),
} as const

// ─── decorative primitives ────────────────────────────────────────────

function Pushpin({ color = "red" }: { color?: "red" | "blue" | "yellow" | "green" }) {
  const palettes = {
    red: "from-red-400 via-red-600 to-red-800 border-red-900",
    blue: "from-blue-400 via-blue-600 to-blue-800 border-blue-900",
    yellow: "from-yellow-300 via-amber-500 to-amber-700 border-amber-800",
    green: "from-green-400 via-green-600 to-green-800 border-green-900",
  }
  return (
    <div className={cn(
      "relative z-40 w-3.5 h-3.5 rounded-full bg-linear-to-br border shadow-[0_2px_3px_rgba(0,0,0,0.65)]",
      palettes[color]
    )}>
      <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/30" />
    </div>
  )
}

// Torn strips of tape holding paper flat against the cork
function Tape({ className, rotate }: { className: string; rotate: number }) {
  return (
    <div
      className={cn(
        "absolute w-24 h-7 bg-amber-50/70 border-x border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.18)] backdrop-blur-[1px]",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  )
}

// Faint coffee ring — half of the "clumsy" texture in the reference
function CoffeeStain({ className, size = 140 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn("absolute rounded-full opacity-25 pointer-events-none mix-blend-multiply", className)}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 40% 40%, transparent 45%, #78350f 48%, #92400e 55%, transparent 70%)",
      }}
    />
  )
}

// 4.9★ verified seal — sits on the article corner like a foil stamp
// function StarSeal({ className }: { className?: string }) {
//   return (
//     <div
//       className={cn(
//         "relative w-28 h-28 rounded-full bg-linear-to-br from-amber-200 via-[#FAC775] to-[#EF9F27] border-[3px] border-double border-red-900/80 flex items-center justify-center shadow-[3px_4px_12px_rgba(0,0,0,0.35)]",
//         className
//       )}
//     >
//       <div className="absolute inset-1.5 rounded-full border border-red-900/40" />
//       <div className="relative z-10 text-center">
//         <div className="flex justify-center gap-px text-red-900 leading-none">
//           {[0, 1, 2, 3, 4].map(i => <span key={i} className="text-[11px]">★</span>)}
//         </div>
//         <p className="font-serif text-2xl font-black text-red-900 leading-none mt-1">4.9</p>
//         <p className="font-mono text-[8px] font-black text-red-900 uppercase tracking-[0.15em] mt-0.5">
//           Verified
//         </p>
//         <p className="font-mono text-[7px] text-red-900/70 uppercase tracking-widest mt-0.5">est. 2024</p>
//       </div>
//     </div>
//   )
// }

// Alta Living business card — brutalist, on-brand black + amber
function AltaBusinessCard() {
  return (
    <div className="w-64 bg-[#1a1a1a] p-5 border-2 border-black shadow-[5px_7px_16px_-4px_rgba(0,0,0,0.55)]">
      <div className="flex items-start justify-between border-b border-[#EF9F27]/40 pb-3 mb-3">
        <div>
          <p className="font-serif text-2xl font-black leading-none text-[#EF9F27]">Alta</p>
          <p className="font-serif text-2xl font-black leading-none text-[#EF9F27]">Living</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[8px] uppercase tracking-widest text-white/40">est.</p>
          <p className="font-mono text-xl font-bold text-white leading-none mt-1">2024</p>
        </div>
      </div>
      <p className="font-mono text-[10px] text-white/80 uppercase tracking-wider leading-relaxed">
        Furnished homes.<br />
        Vetted landlords.<br />
        <span className="text-[#FAC775]">Bangalore, always.</span>
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <p className="font-mono text-[9px] text-green-400 tracking-wide">taking calls</p>
      </div>
    </div>
  )
}

// Zone tag — small ID card with a color stripe (like a case-file colour code)
function NeighborhoodTag({
  name, rate, stripe, className, rotate = 0,
}: { name: string; rate: string; stripe: string; className?: string; rotate?: number }) {
  return (
    <div
      className={cn(
        "inline-flex flex-col bg-white border border-black/40 shadow-[2px_3px_6px_rgba(0,0,0,0.25)] w-28",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className={cn("h-1.5", stripe)} />
      <div className="px-2 py-1.5 text-center">
        <p className="font-mono text-[8px] uppercase tracking-widest text-black/50">Zone</p>
        <p className="font-serif font-bold text-xs leading-tight">{name}</p>
        <p className="font-mono text-[9px] text-black/60 mt-0.5">from {rate}/mo</p>
      </div>
    </div>
  )
}

// function RubberStamp({
//   text, className, rotate = 0, color = "red",
// }: { text: string; className?: string; rotate?: number; color?: "red" | "blue" }) {
//   const c = color === "red" ? "border-red-800 text-red-800" : "border-blue-800 text-blue-800"
//   return (
//     <div
//       className={cn(
//         "inline-block border-[3px] px-3 py-1.5 font-mono font-black text-xs uppercase tracking-widest opacity-70",
//         c, className
//       )}
//       style={{ transform: `rotate(${rotate}deg)`, boxShadow: "inset 0 0 4px currentColor" }}
//     >
//       {text}
//     </div>
//   )
// }

function PostageStamp({
  label, value, className, rotate = 0,
}: { label: string; value: string; className?: string; rotate?: number }) {
  return (
    <div
      className={cn("inline-block relative shadow-[2px_2px_5px_rgba(0,0,0,0.3)]", className)}
      style={{
        transform: `rotate(${rotate}deg)`,
        background: "#fefae0",
        backgroundImage: "radial-gradient(circle, transparent 2px, #fefae0 2.5px)",
        backgroundSize: "6px 6px",
        backgroundPosition: "-3px -3px",
        padding: 6,
      }}
    >
      <div className="border-2 border-red-900/60 px-3 py-2 text-center min-w-[64px]">
        <p className="font-serif text-[8px] uppercase tracking-widest text-red-900/70">Bangalore</p>
        <p className="font-serif text-lg font-black text-red-900 leading-none my-0.5">{value}</p>
        <p className="font-mono text-[7px] uppercase tracking-widest text-red-900/70">{label}</p>
      </div>
    </div>
  )
}

function TicketStub({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <div
      className={cn(
        "relative flex w-52 bg-[#fef9e7] border border-black/40 shadow-[3px_4px_10px_-2px_rgba(0,0,0,0.35)]",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="flex-1 p-3">
        <p className="font-mono text-[8px] uppercase tracking-widest text-black/50">Site Visit</p>
        <p className="font-serif text-lg font-bold leading-tight">2BHK · Indiranagar</p>
        <p className="font-mono text-[10px] text-black/70 mt-0.5">Sat 4:00 PM</p>
      </div>
      <div className="w-14 border-l border-dashed border-black/40 p-2 text-center bg-[#EF9F27]/10">
        <p className="font-mono text-[8px] uppercase text-black/50">No.</p>
        <p className="font-serif text-xl font-black leading-none mt-1">047</p>
        <p className="font-mono text-[7px] text-black/50 mt-1">ADMIT</p>
      </div>
    </div>
  )
}

function RentReceipt({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  const rows: [string, string][] = [
    ["Furnished stay", "✓"],
    ["Wi-Fi 300 Mbps", "✓"],
    ["Weekly clean", "✓"],
    ["Maintenance 24/7", "✓"],
    ["Utilities capped", "✓"],
    ["Broker fee", "₹0"],
  ]
  return (
    <div
      className={cn(
        "w-48 bg-white px-3 py-4 shadow-[3px_4px_10px_-2px_rgba(0,0,0,0.35)] font-mono text-[10px] text-black/80",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <p className="text-center font-bold text-xs mb-2 border-b border-dashed border-black/50 pb-1">
        ALTA · WHAT&apos;S INCLUDED
      </p>
      <div className="space-y-0.5">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex justify-between">
            <span>{k}</span>
            <span className={v === "₹0" ? "text-red-700 font-bold" : ""}>{v}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-black/50 mt-2 pt-1 text-center font-bold text-[10px]">
        ONE RENT · NO SURPRISES
      </div>
      <p className="text-center text-[8px] mt-2 text-black/40">** thank you **</p>
    </div>
  )
}

// Lined index card, blue rule + amber margin — reads as "statement on file"
function TestimonialCard({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <div
      className={cn(
        "w-64 bg-[#fdfaf3] border-l-[3px] border-[#EF9F27] p-4 shadow-[3px_4px_10px_-2px_rgba(0,0,0,0.35)] relative",
        className
      )}
      style={{
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 22px, rgba(59,130,246,0.18) 23px)",
      }}
    >
      <p className="font-mono text-[8px] uppercase tracking-widest text-black/40 mb-2">
        Statement · file #012
      </p>
      <p className="font-serif italic text-sm leading-snug text-black/85">
        &ldquo;Moved in Tuesday. Wi-Fi worked. Landlord didn&apos;t call once. First time it&apos;s
        felt easy in Bangalore.&rdquo;
      </p>
      <div className="flex items-center justify-between mt-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">
          — Priya M., Koramangala
        </p>
        <div className="flex gap-px text-amber-500 text-[10px]">
          {[0, 1, 2, 3, 4].map(i => <span key={i}>★</span>)}
        </div>
      </div>
    </div>
  )
}

// A sticky stat note — extracted so main JSX stays readable
function StickyStat({
  note, refCb, delay,
}: {
  note: (typeof NOTES)[number]
  refCb: (el: HTMLDivElement | null) => void
  delay: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      custom={delay}
      variants={riseVariants}
      className="relative"
      style={{ transform: `rotate(${note.rotate}deg)` }}
    >
      {/* Pin absolutely anchored at top-center of the note — string ALWAYS
          lands on the pin visually, regardless of note width or parent layout */}
      <div
        ref={refCb}
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 inline-block"
      >
        <Pushpin />
      </div>
      <div
        className={cn(
          "w-36 px-4 pt-6 pb-5 text-center border border-black/25 shadow-[3px_5px_10px_-3px_rgba(0,0,0,0.3)] relative",
          note.color
        )}
      >
        {/* faint adhesive strip near the pin */}
        <div className="absolute top-0 left-4 right-4 h-3 pointer-events-none" />
        <p className="cedarville-cursive-regular text-xl leading-none">{note.value}</p>
        <p className="cedarville-cursive-regular text-base mt-2 leading-snug text-black/70">
          {note.label}
        </p>
      </div>
    </motion.div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────

export const CaseStudyBoard = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [points, setPoints] = useState<Record<string, Point>>({})

  const setPinRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) pinRefs.current.set(id, el)
      else pinRefs.current.delete(id)
    },
    []
  )

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const next: Record<string, Point> = {}
    pinRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect()
      // Pin wrappers are inline-block sized to the pin, so AABB center IS the
      // visual pin center — no block-level width leak.
      next[id] = {
        x: r.left - cRect.left + r.width / 2,
        y: r.top - cRect.top + r.height / 2,
      }
    })
    setPoints(next)
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(measure)
    // catch late-loading images that shift layout
    const t = setTimeout(measure, 400)
    const container = containerRef.current
    const observer = new ResizeObserver(() => measure())
    if (container) observer.observe(container)
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure])

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden border-y-8 border-[#3d2817]"
      style={{
        backgroundImage: "url('/pinboard-bg.jpg')",
        // backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* case file tab — the section's heading */}
      <div className="flex w-full justify-between">
        <div className="mx-auto relative z-40 inline-flex items-center gap-2 bg-amber-200 border border-black/40 border-b-0 px-5 py-2 mt-6 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
          <p className=" font-bold text-black/70">
            Case File — Alta Living, Bangalore Desk
          </p>
        </div>
      </div>

      {/* ambient clutter — decorations that don't participate in the thread */}
      <CoffeeStain className="left-[38%] top-[14%]" size={110} />
      <CoffeeStain className="right-[6%] bottom-[8%]" size={90} />

      <div className="hidden lg:flex flex-col gap-3 absolute left-4 top-32 z-20">
        <PostageStamp label="dispatch" value="₹42" rotate={-6} />
        <PostageStamp label="airmail" value="₹18" rotate={4} />
      </div>

      {/* <RubberStamp
        text="Confidential"
        rotate={-12}
        className="absolute right-8 top-14 z-20"
      />
      <RubberStamp
        text="Bangalore Desk"
        rotate={6}
        color="blue"
        className="absolute left-[44%] bottom-8 z-20 hidden lg:inline-block"
      /> */}

      {/* thread layer — pins sit above at z-40, thread runs beneath at z-30 */}
      <svg className="absolute inset-0 w-full h-full z-30 pointer-events-none hidden lg:block">
        <defs>
          <filter id="thread-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" />
            <feOffset dx="0.5" dy="1" result="off" />
            <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {CONNECTIONS.map(([fromId, toId], i) => {
          const from = points[fromId]
          const to = points[toId]
          if (!from || !to) return null
          const d = computeEdgePath(from, to, 18, i % 2 === 0 ? 1 : -1)
          return (
            <motion.path
              key={`${fromId}-${toId}`}
              d={d}
              fill="none"
              stroke="#b91c1c"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#thread-shadow)"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.85 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                pathLength: { duration: 0.65, ease: "easeInOut", delay: 0.4 + i * 0.12 },
                opacity: { duration: 0.2, delay: 0.4 + i * 0.12 },
              }}
            />
          )
        })}
      </svg>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 p-8 pt-12 lg:p-14 lg:pt-16">
        {/* ── left: map, taped down, with photos and zone tags ─────── */}
        <motion.div
          className="lg:col-span-7 flex items-start justify-center relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={0}
          variants={riseVariants}
        >
          <div className="relative w-full max-w-[680px]" style={{ transform: "rotate(-1.2deg)" }}>
            <Tape className="-top-3 -left-4  z-20" rotate={-7} />
            <Tape className="-top-4  right-2  z-20" rotate={5} />
            <Tape className="bottom-32 -left-2 z-20" rotate={24} />
            <Tape className="bottom-32 right-1 z-20" rotate={-26} />

            <div className="relative aspect-5/4 w-full">
              {/* Paper backing + map, both clipped to the same torn edge.
                  FIX: the img wrapper now has explicit dimensions (inset-3)
                  and the img inside is w-full h-full, so object-cover actually
                  crops the map to fill the paper — not the previous behavior
                  where the img sat at its intrinsic size in the top-left. */}
              <div
                className="absolute inset-0"
                style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.45))" }}
              >
                <div className="absolute inset-0 bg-[#fdfaf3]" style={{ clipPath: MAP_CUT }} />
                <div
                  className="absolute inset-3 overflow-hidden"
                  style={{ clipPath: MAP_CUT }}
                >
                  <img
                    src="/image-4.png"
                    alt="Map of the Bangalore neighborhoods Alta Living operates in"
                    className="w-full h-full object-cover scale-110 object-center"
                  />
                </div>
              </div>

              {/* The pin stuck in the map — where the thread starts */}
              <div
                className="absolute z-40 flex flex-col items-center"
                style={{ left: "33%", top: "44%" }}
              >
                <div ref={setPinRef("map-marker")} className="inline-block">
                  <Pushpin />
                </div>
                <p className="cedarville-cursive-regular text-base text-black/70 mt-0.5 whitespace-nowrap">
                  Indiranagar
                </p>
              </div>

              {PHOTOS.map((photo, i) => (
                <div key={i} className="absolute" style={{ left: photo.left, top: photo.top }}>
                  <PinnedCard
                    x={0}
                    y={0}
                    width={photo.width}
                    height={photo.height}
                    z={photo.z}
                    url={photo.url}
                  />
                </div>
              ))}

              {/* handwritten annotation on the map itself */}
              <p
                className="absolute cedarville-cursive-regular text-sm text-black/60 z-30"
                style={{ left: "58%", top: "80%", transform: "rotate(-3deg)" }}
              >
                → walked this street
              </p>
            </div>

            {/* Zone tags fan out below the map */}
            <div className="relative mt-5 ml-2 flex flex-wrap gap-x-3 gap-y-4 items-start">
              {NEIGHBORHOODS.map((n, i) => (
                <NeighborhoodTag key={n.name} {...n} rotate={i % 2 === 0 ? -2 : 3} />
              ))}
            </div>

            <p className="cedarville-cursive-regular text-xl text-black/60 mt-4 ml-2">
              every home on this board, walked and photographed in person
            </p>
          </div>
        </motion.div>

        {/* ── right: business card, article, stats, testimonial, receipt ── */}
        <div className="lg:col-span-5 relative flex flex-col items-center lg:items-stretch gap-6 lg:gap-5">

          {/* Business card, top-right */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={1}
            variants={riseVariants}
            className="relative self-center lg:self-end lg:mr-6"
            style={{ transform: "rotate(-3deg)" }}
          >
            <div
              ref={setPinRef("business-card")}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 inline-block"
            >
              <Pushpin color="yellow" />
            </div>
            <AltaBusinessCard />
          </motion.div>

          {/* Article — the finding */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={2}
            variants={riseVariants}
            className="relative self-center lg:self-start lg:ml-2 mt-2"
            style={{ transform: "rotate(-2deg)" }}
          >
            <div
              ref={setPinRef("article")}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 inline-block"
            >
              <Pushpin />
            </div>
            <div
              className="w-72 sm:w-80 bg-[#fdfaf3] border border-black/30 p-7 shadow-[4px_6px_14px_-4px_rgba(0,0,0,0.4)] relative rotate-6"
              style={{
                clipPath:
                  "polygon(1% 2%,30% 0%,58% 1.5%,100% 0%,99% 15%,100% 32%,98% 48%,100% 64%,99% 80%,100% 97%,72% 100%,45% 98.5%,15% 100%,0% 96%,2% 78%,0% 60%,2% 42%,0% 24%,2% 10%)",
              }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#b45309] mb-2">
                Finding — Bangalore Desk
              </p>
              <h3 className="font-serif text-3xl font-bold leading-tight mb-3">
                Comfort brought to you by Alta Living
              </h3>
              <p className="text-sm font-serif leading-relaxed text-black/70">
                Every lead said the same thing: good location, sketchy landlord, Wi-Fi that
                dropped mid-call. Alta&apos;s fix — one vetted home, one price, one human on
                call. Case closed.
              </p>
            </div>
          </motion.div>

          {/* Sticky stats — two loose rows */}
          <div className="flex flex-wrap items-start justify-center lg:justify-start gap-5 mt-8 lg:ml-2">
            {NOTES.slice(0, 3).map((note, i) => (
              <StickyStat key={note.id} note={note} refCb={setPinRef(note.id)} delay={3 + i} />
            ))}
          </div>
          <div className="flex flex-wrap items-start justify-center lg:justify-start gap-5 lg:ml-10">
            {NOTES.slice(3).map((note, i) => (
              <StickyStat key={note.id} note={note} refCb={setPinRef(note.id)} delay={6 + i} />
            ))}
            {/* Rent receipt sits alongside the second stats row */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              custom={8}
              variants={riseVariants}
              className="relative"
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 inline-block">
                <Pushpin color="blue" />
              </div>
              <RentReceipt rotate={-4} />
            </motion.div>
          </div>

          {/* Testimonial and ticket sit at the bottom */}
          <div className="flex flex-wrap items-start justify-center lg:justify-start gap-6 mt-6 lg:ml-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              custom={9}
              variants={riseVariants}
              className="relative"
            >
              <div
                ref={setPinRef("testimonial")}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 inline-block"
              >
                <Pushpin color="green" />
              </div>
              <TestimonialCard rotate={2} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              custom={10}
              variants={riseVariants}
              className="relative"
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 inline-block">
                <Pushpin color="yellow" />
              </div>
              <TicketStub rotate={-5} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
