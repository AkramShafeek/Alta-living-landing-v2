import { useState } from "react"
import { SectionHeading } from "@/components/SectionHeading"
import { PillTabs } from "@/components/PillTabs"
import { StatCell } from "@/components/StatCell"
import { checks, founder, reasons, whoWeAreStats } from "@/content/site"

export const WhoWeAre = () => {
  const [reasonIndex, setReasonIndex] = useState(0)
  const [checkIndex, setCheckIndex] = useState(0)
  const reason = reasons[reasonIndex]

  return (
    <section className="bg-black text-background px-8 py-18 md:py-22 border-b-2 border-black">
      <SectionHeading
        tone="paper"
        eyebrow="who are we"
        title={<>A managed portfolio,<br />not a marketplace</>}
        note="Five years of hosting · one city · every home walked through by us before a guest ever sees it"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 border-2 border-background">
        {/* Founder quote */}
        <div className="md:col-span-2 md:row-span-2 p-8 border-b md:border-b-0 md:border-r border-background/40 flex flex-col justify-between gap-6">
          <p className="text-xl leading-relaxed text-balance">“{founder.quote}”</p>
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 border-2 border-background bg-background/10 flex items-center justify-center font-mono text-[10px] text-center text-background/70">
              PHO<br />TO
            </div>
            <div>
              <p className="bricolage-grotesque-500 text-lg">{founder.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">{founder.role}</p>
            </div>
          </div>
        </div>

        {/* Reason switcher */}
        <div className="md:col-span-2 p-7 border-b border-background/40 bg-amber-400 text-black flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Why we're different — pick one</p>
          <PillTabs
            tone="dark"
            options={reasons.map((r, i) => ({ label: r.label, value: String(i) }))}
            value={String(reasonIndex)}
            onChange={(v) => setReasonIndex(Number(v))}
          />
          <p className="bricolage-grotesque-500 text-2xl leading-tight">{reason.title}</p>
          <p className="text-sm leading-relaxed">{reason.body}</p>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em]">{reason.figure}</p>
        </div>

        {whoWeAreStats.slice(0, 2).map((s, i) => (
          <div
            key={s.label}
            className={`p-7 border-b border-background/40 flex flex-col justify-between gap-3.5 transition-colors hover:bg-background/[0.07] ${i === 0 ? "border-r" : ""}`}
          >
            <StatCell tone="paper" value={s.value} label={s.label} />
          </div>
        ))}

        {/* Check rotator */}
        <div className="md:col-span-2 p-7 border-r border-background/40 flex flex-col gap-4">
          <div className="flex justify-between items-baseline gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
              What we check before a home goes live
            </p>
            <span className="font-mono text-xs font-bold text-amber-400">
              {checkIndex + 1} / {checks.length}
            </span>
          </div>
          <p className="bricolage-grotesque-500 text-2xl leading-tight">{checks[checkIndex]}</p>
          <button
            type="button"
            onClick={() => setCheckIndex((i) => (i + 1) % checks.length)}
            className="self-start px-5 py-3.5 bg-background text-black shadow-[4px_4px_0_rgba(247,243,234,.35)] font-mono text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-amber-400 transition-colors"
          >
            Next check →
          </button>
        </div>

        {whoWeAreStats.slice(2, 4).map((s, i) => (
          <div
            key={s.label}
            className={`p-7 flex flex-col justify-between gap-3.5 transition-colors hover:bg-background/[0.07] ${i === 0 ? "border-r border-background/40" : ""}`}
          >
            <StatCell tone="paper" value={s.value} label={s.label} />
          </div>
        ))}
      </div>
    </section>
  )
}
