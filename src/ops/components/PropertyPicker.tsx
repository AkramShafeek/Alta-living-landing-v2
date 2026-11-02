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
    className="flex h-full flex-col border-b border-neutral-200 bg-amber-50/50 lg:border-r lg:border-b-0"
  >
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3.5">
      <span className={MONO}>
        {homes.length} {homes.length === 1 ? "home" : "homes"}
      </span>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] -translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none shadow-[3px_3px_0px_#000] border-neutral-500 transition-all bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
                "flex w-full flex-col gap-1 border-b border-neutral-200 px-4 py-3.5 text-left transition-colors",
                "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black",
                isActive ? "bg-amber-100" : "hover:bg-amber-100/60"
              )}
            >
              <span className="truncate font-semibold">
                {home.name || "(unnamed home)"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {home.area || home.id}
              </span>

              <span className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase",
                    home.status === "live"
                      ? "border-neutral-500 bg-green-100 text-black"
                      : "border-neutral-500 text-black/60"
                  )}
                >
                  {home.status || "no status"}
                </span>
                <span className="font-mono text-[9px] text-black/50 tabular-nums">
                  {home.rowCount} rows
                </span>
                {home.edited && (
                  <span className="rounded-full border border-neutral-500 bg-white px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                    Draft
                  </span>
                )}
                {home.problemCount > 0 && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-red-700 tabular-nums">
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
