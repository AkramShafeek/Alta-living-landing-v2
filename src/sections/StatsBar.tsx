import { StatCell } from "@/components/StatCell"
import { numbers } from "@/content/site"

export const StatsBar = () => {
  return (
    <section className="border-b-2 border-black bg-background">
      <div className="border-t bg-black border-b border-black py-2.5 px-8 flex justify-between items-baseline gap-4 flex-wrap">
        <span className="bricolage-grotesque-500 text-sm text-white uppercase tracking-[0.2em]">
          Alta Living — By The Numbers
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Bangalore edition · est. 2021
        </span>
      </div>
      <div className="bg-[#b8a281] grid grid-cols-2 md:grid-cols-4 divide-x divide-black border-b-2 border-black">
        {numbers.map((n) => (
          <div key={n.value} className="p-6 md:p-9">
            <StatCell value={n.value} label={n.label} />
          </div>
        ))}
      </div>
    </section>
  )
}
