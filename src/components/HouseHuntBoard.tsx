import { useEffect, useRef, useState } from "react"
import { delayInSeconds, motion } from "framer-motion"

const NOTES = [
  { id: "a", x: 8, y: 18, rotate: -6, text: "Indiranagar\n2BHK — too small" },
  { id: "b", x: 24, y: 42, rotate: 4, text: "Koramangala\n★ good light" },
  { id: "c", x: 15, y: 78, rotate: -3, text: "Whitefield\ntoo far from work" },
  { id: "d", x: 88, y: 25, rotate: 5, text: "HSR Layout\nnear metro?" },
  { id: "e", x: 92, y: 48, rotate: -4, text: "Budget\n₹30,000 / night" },
  { id: "f", x: 80, y: 82, rotate: 3, text: "Jayanagar\nvisited 12/3 ✓" },
]

const CONNECTIONS: [string, string][] = [
  ["a", "b"],
  ["b", "c"],
  ["b", "d"],
  ["d", "e"],
  ["e", "f"],
]

// Timing knobs — tune these two and everything else follows
const NOTE_STAGGER = 0.25 // gap between each note landing
const NOTE_DURATION = 0.5 // how long each note's land animation takes
const LINE_DURATION = 0.9 // how long the whole string takes to draw

const notesDoneAt = NOTE_STAGGER * (NOTES.length - 1) + NOTE_DURATION

// Each note pops in scaled-up + faded, settles to real size — as if dropped from close to the viewer
const noteVariants = {
  hidden: { opacity: 0, scale: 1.2 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: NOTE_DURATION, ease: "easeOut" },
  },
} as const

export const HouseHuntBoard = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const byId = Object.fromEntries(NOTES.map((n) => [n.id, n]))

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {size.width > 0 && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${size.width} ${size.height}`}
          // no preserveAspectRatio="none" needed — viewBox now matches real pixel aspect ratio 1:1
        >
          {CONNECTIONS.map(([fromId, toId], i) => {
            const from = byId[fromId]
            const to = byId[toId]
            // convert percentage coords to actual pixel coords using measured size
            const fx = (from.x / 100) * size.width
            const fy = (from.y / 100) * size.height
            const tx = (to.x / 100) * size.width
            const ty = (to.y / 100) * size.height
            const mx = (fx + tx) / 2 + (i % 2 === 0 ? 24 : -24)
            const my = (fy + ty) / 2 + (i % 2 === 0 ? -18 : 18)
            return (
              <motion.path
                key={i}
                d={`M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`}
                fill="none"
                stroke="#7a1f1f"
                strokeWidth="0.4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: {
                    duration: LINE_DURATION,
                    ease: "easeInOut",
                    delay: notesDoneAt + i * 0.15,
                  },
                  opacity: { duration: 0.2, delay: notesDoneAt + i * 0.15 },
                }}
              />
            )
          })}
        </svg>
      )}

      {/* notes unchanged */}
      {NOTES.map((note, i) => (
        <motion.div
          key={note.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${note.x}%`, top: `${note.y}%` }}
          initial="hidden"
          animate="visible"
          variants={noteVariants}
          transition={{ ...noteVariants.visible.transition, delay: i * NOTE_STAGGER + 5 }}
        >
          <div className="w-2 h-2 rounded-full bg-red-900 -mb-1 z-10 shadow-sm" />
          <div
            style={{ transform: `rotate(${note.rotate}deg)` }}
            className="bg-amber-50 border border-black/40 shadow-[2px_3px_0px_rgba(0,0,0,0.25)] px-3 py-2 w-28 text-center"
          >
            <p className="text-sm cedarville-cursive-regular leading-snug text-black/70 whitespace-pre-line">
              {note.text}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}