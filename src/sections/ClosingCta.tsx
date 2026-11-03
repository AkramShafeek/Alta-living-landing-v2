import { Link } from "react-router-dom"
import { closingCta } from "@/content/site"

export const ClosingCta = () => {
  return (
    <section className="bg-amber-400 text-black border-y-2 border-black px-8 py-16 flex justify-between items-center gap-9 flex-wrap">
      <div>
        <h2 className="text-4xl md:text-7xl leading-[0.92] tracking-tight mb-2.5">{closingCta.title}</h2>
        <p className="font-mono text-xs uppercase tracking-[0.18em]">{closingCta.body}</p>
      </div>
      <Link
        to="/listings"
        className="inline-flex items-center gap-2.5 px-8 py-5 bg-black text-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-sm font-semibold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors"
      >
        {closingCta.ctaLabel} <span className="text-lg leading-none">→</span>
      </Link>
    </section>
  )
}
