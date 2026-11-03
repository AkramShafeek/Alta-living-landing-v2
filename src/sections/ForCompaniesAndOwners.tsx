import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { enquiryWhatsApp, forCompanies, listYourHome } from "@/content/site"
import { whatsappTextLink } from "@/lib/whatsapp"

const ctaClasses =
  "inline-flex items-center gap-2.5 self-start rounded-full border-2 border-black px-7 py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] shadow-[4px_4px_0_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"

/**
 * Two audiences who are not looking for a home to live in: companies housing
 * staff, and owners who want theirs run. Side by side, because each is one
 * short pitch and one button — and each button opens WhatsApp with the
 * opening line already written for that audience.
 */
export const ForCompaniesAndOwners = () => (
  <section className="grid border-b-2 border-black md:grid-cols-2">
    <div
      id="for-companies"
      className="flex flex-col gap-5 border-b-2 border-black bg-white px-8 py-16 md:border-r-2 md:border-b-0 md:px-12 md:py-20"
    >
      <p className="cedarville-cursive-regular text-2xl text-black/65">{forCompanies.eyebrow}</p>
      <h2 className="text-4xl leading-[0.95] tracking-tight text-balance md:text-5xl">{forCompanies.title}</h2>
      <p className="max-w-xl text-base leading-relaxed text-black/70 text-pretty">{forCompanies.body}</p>
      <a
        href={whatsappTextLink(enquiryWhatsApp, forCompanies.whatsappText)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${ctaClasses} mt-2 bg-amber-400 text-black hover:bg-black hover:text-amber-400`}
      >
        {forCompanies.ctaLabel} <ArrowRightIcon size={16} aria-hidden />
      </a>
    </div>

    <div id="list-your-home" className="flex flex-col gap-5 bg-black px-8 py-16 text-background md:px-12 md:py-20">
      <p className="cedarville-cursive-regular text-2xl text-amber-400">{listYourHome.eyebrow}</p>
      <h2 className="text-4xl leading-[0.95] tracking-tight text-balance md:text-5xl">{listYourHome.title}</h2>
      <p className="max-w-xl text-base leading-relaxed text-background/75 text-pretty">{listYourHome.body}</p>
      <ul className="flex flex-col gap-2.5">
        {listYourHome.bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black">
              <CheckIcon size={13} aria-hidden />
            </span>
            {bullet}
          </li>
        ))}
      </ul>
      <a
        href={whatsappTextLink(enquiryWhatsApp, listYourHome.whatsappText)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${ctaClasses} mt-2 border-background bg-background text-black shadow-[4px_4px_0_rgba(247,243,234,.35)] hover:bg-amber-400`}
      >
        {listYourHome.ctaLabel} <ArrowRightIcon size={16} aria-hidden />
      </a>
    </div>
  </section>
)
