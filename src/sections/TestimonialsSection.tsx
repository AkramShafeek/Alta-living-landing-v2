import { SectionHeading } from "@/components/SectionHeading"
import { MarqueeRow } from "@/components/MarqueeRow"
import { TestimonialCard } from "@/components/TestimonialCard"
import { testimonialsRowA, testimonialsRowB, type Testimonial } from "@/content/site"

const renderCard = (t: Testimonial, i: number) => (
  <div key={`${t.name}-${i}`} className="w-90 shrink-0">
    <TestimonialCard quote={t.quote} name={t.name} location={t.location} rating={t.rating} tone={t.tone} />
  </div>
)

export const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-20 border-b-2 border-black overflow-hidden">
      <div className="px-8">
        <SectionHeading
          eyebrow="1,200+ reviews"
          title="What people love about us"
          note="← row one scrolls left · row two scrolls right →"
        />
      </div>
      <div className="flex flex-col gap-2">
        <MarqueeRow items={testimonialsRowA} renderItem={renderCard} direction="left" speed={44} />
        <MarqueeRow items={testimonialsRowB} renderItem={renderCard} direction="right" speed={52} />
      </div>
    </section>
  )
}
