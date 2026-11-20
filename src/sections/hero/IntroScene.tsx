import { WaveText } from "@/components/WaveText"
import { immersiveHero } from "@/content/site"
import { CtaButton } from "./CtaButton"

/**
 * SCENE 1 · INTRO
 *   load    The body copy reveals word by word in the centre, the button
 *           rises above it, the headline fades in at the bottom of the screen.
 *   scroll  The copy shrinks and fades; the button lifts out of the way; the
 *           headline lifts to the centre in a wave, then splits — first half
 *           out left, second out right.
 * Labels it adds to the timeline: "start", "split".
 */

const View = () => {
  const { headline, body } = immersiveHero
  const bodyWords = body.split(" ")

  return (
    <>
      {/* Button + body copy, centred. The button sits in its own mover
          wrapper (moved by the scroll through scenes 1 and 2); z-20 keeps it
          above every later layer so it stays clickable all the way. */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6">
          <div
            data-hero-cta-mover
            className="relative z-20 will-change-transform"
          >
            <CtaButton data-hero-cta />
          </div>
          <p
            data-hero-body
            className="max-w-xl text-center text-[clamp(0.95rem,1.5vw,1.2rem)] leading-snug tracking-tight text-balance opacity-80"
          >
            {bodyWords.map((word, i) => (
              <span key={i}>
                <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span data-hero-word className="inline-block">
                    {word}
                  </span>
                </span>
                {i < bodyWords.length - 1 && " "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* The headline. Laid out centred; the scroll starts it at the bottom. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <div data-hero-headline-intro>
          <h1
            data-hero-headline
            // One line, never wraps: the size is in vw so the sentence
            // scales with the screen width. Raise 5.4vw for bigger text
            // (too high and it runs off the sides).
            className="text-center text-[5.4vw] leading-none font-extrabold tracking-tight whitespace-nowrap"
          >
            <span className="sr-only">{headline.join(" ")}</span>
            {headline.map((part, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span
                  data-hero-half
                  className="inline-block will-change-transform"
                >
                  <WaveText text={part} as="span" decorative />
                </span>
              </span>
            ))}
          </h1>
        </div>
      </div>
    </>
  )
}

export const IntroScene = View
