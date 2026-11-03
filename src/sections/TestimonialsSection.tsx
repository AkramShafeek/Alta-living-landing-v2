import { SectionHeading } from "@/components/SectionHeading"
import { MarqueeRow } from "@/components/MarqueeRow"
import { TestimonialCard } from "@/components/TestimonialCard"
import { reviewsSection, testimonialsRowA, testimonialsRowB, type Testimonial } from "@/content/site"

const renderCard = (t: Testimonial, i: number) => (
  <div key={`${t.name}-${i}`} className="w-90 shrink-0">
    <TestimonialCard quote={t.quote} name={t.name} location={t.location} rating={t.rating} tone={t.tone} />
  </div>
)

/**
 * Real reviews only. While site.ts has none, the section is not rendered —
 * an empty reviews band reads worse than no band, and invented reviews are
 * not an option.
 */
export const TestimonialsSection = () => {
  if (testimonialsRowA.length + testimonialsRowB.length === 0) return null

  return (
    <section className="py-16 md:py-20 border-b-2 border-black overflow-hidden">
      <div className="px-8">
        <SectionHeading eyebrow={reviewsSection.eyebrow} title={reviewsSection.title} />
      </div>
      <div className="flex flex-col gap-2">
        <MarqueeRow items={testimonialsRowA} renderItem={renderCard} direction="left" speed={44} />
        <MarqueeRow items={testimonialsRowB} renderItem={renderCard} direction="right" speed={52} />
      </div>
    </section>
  )
}
