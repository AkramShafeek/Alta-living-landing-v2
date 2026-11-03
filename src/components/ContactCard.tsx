import { useState } from "react"
import { cn } from "@/lib/utils"
import { contactMessage, whatsappTextLink } from "@/lib/whatsapp"
import {
  contactRows as defaultContactRows,
  contactSection,
  enquiryWhatsApp,
  heroContent,
} from "@/content/site"

const inputClasses =
  "px-3.5 py-3.5 rounded-lg bg-background border border-neutral-400 focus:outline focus:outline-black text-sm focus:bg-white focus:shadow-[4px_4px_0_#000] transition-shadow"

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
  /** Line under the submit button. Receives the selected area, if any. */
  footnote?: (area: string) => string
  /** Extra field rendered above "Anything else", e.g. a locked property name. */
  subject?: { label: string; value: string }
  messagePlaceholder?: string
  className?: string
}

/** A row of single-choice chips. Each chip stands alone, so the row wraps
 *  cleanly on a phone instead of breaking one rounded outline in two. */
const Chips = ({
  options,
  value,
  onChange,
  label,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
  label: string
}) => (
  <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
    {options.map((option) => {
      const active = option === value
      return (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={active}
          // Clicking the chosen chip again clears it: none of these is required.
          onClick={() => onChange(active ? "" : option)}
          className={cn(
            "rounded-full border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
            active ? "border-black bg-black text-white" : "border-neutral-400 bg-white text-black hover:bg-black/5"
          )}
        >
          {option}
        </button>
      )
    })}
  </div>
)

/**
 * The enquiry card, shared by the home page's contact section and the
 * property page. Every prop falls back to the home page's content, so
 * `<ContactCard />` renders the landing page's form.
 *
 * Submitting does not post anywhere. It opens WhatsApp to the business line
 * with the enquiry already written — the same route the cart takes — so the
 * conversation starts in the visitor's own thread and reaches a person.
 */
export const ContactCard = ({
  // Unused while the left column below stays commented out — kept as `_`-
  // prefixed rather than dropped, since the props (and their defaults) are
  // still part of the public signature and the block reads them again the
  // moment it comes back.
  eyebrow: _eyebrow = contactSection.eyebrow,
  title: _title = contactSection.title,
  body: _body = contactSection.footnote,
  rows: _rows = defaultContactRows,
  areas = heroContent.areas,
  defaultArea,
  submitLabel = contactSection.submitLabel,
  sentLabel = "Opened in WhatsApp ✓",
  footnote = () => contactSection.footnote,
  subject,
  messagePlaceholder = contactSection.messagePlaceholder,
  className,
}: ContactCardProps) => {
  // Nothing pre-selected: an area the visitor did not pick must not reach us
  // as if they had.
  const [area, setArea] = useState(defaultArea ?? "")
  const [stay, setStay] = useState("")
  const [who, setWho] = useState("")
  const [fields, setFields] = useState({ name: "", phone: "", email: "", moveIn: "", message: "" })
  const [sent, setSent] = useState(false)

  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((current) => ({ ...current, [key]: event.target.value }))
      setSent(false)
    },
  })

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl justify-center rounded-4xl border-2 border-black bg-white shadow-[8px_10px_0_#000]",
        className
      )}
    >
      <form
        className="flex w-full flex-col gap-5 p-7 sm:p-9 md:p-11"
        onSubmit={(event) => {
          event.preventDefault()
          const text = contactMessage({
            ...fields,
            // The date input gives "2026-12-01"; the message reads "1 Dec 2026".
            moveIn: fields.moveIn
              ? new Date(`${fields.moveIn}T00:00`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "",
            subject: subject?.value,
            area: areas.length > 0 ? area : "",
            stay,
            who,
          })
          // Opened from the submit click itself, so it is not a pop-up a
          // browser would block.
          window.open(whatsappTextLink(enquiryWhatsApp, text), "_blank", "noopener")
          setSent(true)
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-normal">
            Your name
            <input type="text" required autoComplete="name" placeholder="Priya Menon" className={inputClasses} {...field("name")} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-normal">
            Phone (WhatsApp)
            <input type="tel" required autoComplete="tel" inputMode="tel" placeholder="98450 12345" className={inputClasses} {...field("phone")} />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-normal">
          Email
          <input type="email" autoComplete="email" placeholder="priya@work.in" className={inputClasses} {...field("email")} />
        </label>

        {subject && (
          <label className="flex flex-col gap-2 text-sm font-normal">
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
            <span className="text-sm font-normal">Area</span>
            <Chips label="Area" options={areas} value={area} onChange={setArea} />
          </div>
        )}

        <label className="flex flex-col gap-2 text-sm font-normal">
          Move-in date
          <input type="date" className={inputClasses} {...field("moveIn")} />
        </label>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-normal">How long</span>
          <Chips label="How long" options={contactSection.stayLengths} value={stay} onChange={setStay} />
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-normal">Who's moving in</span>
          <Chips label="Who's moving in" options={contactSection.whoOptions} value={who} onChange={setWho} />
        </div>

        <label className="flex flex-col gap-2 text-sm font-normal">
          Anything else
          <textarea rows={3} placeholder={messagePlaceholder} className={`${inputClasses} resize-y`} {...field("message")} />
        </label>

        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-black bg-amber-400 px-7 py-4.5 font-mono text-[13px] font-semibold uppercase tracking-[0.14em] shadow-[4px_4px_0_#000] transition-all active:translate-x-1.25 active:translate-y-1.25 active:shadow-[0px_0px_0_#000] sm:w-1/2"
          >
            {sent ? sentLabel : submitLabel} <span className="text-lg leading-none">→</span>
          </button>
          <span className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {footnote(area)}
          </span>
        </div>
      </form>
    </div>
  )
}
