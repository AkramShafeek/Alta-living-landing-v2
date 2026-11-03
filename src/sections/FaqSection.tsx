import { PlusIcon } from "lucide-react"
import { faqs } from "@/content/site"

/**
 * Questions people ask before they enquire. Native <details>, so each answer
 * opens without script, works with the keyboard, and is found by in-page
 * search even while closed.
 */
export const FaqSection = () => (
  <section id="faq" className="border-b-2 border-black bg-background px-8 py-19 md:py-22">
    <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="cedarville-cursive-regular mb-1 text-2xl text-black/65">good to know</p>
        <h2 className="text-4xl leading-[0.95] tracking-tight md:text-6xl">Questions, answered.</h2>
      </div>

      <div className="border-t-2 border-black">
        {faqs.map((faq) => (
          <details key={faq.q} className="group border-b border-black/25">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {faq.q}
              <PlusIcon
                size={20}
                aria-hidden
                className="shrink-0 transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="max-w-2xl pb-6 text-base leading-relaxed text-black/70">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
)
