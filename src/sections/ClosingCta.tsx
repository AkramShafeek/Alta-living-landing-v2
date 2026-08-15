export const ClosingCta = () => {
  return (
    <section className="bg-amber-400 text-black border-y-2 border-black px-8 py-16 flex justify-between items-center gap-9 flex-wrap">
      <div>
        <h2 className="text-4xl md:text-7xl leading-[0.92] tracking-tight mb-2.5">
          House hunt ends today
        </h2>
        <p className="font-mono text-xs uppercase tracking-[0.18em]">
          Tell us your dates and your area — we reply the same day
        </p>
      </div>
      <a
        href="#showcase"
        className="inline-flex items-center gap-2.5 px-8 py-5 bg-black text-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-sm font-semibold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors"
      >
        Browse properties <span className="text-lg leading-none">→</span>
      </a>
    </section>
  )
}
