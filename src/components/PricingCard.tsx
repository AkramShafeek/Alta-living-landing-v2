import { cn } from "@/lib/utils"
import type { pricingTiers } from "@/content/site"

const TONE_CLASSES = {
  blue: "bg-blue-50",
  accent: "bg-amber-400",
  sage: "bg-green-50",
} as const

export const PricingCard = ({ tier }: { tier: (typeof pricingTiers)[number] }) => (
  <div
    className={cn(
      "border-2 border-black shadow-[8px_10px_0_#000] p-8 flex flex-col gap-4.5 relative",
      TONE_CLASSES[tier.tone],
      tier.featured && "md:-translate-y-3.5"
    )}
  >
    {tier.badge && (
      <span className="absolute right-0 -top-4 px-3 py-1.5 bg-black text-background border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
        {tier.badge}
      </span>
    )}
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">{tier.name}</p>
    <div>
      <span className="bricolage-grotesque-500 text-4xl tracking-tight">{tier.price}</span>
      <span className="font-mono text-xs tracking-[0.14em] text-black/70"> {tier.unit}</span>
    </div>
    <p className="text-sm text-black/70">{tier.description}</p>
    <div className="border-t-2 border-black pt-4 flex flex-col gap-2.5 text-sm">
      {tier.features.map((f) => (
        <span key={f}>✓ {f}</span>
      ))}
    </div>
    <a
      href="#contact"
      className={cn(
        "mt-auto block text-center py-4 border-2 border-black font-mono text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
        tier.featured
          ? "bg-black text-background shadow-[5px_6px_0_#000] hover:bg-background hover:text-black"
          : "bg-white shadow-[5px_6px_0_#000] hover:bg-black hover:text-background"
      )}
    >
      {tier.cta}
    </a>
  </div>
)
