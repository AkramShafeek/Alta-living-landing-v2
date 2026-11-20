import { heroAreas } from "@/content/site"
import { CtaButton } from "./CtaButton"
import { WHEEL } from "./AreasScene.anim"

/**
 * SCENE 3 · AREAS
 *   Text slides in from the right and stays right-aligned. On the left, the
 *   neighbourhoods are spokes of a wheel pivoting just off the left edge:
 *   the active one points straight right with a short arrow at its end, the
 *   rest fan away above and below, fading with a subtle blur. Scrolling
 *   turns the wheel smoothly, and the whole panel changes to each area's
 *   pop colour as it reaches the arrow (colours: heroAreas.wheel in
 *   content/site.ts). Then it rolls away left, the text tips away right and
 *   the panel goes back to bone. (Wheel geometry: WHEEL in AreasScene.anim.ts.)
 * Labels it adds: "areas", "spin", "areasOut".
 */

const View = () => {
  const { eyebrow, title, body, footer, wheel } = heroAreas

  // The real areas sit at k = 0..n-1; copies before and after keep the wheel
  // full, so it reads as an endless list.
  const words = []
  for (
    let k = -WHEEL.repeatsBefore;
    k < wheel.length + WHEEL.repeatsAfter;
    k++
  ) {
    words.push({
      k,
      area: wheel[((k % wheel.length) + wheel.length) % wheel.length],
    })
  }

  return (
    <>
      {/* ── The wheel, left ── */}
      <div
        data-areas-wheel
        data-count={wheel.length}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[62vw]"
        style={{ fontSize: WHEEL.font }}
      >
        {/* Each word sits on the pivot (just off the left edge) and is moved
            out along its spoke by the scroll animation. */}
        {words.map(({ k, area }) => (
          <span
            key={k}
            data-wheel-word
            data-k={k}
            className="absolute top-1/2 origin-left leading-none font-extrabold tracking-tight whitespace-nowrap will-change-transform"
            style={{ left: `calc(${WHEEL.anchorX} - ${WHEEL.radius * 100}vh)` }}
          >
            {area.name}
          </span>
        ))}
        {/* A short arrow in front of the active word, pointing at it. */}
        <span
          className="absolute top-1/2 -translate-x-full -translate-y-1/2 leading-none font-bold"
          style={{
            left: `calc(${WHEEL.anchorX} - ${WHEEL.arrowGap})`,
            fontSize: WHEEL.arrowSize,
          }}
        >
          →
        </span>
      </div>

      {/* Screen-reader version of the wheel */}
      <ul className="sr-only">
        {wheel.map((area) => (
          <li key={area.name}>{area.name}</li>
        ))}
      </ul>

      {/* ── Text, right-aligned ── */}
      <div
        data-areas-text
        className="pointer-events-none absolute inset-y-0 right-6 flex items-center justify-end md:right-16"
      >
        <div className="max-w-md text-right">
          <p
            data-areas-item
            className="cedarville-cursive-regular mb-3 text-xl opacity-70 md:text-2xl"
          >
            {eyebrow}
          </p>
          <h2
            data-areas-item
            className="text-[clamp(2rem,4vw,3.75rem)] leading-[0.95] font-extrabold tracking-tight text-balance"
          >
            {title}
          </h2>
          <p
            data-areas-item
            className="mt-6 text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed opacity-75"
          >
            {body}
          </p>
          <p
            data-areas-item
            className="mt-6 font-mono text-[11px] tracking-[0.25em] uppercase opacity-60"
          >
            {footer}
          </p>
          {/* The button's landing spot in this scene (it glides here from
              the promise scene). An invisible copy holds exactly its size. */}
          <div
            data-areas-cta-slot
            className="invisible mt-8 ml-auto w-max"
            aria-hidden="true"
          >
            <CtaButton tabIndex={-1} />
          </div>
        </div>
      </div>
    </>
  )
}

export const AreasScene = View
