import { useState } from "react"
import { PillTabs } from "@/components/PillTabs"
import { cn } from "@/lib/utils"
import { contactRows as defaultContactRows, heroContent } from "@/content/site"

const inputClasses =
  "px-3.5 py-3.5 bg-background border-2 border-black text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_#000] transition-shadow"

export type ContactRow = { k: string; v: string }

export type ContactCardProps = {
  eyebrow?: string
  title?: string
  body?: string
  rows?: ContactRow[]
  /** Area picker options. Pass an empty array to hide the picker entirely —
   *  the property page already knows which home the enquiry is about. */
  areas?: string[]
  defaultArea?: string
  submitLabel?: string
  sentLabel?: string
  /** Line beside the submit button. Receives the selected area, if any. */
  footnote?: (area: string) => string
  /** Extra field rendered above "Anything else", e.g. a locked property name. */
  subject?: { label: string; value: string }
  messagePlaceholder?: string
  className?: string
}

/**
 * The enquiry card, lifted out of the home page's contact section so the
 * property page can reuse it with its own copy, contact rows and subject.
 * Every prop falls back to the home page's original content, so
 * `<ContactCard />` renders exactly what the landing page always rendered.
 */
export const ContactCard = ({
  eyebrow = "talk to a human",
  title = "Contact us",
  body = "Tell us your dates and the area you want to be in. We reply the same day, and it is one of the four of us — never a bot.",
  rows = defaultContactRows,
  areas = heroContent.areas,
  defaultArea,
  submitLabel = "Send enquiry",
  sentLabel = "Enquiry sent ✓",
  footnote = (area) => `Interested in ${area} · reply within one working day`,
  subject,
  messagePlaceholder = "Two of us, both work from home — a second desk matters more than a second bedroom.",
  className,
}: ContactCardProps) => {
  const [area, setArea] = useState(defaultArea ?? areas[0] ?? "")
  const [sent, setSent] = useState(false)

  return (
    <div
      className={cn(
        "grid md:grid-cols-[0.85fr_1.15fr] border-2 border-black shadow-[8px_10px_0_#000] bg-white",
        className
      )}
    >
      <div className="p-9 md:p-11 border-b-2 md:border-b-0 md:border-r-2 border-black bg-blue-50 flex flex-col gap-5">
        <p className="cedarville-cursive-regular text-2xl text-black/70">{eyebrow}</p>
        <h2 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight">{title}</h2>
        <p className="text-base text-black/70 text-balance">{body}</p>
        <div className="flex flex-col border-t-2 border-black">
          {rows.map((row) => (
            <div
              key={row.k}
              className="flex justify-between gap-4 py-3 border-b border-black/20 font-mono text-[11px] uppercase tracking-[0.14em]"
            >
              <span className="text-muted-foreground">{row.k}</span>
              <span>{row.v}</span>
            </div>
          ))}
        </div>
      </div>

      <form
        className="p-9 md:p-11 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
            Your name
            <input type="text" placeholder="Priya Menon" className={inputClasses} />
          </label>
          <label className="flex flex-col gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
            Email or phone
            <input type="text" placeholder="priya@work.in" className={inputClasses} />
          </label>
        </div>

        {subject && (
          <label className="flex flex-col gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
            {subject.label}
            <input
              type="text"
              readOnly
              value={subject.value}
              className={`${inputClasses} bg-amber-50 font-semibold`}
            />
          </label>
        )}

        {areas.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
              Area you want
            </span>
            <PillTabs
              options={areas.map((a) => ({ label: a, value: a }))}
              value={area}
              onChange={setArea}
            />
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
            Move-in date
            <input type="text" placeholder="12 / 09 / 2026" className={inputClasses} />
          </label>
          <label className="flex flex-col gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
            How long
            <input type="text" placeholder="3 months" className={inputClasses} />
          </label>
        </div>

        <label className="flex flex-col gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
          Anything else
          <textarea rows={3} placeholder={messagePlaceholder} className={`${inputClasses} resize-y`} />
        </label>

        <div className="flex items-center gap-4.5 flex-wrap">
          <button
            type="submit"
            className="inline-flex items-center gap-2.5 px-7 py-4.5 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[0px_0px_0_#000] active:translate-x-[5px] active:translate-y-[5px] hover:shadow-[3px_3px_0_#000] transition-all"
          >
            {sent ? sentLabel : submitLabel} <span className="text-lg leading-none">→</span>
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {footnote(area)}
          </span>
        </div>
      </form>
    </div>
  )
}
