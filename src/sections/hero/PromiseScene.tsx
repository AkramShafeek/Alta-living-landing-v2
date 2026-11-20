import { WaveText } from "@/components/WaveText"
import { immersiveHero } from "@/content/site"
import { CtaButton } from "./CtaButton"
import { PROMISE_SQUARES } from "./PromiseScene.anim"

/**
 * SCENE 2 · PROMISE
 *   The promise slides in from the top left; the button glides into its slot
 *   under it; big dark squares pop open and shut here and there behind the
 *   headline; a strip of home photos runs right to left, all the way off the
 *   screen. Then everything is pulled off to the right — the headline letter
 *   by letter, rightmost first, with inertia.
 * Labels it adds: "promise", "squares", "pull".
 */

/** The headline lines, split into letters (needed for the letter-by-letter pull). */
const HeadlineLines = ({ tagged = false }: { tagged?: boolean }) =>
  immersiveHero.promise.headline.map((line, i) => (
    <span
      key={i}
      data-promise-line-text={tagged || undefined}
      className="block whitespace-nowrap"
    >
      <WaveText text={line} as="span" decorative />
    </span>
  ))

const View = () => {
  const { promise, strip } = immersiveHero

  return (
    <>
      {/* ── The promise, top left ── */}
      <div
        data-hero-promise
        className="pointer-events-none absolute top-24 left-6 max-w-160 pr-6 md:top-28 md:left-16"
      >
        <p
          data-promise-item
          className="cedarville-cursive-regular mb-3 text-xl opacity-70 md:text-2xl"
        >
          {promise.eyebrow}
        </p>
        <h2
          data-promise-item
          className="relative text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[0.95] font-extrabold tracking-tight"
        >
          <span className="sr-only">{promise.headline.join(" ")}</span>
          {/* The real headline. Its letters are what get pulled off. */}
          <span data-promise-base aria-hidden="true" className="block">
            <HeadlineLines tagged />
          </span>
          {/* The squares. Each is a dark box holding a second copy of the
              headline in the pop colour, offset so it lines up exactly with
              the real text and clipped to the box: wherever a square sits,
              the letters on it change colour. The layer is a size container,
              so `100cqw` makes each copy exactly as wide as the real one. */}
          <span
            aria-hidden="true"
            className="@container pointer-events-none absolute inset-0"
          >
            {PROMISE_SQUARES.map((sq, i) => (
              <span
                key={i}
                data-promise-square
                className="absolute overflow-hidden"
                style={{
                  left: `${sq.x}em`,
                  top: `${sq.y}em`,
                  width: `${sq.size}em`,
                  height: `${sq.size}em`,
                  background: promise.squareColor,
                }}
              >
                <span
                  className="absolute block"
                  style={{
                    left: `${-sq.x}em`,
                    top: `${-sq.y}em`,
                    width: "100cqw",
                    color: promise.popColor,
                  }}
                >
                  <HeadlineLines />
                </span>
              </span>
            ))}
          </span>
        </h2>
        <div
          data-promise-line
          className="my-6 h-px w-40 origin-left bg-current opacity-40"
        />
        <p
          data-promise-item
          className="max-w-md text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed opacity-75"
        >
          {promise.body}
        </p>
        {/* The button's landing spot. An invisible copy of the button holds
            exactly its size; the real one glides over it on scroll. */}
        <div data-cta-slot className="invisible mt-8 w-max" aria-hidden="true">
          <CtaButton tabIndex={-1} />
        </div>
      </div>

      {/* ── The photo strip, along the bottom ── */}
      <div
        data-hero-strip
        className="pointer-events-none absolute inset-x-0 bottom-6 md:bottom-8"
      >
        <div className="mb-4 flex items-center gap-4 px-6 md:px-16">
          <span
            data-strip-caption
            className="font-mono text-[11px] tracking-[0.25em] whitespace-nowrap uppercase opacity-60"
          >
            {strip.caption}
          </span>
          <div
            data-strip-line
            className="h-px flex-1 origin-right bg-current opacity-20"
          />
        </div>

        <div
          data-strip-track
          className="flex w-max gap-0 will-change-transform md:gap-1"
        >
          {strip.photos.map((photo, i) => (
            <figure
              key={`${photo.src}-${i}`}
              className="w-[62vw] shrink-0 sm:w-[34vw] lg:w-[22vw]"
            >
              <div className="aspect-4/3 overflow-hidden rounded-none">
                <img
                  src={photo.src}
                  alt={photo.label}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 flex justify-start gap-2 font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{photo.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  )
}

export const PromiseScene = View
