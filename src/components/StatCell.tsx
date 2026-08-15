import { cn } from "@/lib/utils"

/**
 * One "big figure over a small mono label" cell. Used by the numbers bar,
 * the who-we-are bento grid and anywhere else a stat needs to show up —
 * kept to value/label so it never grows a feature-specific prop.
 */
export const StatCell = ({
  value,
  label,
  tone = "ink",
  className,
}: {
  value: string
  label: string
  tone?: "ink" | "paper"
  className?: string
}) => (
  <div className={cn("flex flex-col gap-3", className)}>
    <span className="bricolage-grotesque-500 text-6xl md:text-7xl leading-[0.85] tracking-tight">
      {value}
    </span>
    <span className={cn("w-10 border-t-2", tone === "paper" ? "border-white" : "border-black")} />
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.14em] leading-relaxed whitespace-pre-line",
        tone === "paper" ? "text-white/65" : "text-black/70"
      )}
    >
      {label}
    </p>
  </div>
)
