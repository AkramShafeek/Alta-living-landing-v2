import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Composable section header: cursive eyebrow + display title, with an
 * optional trailing note slot (used for the small mono caption that sits
 * opposite the title in most sections). Kept to two required props so it
 * stays useful for any section instead of being shaped around one.
 */
export const SectionHeading = ({
  eyebrow,
  title,
  note,
  tone = "ink",
  className,
}: {
  eyebrow?: string
  title: ReactNode
  note?: ReactNode
  tone?: "ink" | "paper" | "accent"
  className?: string
}) => {
  const eyebrowColor =
    tone === "paper" ? "text-amber-400" : tone === "accent" ? "text-black/70" : "text-black/60"
  const noteColor = tone === "paper" ? "text-white/60" : "text-muted-foreground"

  return (
    <div
      className={cn(
        "flex justify-between items-end gap-6 flex-wrap mb-10",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className={cn("cedarville-cursive-regular text-2xl mb-1", eyebrowColor)}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-4xl md:text-6xl leading-[0.95] tracking-tight">
          {title}
        </h2>
      </div>
      {note && (
        <p
          className={cn(
            "font-mono text-[11px] leading-loose uppercase tracking-[0.16em] max-w-[32ch]",
            noteColor
          )}
        >
          More than 1000 people have signed up already. What are you waiting for?          
        </p>
      )}
    </div>
  )
}
