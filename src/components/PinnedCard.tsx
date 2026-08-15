import { useState } from "react"

export const PinnedCard = ({
  x,
  y,
  width,
  height,
  z,
  url,
}: {
  x: number
  y: number
  width: number
  height: number
  z: number
  url: string
}) => {
  const [hovered, setHovered] = useState(false)

  const scale = 0.85
  const displayWidth = width * scale
  const displayHeight = height * scale

  // Deterministic "random" tilt per card, based on position — so it stays
  // stable across re-renders but each card reads as hand-placed.
  const seed = (x * 13 + y * 7) % 100
  const baseRotate = (seed / 100) * 10 - 5 // -5deg to 5deg
  const rotate = hovered ? baseRotate * 0.4 : baseRotate

  return (
    <div
      style={{ position: 'absolute', left: x, top: y, zIndex: hovered ? 50 : z }}
      className="flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* pushpin */}
      <div className="relative z-10 -mb-1 w-3 h-3 rounded-full bg-linear-to-br from-red-400 via-red-600 to-red-800 border border-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0.5 left-0.5 w-0.75 h-0.75 rounded-full bg-red-200/70" />
      </div>

      {/* card, hanging from the pin */}
      <div
        style={{
          width: displayWidth,
          transform: `perspective(800px) rotateX(3deg) rotate(${rotate}deg)`,
          transformOrigin: 'top center',
          transition: 'transform 150ms ease-out, box-shadow 250ms ease-out',
          boxShadow: hovered
            ? `
              0 1px 1px rgba(0,0,0,0.2),
              0 2px 5px rgba(0,0,0,0.2),
              ${6 + seed % 4}px ${18 + seed % 6}px 24px -8px rgba(0,0,0,0.45),
              ${2 + seed % 3}px ${8}px 10px -4px rgba(0,0,0,0.3)
            `
            : `
              0 1px 1px rgba(0,0,0,0.15),
              0 2px 4px rgba(0,0,0,0.15),
              ${4 + seed % 4}px ${10 + seed % 6}px 16px -6px rgba(0,0,0,0.4),
              ${1 + seed % 3}px ${4}px 6px -2px rgba(0,0,0,0.25)
            `,
        }}
        className="bg-muted flex flex-col border overflow-hidden group"
      >
        <div style={{ height: displayHeight }} className="p-1 w-full overflow-hidden">
          <div className="w-full h-full overflow-hidden">
            <img
              src={url}
              alt="Card"
              className="w-full h-full object-cover transition-transform duration-100 ease-out"
              draggable={false}
            />
          </div>
        </div>
        <div className="h-6 bg-white w-full border-t-black" />
      </div>
    </div>
  )
}