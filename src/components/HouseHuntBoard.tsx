import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"

// ─── Data ────────────────────────────────────────────────────────────────

const NOTES = [
  { id: "a", x: 8, y: 18, rotate: -6, text: "Indiranagar\n2BHK — too small" },
  { id: "b", x: 24, y: 42, rotate: 4, text: "Koramangala\n★ good light" },
  { id: "c", x: 15, y: 78, rotate: -3, text: "Whitefield\ntoo far from work" },
  { id: "d", x: 88, y: 25, rotate: 5, text: "HSR Layout\nnear metro?" },
  { id: "e", x: 92, y: 48, rotate: -4, text: "Budget\n₹30,000 / night" },
  { id: "f", x: 80, y: 82, rotate: 3, text: "Jayanagar\nvisited 12/3 ✓" },
] as const

const CONNECTIONS: [string, string][] = [
  ["a", "b"],
  ["b", "c"],
  ["b", "d"],
  ["d", "e"],
  ["e", "f"],
]

// ─── Timing ──────────────────────────────────────────────────────────────

const NOTE_STAGGER = 0.25
const NOTE_DURATION = 0.5
const LINE_DURATION = 0.9

const noteVariants = {
  hidden: {
    opacity: 0,
    scale: 2.2,
  },

  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: NOTE_DURATION,
      ease: "easeOut",
      delay: 2 + i * NOTE_STAGGER,
    },
  }),
} as const

// ─── Geometry helpers ────────────────────────────────────────────────────

type Point = { x: number; y: number }

function computeEdgePath(p0: Point, p1: Point, bow: number, side: 1 | -1): string {
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const len = Math.hypot(dx, dy) || 1 // guard against coincident points
  const perpX = (-dy / len) * bow * side
  const perpY = (dx / len) * bow * side

  const cx = (p0.x + p1.x) / 2 + perpX
  const cy = (p0.y + p1.y) / 2 + perpY

  return `M ${p0.x} ${p0.y} Q ${cx} ${cy} ${p1.x} ${p1.y}`
}

// ─── Component ───────────────────────────────────────────────────────────

export const HouseHuntBoard = ({ startDelay = 10 }: { startDelay?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // ONE useRef call holding a Map — not one ref per note.
  // Populated via callback refs below, which are plain functions, not hooks,
  // so they're safe to create dynamically inside .map().
  const pinRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const [pinPositions, setPinPositions] = useState<Record<string, Point>>({})
  const [linesReady, setLinesReady] = useState(false)
  const landedCount = useRef(0)

  const measurePins = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const next: Record<string, Point> = {}

    pinRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect()
      console.log(el);
      console.log(rect);
      next[id] = {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      }
    })

    setPinPositions(next)
  }, [])

  // Re-measure on resize, but only after the initial land+measure has happened
  // (measuring before that would catch notes mid-scale-animation).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      if (linesReady) measurePins()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [linesReady, measurePins])

  const handleNoteLanded = () => {
    landedCount.current += 1
    if (landedCount.current === NOTES.length) {
      measurePins()
      setLinesReady(true)
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* {NOTES.map((note, i) => (
        <motion.div
          key={note.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${note.x}%`, top: `${note.y}%` }}
          initial="hidden"
          animate="visible"
          variants={noteVariants}
          transition={{ ...noteVariants.visible.transition, delay: startDelay + i * NOTE_STAGGER }}
          onAnimationComplete={handleNoteLanded}
        >          
          <div className="w-3 h-3 opacity-0" />
          <div
            style={{ transform: `rotate(${note.rotate}deg)` }}
            className="bg-amber-50 border border-black/40 shadow-[2px_3px_0px_rgba(0,0,0,0.25)] px-3 py-2 w-28 text-center"
          >
            <p className="text-[10px] font-mono leading-snug text-black/70 whitespace-pre-line">
              {note.text}
            </p>
          </div>
        </motion.div>
      ))} */}

      <svg className="absolute inset-0 w-full h-full z-20">
        {linesReady &&
          CONNECTIONS.map(([fromId, toId], i) => {
            const from = pinPositions[fromId]
            const to = pinPositions[toId]
            if (!from || !to) return null

            const d = computeEdgePath(from, to, 24, i % 2 === 0 ? 1 : -1)

            return (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="#7a1f1f90"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  pathLength: { duration: LINE_DURATION, ease: "easeInOut", delay: i * 0.1 },
                  opacity: { duration: 0.2, delay: i * 0.1 },
                }}
              />
            )
          })}
      </svg>

      {/* {NOTES.map((note, i) => (
        <motion.div
          key={note.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: `${note.x}%`, top: `${note.y}%`, translateY: '-10px' }}
          initial="hidden"
          animate="visible"
          variants={noteVariants}
          transition={{ ...noteVariants.visible.transition, delay: startDelay + i * NOTE_STAGGER }}
        >
          <div
            ref={(el) => {
              if (el) pinRefs.current.set(note.id, el)
              else pinRefs.current.delete(note.id)
            }}
            className="relative w-3 h-3 rounded-full bg-linear-to-br from-red-400 via-red-600 to-red-800 border border-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute top-0.5 left-0.5 w-0.75 h-0.75 rounded-full bg-red-200/70" />
          </div>
        </motion.div>
      ))} */}

      {NOTES.map((note, i) => (
        <div
          key={note.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
          }}
        >
          <motion.div
            custom={i}
            initial="hidden"
            animate="visible"
            variants={noteVariants}
            onAnimationComplete={handleNoteLanded}
            className="flex flex-col items-center"
          >
            <div
              ref={(el) => {
                if (el) {
                  pinRefs.current.set(note.id, el)
                } else {
                  pinRefs.current.delete(note.id)
                }
              }}
              className="relative z-40 -mb-1.5 w-3 h-3 rounded-full bg-linear-to-br from-red-400 via-red-600 to-red-800 border border-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute top-0.5 left-0.5 w-0.75 h-0.75 rounded-full bg-red-200/70" />
            </div>

            <div
              style={{ transform: `rotate(${note.rotate}deg)` }}
              className="bg-amber-50 border border-black/40 shadow-[2px_3px_0px_rgba(0,0,0,0.25)] px-3 py-2 w-28 text-center"
            >
              <p className="text-[10px] cedarville-cursive-regular leading-snug text-black/70 whitespace-pre-line">
                {note.text}
              </p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  )
}