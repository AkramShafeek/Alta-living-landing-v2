import { heroHowItWorks } from "@/content/site"

/**
 * SCENE 4 · HOW IT WORKS
 *   Four tall, pop-coloured columns standing on the bottom of the screen,
 *   rising in height left to right like steps. Each rises up from below in
 *   turn, its text slides in, and a round puzzle tab locks it to the next.
 *   Then a pause to read, and they sink back down.
 * Labels it adds: "how", "howOut".
 */

/** Column heights, left to right, as a share of the screen height. */
const COLUMN_HEIGHTS = ["52%", "60%", "68%", "76%"]

/**
 * The puzzle tab: a round knob in a column's colour on its right edge,
 * half sticking into the next column so the two read as locked together.
 *   size        — diameter
 *   fromBottom  — how high up each column it sits (varied so the joins don't
 *                 line up in a row)
 */
const TAB = { size: "3.75rem", fromBottom: ["22%", "34%", "26%"] }

const View = () => {
  const { eyebrow, title, steps } = heroHowItWorks

  return (
    <div data-how className="pointer-events-none absolute inset-0">
      {/* Title, top left */}
      <div className="absolute top-24 left-6 max-w-3xl pr-6 md:top-28 md:left-16">
        <p
          data-how-title
          className="mb-3 font-mono text-[11px] tracking-[0.25em] uppercase opacity-60"
        >
          {eyebrow}
        </p>
        <h2
          data-how-title
          className="text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.02] font-extrabold tracking-tight"
        >
          {title}
        </h2>
      </div>

      {/* The columns, standing on the bottom edge */}
      <ol className="absolute inset-x-0 bottom-0 flex h-full items-end">
        {steps.map((step, i) => (
          <li
            key={step.title}
            data-how-col
            className="relative flex-1 will-change-transform"
            style={{
              height: COLUMN_HEIGHTS[i],
              background: step.color,
              color: step.ink,
              // Left columns sit above right ones, so each tab overlaps the
              // neighbour it plugs into.
              zIndex: steps.length - i,
            }}
          >
            {i < steps.length - 1 && (
              <span
                data-how-tab
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  width: TAB.size,
                  height: TAB.size,
                  right: `calc(${TAB.size} / -2)`,
                  bottom: TAB.fromBottom[i],
                  background: step.color,
                }}
              />
            )}
            <div className="flex flex-col gap-3 p-6 md:p-8">
              <span
                data-how-text
                className="text-[clamp(2.75rem,5.5vw,5rem)] leading-none font-extrabold tracking-tight"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                data-how-text
                className="mt-2 text-[clamp(1.1rem,1.6vw,1.5rem)] leading-tight font-bold tracking-tight"
              >
                {step.title}
              </h3>
              <p
                data-how-text
                className="max-w-xs text-[clamp(0.85rem,1vw,1rem)] leading-relaxed opacity-85"
              >
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export const HowItWorksScene = View
