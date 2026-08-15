import { PricingCard } from "@/components/PricingCard"
import { pricingTiers } from "@/content/site"

export const PricingSection = () => {
  return (
    <section className="px-8 py-19 bg-background">
      <div className="text-center mb-12 flex flex-col items-center">
        <p className="cedarville-cursive-regular text-2xl text-black/65 mb-1">one price, everything in</p>
        <h2 className="font-semibold text-4xl md:text-6xl leading-none tracking-tight">
          Stay a week or a year
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-9 max-w-[1240px] mx-auto">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>
    </section>
  )
}
