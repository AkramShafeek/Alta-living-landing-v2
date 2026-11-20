import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type TileGridProps = {
  /** Edge length of one tile in px. Shrinks to 60% on small screens. */
  size?: number
  /** Space between tiles in px. */
  gap?: number
  className?: string
}

/**
 * A background of big square tiles, filling its (positioned) parent. Hovering
 * a tile lifts it off the board. Like HouseHuntBoard it sits behind the hero
 * content: anything layered on top must be `pointer-events-none` (with
 * `pointer-events-auto` on its buttons) or the tiles underneath never see the
 * mouse.
 *
 * The hover target is the fixed grid cell, and only the tile inside it moves.
 * Hovering the moving tile directly would jitter: lift it and the cursor
 * falls off its bottom edge, which drops it, which puts it back under the
 * cursor.
 */
export const TileGrid = ({ size = 400, gap = 12, className }: TileGridProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState({ cols: 0, rows: 0, tile: size })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      const tile = width < 640 ? Math.round(size * 0.6) : size
      const step = tile + gap
      // One extra row and column so the grid always bleeds past the edges.
      setGrid({
        cols: Math.ceil(width / step) + 1,
        rows: Math.ceil(height / step) + 1,
        tile,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [size, gap])

  const count = grid.cols * grid.rows

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden bg-neutral-900", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, ${grid.tile}px)`,
          gridAutoRows: `${grid.tile}px`,
          // gap,
          // Centre the grid so the cut-off tiles are even on both sides.
          transform: `translate(${-grid.tile / 2}px, ${-grid.tile / 2}px)`,
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="group">
            <div
              className={cn(
                "size-full rounded-2xl border border-black/10 bg-white/90",
                "transition-[translate,box-shadow,background-color,border-color] duration-300 ease-out",
                "group-hover:-translate-y-3 group-hover:border-black group-hover:bg-white",
                "group-hover:shadow-[6px_10px_0_#000] hover:z-40",
                "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
              )}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
