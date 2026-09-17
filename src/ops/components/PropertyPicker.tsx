// ─────────────────────────────────────────────────────────────────────────
// Which home.
//
// The first screen, and the one the old table-wise editor did not have. Each
// entry carries what decides whether it needs attention: whether it is live,
// whether it has unexported changes, and whether anything about it would be
// rejected by the site.
// ─────────────────────────────────────────────────────────────────────────

import { PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type HomeEntry = {
  id: string
  name: string
  area: string
  status: string
  rowCount: number
  edited: boolean
  problemCount: number
}

const MONO = "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"

export const PropertyPicker = ({
  homes,
  active,
  onSelect,
  onAdd,
}: {
  homes: HomeEntry[]
  active: string | null
  onSelect: (id: string) => void
  onAdd: () => void
}) => (
  <nav
    aria-label="Homes"
    className="flex flex-col border-b-2 border-black bg-amber-50 lg:border-r-2 lg:border-b-0"
  >
    <div className="flex items-center justify-between gap-3 border-b-2 border-black px-4 py-3">
      <span className={MONO}>
        {homes.length} {homes.length === 1 ? "home" : "homes"}
      </span>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 border-2 border-black bg-amber-400 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-black hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <PlusIcon size={13} aria-hidden /> New
      </button>
    </div>

    <ul className="flex-1 overflow-y-auto">
      {homes.length === 0 && (
        <li className="px-4 py-6 font-mono text-[11px] leading-relaxed text-black/60">
          No homes in the sheet yet.
        </li>
      )}

      {homes.map((home) => {
        const isActive = home.id === active

        return (
          <li key={home.id}>
            <button
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(home.id)}
              className={cn(
                "flex w-full flex-col gap-1.5 border-b-2 border-black/15 px-4 py-3 text-left transition-colors",
                "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black",
                isActive
                  ? "bg-amber-400 shadow-[inset_6px_0_0_#000]"
                  : "hover:bg-amber-200"
              )}
            >
              <span className="truncate font-mono text-[12px] font-semibold">
                {home.name || "(unnamed home)"}
              </span>
              <span className="truncate font-mono text-[10px] tracking-[0.12em] text-black/60 uppercase">
                {home.area || home.id}
              </span>

              <span className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase",
                    home.status === "live"
                      ? "border-black/40 bg-green-100 text-black"
                      : "border-black/30 text-black/60"
                  )}
                >
                  {home.status || "no status"}
                </span>
                <span className="font-mono text-[9px] text-black/50 tabular-nums">
                  {home.rowCount} rows
                </span>
                {home.edited && (
                  <span className="border-2 border-black bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                    Draft
                  </span>
                )}
                {home.problemCount > 0 && (
                  <span className="border-2 border-red-700 bg-red-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-red-700 tabular-nums">
                    {home.problemCount}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  </nav>
)
