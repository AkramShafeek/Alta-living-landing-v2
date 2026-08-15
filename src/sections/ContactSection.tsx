import { useState } from "react"
import { PillTabs } from "@/components/PillTabs"
import { contactRows, heroContent } from "@/content/site"

const inputClasses =
  "px-3.5 py-3.5 bg-background border-2 border-black text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_#000] transition-shadow"

export const ContactSection = () => {
  const [area, setArea] = useState(heroContent.areas[0])
  const [sent, setSent] = useState(false)

  return (
    <section id="contact" className="px-8 py-19 md:py-22 bg-background">
      <div className="grid md:grid-cols-[0.85fr_1.15fr] border-2 border-black shadow-[8px_10px_0_#000] bg-white">
        <div className="p-9 md:p-11 border-b-2 md:border-b-0 md:border-r-2 border-black bg-blue-50 flex flex-col gap-5">
          <p className="cedarville-cursive-regular text-2xl text-black/70">talk to a human</p>
          <h2 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight">Contact us</h2>
          <p className="text-base text-black/70 text-balance">
            Tell us your dates and the area you want to be in. We reply the same day, and it is
            one of the four of us — never a bot.
          </p>
          <div className="flex flex-col border-t-2 border-black">
            {contactRows.map((row) => (
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

          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">Area you want</span>
            <PillTabs
              options={heroContent.areas.map((a) => ({ label: a, value: a }))}
              value={area}
              onChange={setArea}
            />
          </div>

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
            <textarea
              rows={3}
              placeholder="Two of us, both work from home — a second desk matters more than a second bedroom."
              className={`${inputClasses} resize-y`}
            />
          </label>

          <div className="flex items-center gap-4.5 flex-wrap">
            <button
              type="submit"
              className="inline-flex items-center gap-2.5 px-7 py-4.5 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[0px_0px_0_#000] active:translate-x-[5px] active:translate-y-[5px] hover:shadow-[3px_3px_0_#000] transition-all"
            >
              {sent ? "Enquiry sent ✓" : "Send enquiry"} <span className="text-lg leading-none">→</span>
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Interested in {area} · reply within one working day
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}
