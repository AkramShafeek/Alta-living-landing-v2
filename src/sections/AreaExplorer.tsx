import { clusters } from "@/content/site"

export const AreaExplorer = () => {
  return (
    <section id="map" className="px-8 py-19 border-b-2 border-black bg-background">
      <div className="grid md:grid-cols-[0.8fr_1.2fr] border-2 border-black shadow-[8px_10px_0_#000]">
        <div className="p-9 md:p-11 border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col gap-5 justify-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Explore by area
          </p>
          <h2 className="font-semibold text-4xl leading-none tracking-tight">
            Five clusters,<br />one commute
          </h2>
          <p className="text-base text-black/70 text-balance">
            We only take homes inside the neighbourhoods we can reach in twenty minutes. That
            is why the portfolio is small, and why a bulb gets changed the same day.
          </p>
          <div className="flex flex-col border-t-2 border-black">
            {clusters.map((c) => (
              <div
                key={c.name}
                className="flex justify-between items-center py-3 border-b border-black/20 font-mono text-xs uppercase tracking-[0.14em]"
              >
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative min-h-[380px] md:min-h-[520px] bg-cover bg-center"
          style={{ backgroundImage: "url('/map.png')" }}
        >
          <div className="absolute inset-0 bg-[#e8dcc6]/35 mix-blend-multiply" />
          {clusters.map((c) => (
            <div
              key={c.name}
              className="absolute -translate-x-1/2 -translate-y-full text-center"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-black shadow-[3px_3px_0_#000] font-mono text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap">
                {c.name} · {c.count.replace(" homes", "")}
              </span>
              <span className="block w-4 h-4 mx-auto mt-1.5 rounded-full bg-amber-400 border-2 border-black" />
            </div>
          ))}
          <p className="absolute left-4 bottom-3.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm text-background font-mono text-[10px] uppercase tracking-[0.18em]">
            47 homes · 5 clusters · bangalore
          </p>
        </div>
      </div>
    </section>
  )
}
