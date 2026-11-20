import { cn } from "@/lib/utils"

type WaveTextProps = {
  text: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  className?: string
  /** Extra classes for every letter span (e.g. a gradient or colour). */
  charClassName?: string
  /**
   * Hide this from screen readers entirely. Use it when the parent already
   * carries the full sentence (e.g. one heading built from several WaveTexts).
   */
  decorative?: boolean
}

/**
 * Splits text into one <span data-wave-char> per letter so GSAP can animate
 * each letter on its own. Purely presentational: it does not animate anything
 * itself. Animate it from the parent with
 *
 *   gsap.utils.toArray("[data-wave-char]", root)
 *
 * Words are wrapped in nowrap spans, so lines only break between words, never
 * mid-word. Screen readers get the plain sentence once (sr-only), not
 * letter-by-letter.
 */
export const WaveText = ({
  text,
  as: Tag = "h1",
  className,
  charClassName,
  decorative = false,
}: WaveTextProps) => {
  const words = text.split(" ")

  return (
    <Tag className={className} aria-hidden={decorative || undefined}>
      {!decorative && <span className="sr-only">{text}</span>}
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, c) => (
                <span
                  key={c}
                  data-wave-char
                  className={cn("inline-block will-change-transform", charClassName)}
                >
                  {char}
                </span>
              ))}
            </span>
            {/* A real space between words, so the browser can wrap there. */}
            {w < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </Tag>
  )
}
