import { cn } from "@/lib/utils"

export type PillTabOption = { label: string; value: string }

/**
 * Shared segmented-control used for the "why we're different" reason
 * switcher and the contact form's area picker — same interaction, two
 * different data sets, so it takes plain options instead of being written
 * twice.
 */
const pillBase =
  "px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] border-r border-black last:border-r-0 transition-colors"

export const PillTabs = ({
  options,
  value,
  onChange,
  tone = "light",
  className,
}: {
  options: PillTabOption[]
  value: string
  onChange: (value: string) => void
  tone?: "light" | "dark"
  className?: string
}) => (
  <div
    className={cn(
      "flex flex-wrap w-fit border",
      tone === "dark" ? "border-black" : "border-black",
      className
    )}
  >
    {options.map((option) => {
      const active = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            pillBase,
            active
              ? tone === "dark"
                ? "bg-black text-amber-400"
                : "bg-black text-white"
              : tone === "dark"
                ? "bg-transparent text-white/90 hover:bg-white/10"
                : "bg-white text-black hover:bg-black/5"
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)

/**
 * Multi-select sibling of {@link PillTabs} — same segmented-control grammar,
 * but every option toggles independently. Used by the listings filters, where
 * "Indiranagar and HSR" is a normal thing to ask for.
 */
export const PillToggles = ({
  options,
  values,
  onChange,
  className,
}: {
  options: PillTabOption[]
  values: string[]
  onChange: (values: string[]) => void
  className?: string
}) => (
  <div className={cn("flex flex-wrap w-fit border border-black", className)}>
    {options.map((option) => {
      const active = values.includes(option.value)
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={active}
          onClick={() =>
            onChange(
              active
                ? values.filter((v) => v !== option.value)
                : [...values, option.value]
            )
          }
          className={cn(
            pillBase,
            active
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black/5"
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)
