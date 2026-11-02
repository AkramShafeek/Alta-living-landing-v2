// ─────────────────────────────────────────────────────────────────────────
// The ops editor.
//
// Organised around a home, not around a tab. That is the entire point: the
// spreadsheet already shows tabs, and doing tab-wise edits here would only add
// a layer. What the spreadsheet cannot do is show one home whole — its row, its
// units, its photos, its amenities, its reviews — and let someone change all of
// it in one place with the site's own validation watching.
//
// It cannot write to the sheet; the published CSV is read-only. The last step
// is deliberately a human pasting, and the export exists to make that paste as
// small and as safe as possible.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangleIcon,
  DownloadIcon,
  RotateCwIcon,
  Trash2Icon,  
} from "lucide-react"
import { cn } from "@/lib/utils"
import { blankRow, problemCountOf } from "@/ops/fields"
import {
  buildExport,
  buildPropertyExport,
  downloadExport,
  type ExportResult,
} from "@/ops/export"
import {
  allRows,
  draftedPropertyIds,
  editedRows,
  rowsOf,
  useDraftStore,
} from "@/ops/draftStore"
import {
  CHILD_TABLES,
  everyRowOf,
  newChildRow,
  newPropertyRow,
  areaOf,
  propertyRow,
  scopedRows,
  type ChildTable,
} from "@/ops/propertyScope"
import { SECTIONS } from "@/ops/sections"
import { PropertyPicker, type HomeEntry } from "@/ops/components/PropertyPicker"
import { ChildSection } from "@/ops/components/ChildSection"
import { RowFields } from "@/ops/components/RowFields"

const MONO = "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3.5 py-2.5 font-mono " +
  "text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"

// The sidebar's own width lives here, not in PropertyPicker — this component
// owns the two-pane layout and the drag handle between them, so it is the one
// place that needs to know how wide either pane currently is.
const SIDEBAR_MIN = 220
const SIDEBAR_MAX = 440
const SIDEBAR_DEFAULT = 272

const when = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—"

const OpsEditor = () => {
  const state = useDraftStore()
  const { status, error, loadedAt, savedAt } = state

  const [selected, setSelected] = useState<string | null>(null)
  const [showHosts, setShowHosts] = useState(false)
  const [exported, setExported] = useState<ExportResult | null>(null)

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT)
  const layoutRef = useRef<HTMLDivElement>(null)
  const resizing = useRef(false)

  // A plain mousemove/mouseup pair on `window` rather than React drag events:
  // the pointer regularly leaves the handle itself mid-drag, and only a
  // window-level listener keeps tracking it once that happens.
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!resizing.current || !layoutRef.current) return
      const left = layoutRef.current.getBoundingClientRect().left
      setSidebarWidth(
        Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, event.clientX - left))
      )
    }
    const onUp = () => {
      resizing.current = false
      document.body.style.removeProperty("cursor")
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  const startResize = () => {
    resizing.current = true
    document.body.style.cursor = "col-resize"
  }

  useEffect(() => {
    void state.load()
    // Once, on mount. This component subscribes to the whole store, so a
    // dependency on `state` would refetch on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const properties = rowsOf(state, "properties")
  const drafted = useMemo(() => draftedPropertyIds(state), [state])

  /** Rows of every table belonging to one home, for its problem count. */
  const problemsFor = useMemo(
    () => (id: string) => {
      const own = propertyRow(state, id)
      let count = own ? problemCountOf("properties", own.row) : 0

      for (const table of CHILD_TABLES) {
        for (const entry of scopedRows(state, table, id)) {
          count += problemCountOf(table, entry.row)
        }
      }
      return count
    },
    [state]
  )

  const homes: HomeEntry[] = useMemo(
    () =>
      properties.map((row) => ({
        id: row.id ?? "",
        name: row.name ?? "",
        area: areaOf(row),
        status: row.status ?? "",
        rowCount: everyRowOf(state, row.id ?? "").length,
        edited: drafted.has(row.id ?? ""),
        problemCount: problemsFor(row.id ?? ""),
      })),
    [properties, state, drafted, problemsFor]
  )

  const home = selected ? propertyRow(state, selected) : null
  const homeEntry = homes.find((entry) => entry.id === selected) ?? null

  const propertyEdits = useMemo(() => editedRows(state, "properties"), [state])
  const totalProblems = homes.reduce(
    (sum, entry) => sum + entry.problemCount,
    0
  )
  const anyDraft = drafted.size > 0

  // ── actions ───────────────────────────────────────────────────────────

  const addHome = () => {
    const row = newPropertyRow(properties)
    state.addRow("properties", row)
    setSelected(row.id ?? null)
    setShowHosts(false)
  }

  const deleteHome = () => {
    if (!home || !selected || !homeEntry) return

    const count = everyRowOf(state, selected).length
    if (
      !window.confirm(
        `Remove "${homeEntry.name || selected}" and all ${count} of its rows across every tab?\n\n` +
          "This only changes your draft. The sheet is untouched until you export and paste."
      )
    ) {
      return
    }

    // Descending, so each removal cannot shift the index of the next.
    for (const target of everyRowOf(state, selected)) {
      state.removeRow(target.table, target.index)
    }
    setSelected(null)
  }

  const addChild = (table: ChildTable) => {
    if (!selected) return

    const spec = SECTIONS.find((candidate) => candidate.table === table)
    const row = newChildRow(table, selected)

    if (spec?.makeId) row.id = spec.makeId(rowsOf(state, table), selected)
    state.addRow(table, row)
  }

  const toggleChild = (
    table: ChildTable,
    column: string,
    key: string,
    on: boolean
  ) => {
    if (!selected) return

    if (on) {
      state.addRow(table, { ...newChildRow(table, selected), [column]: key })
      return
    }

    const match = scopedRows(state, table, selected).find(
      (entry) => entry.row[column] === key
    )
    if (match) state.removeRow(table, match.index)
  }

  const exportHome = () => {
    if (!selected || !homeEntry) return

    const result = buildPropertyExport(allRows(state), {
      id: selected,
      name: homeEntry.name || selected,
    })
    downloadExport(result)
    setExported(result)
  }

  const exportEverything = () => {
    const result = buildExport(allRows(state))
    downloadExport(result)
    setExported(result)
  }

  const discard = () => {
    if (
      !window.confirm(
        "Discard every unexported change and go back to what the sheet says?"
      )
    ) {
      return
    }
    state.discardAll()
    setSelected(null)
  }

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-neutral-500 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div>
            <h1 className="bricolage-grotesque-500 text-2xl leading-none tracking-tight">
              Catalog editor
            </h1>
            <p className={cn(MONO, "mt-1.5 text-black/60")}>
              Sheet read {when(loadedAt)} · draft saved {when(savedAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {totalProblems > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-red-700 uppercase">
                <AlertTriangleIcon size={13} aria-hidden />
                {totalProblems} {totalProblems === 1 ? "field" : "fields"} the
                site would reject
              </span>
            )}

            {/* <button
              type="button"
              onClick={() => {
                setShowHosts(!showHosts)
                setSelected(null)
              }}
              className={cn(
                BUTTON,
                showHosts
                  ? "border-amber-400 bg-amber-400"
                  : "bg-white hover:bg-neutral-50"
              )}
            >
              <UsersIcon size={13} aria-hidden /> Hosts
            </button> */}

            <button
              type="button"
              onClick={() => void state.load({ force: true })}
              disabled={status === "loading"}
              className={cn(
                BUTTON,
                "-translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[3px_3px_0px_#000] active:shadow-none rounded-full transition-all border-neutral-500 bg-white hover:bg-neutral-50 disabled:opacity-50"
              )}
            >
              <RotateCwIcon size={13} aria-hidden />
              {status === "loading" ? "Reading…" : "Re-read sheet"}
            </button>

            <button
              type="button"
              onClick={discard}
              disabled={!anyDraft}
              className={cn(
                BUTTON,
                "-translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[3px_3px_0px_#000] active:shadow-none rounded-full transition-all border-neutral-500 bg-white  hover:bg-red-50 hover:text-red-700 disabled:opacity-40  disabled:hover:bg-white disabled:active:-translate-x-0.5 disabled:active:-translate-y-0.5 disabled:active:shadow-[3px_3px_0px_#000] disabled:hover:text-black"
              )}
            >
              <Trash2Icon size={13} aria-hidden /> Discard draft
            </button>

            <button
              type="button"
              onClick={exportEverything}
              className={cn(BUTTON, "-translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[3px_3px_0px_#000] active:shadow-none rounded-full transition-all border-neutral-500 bg-white hover:bg-neutral-50")}
            >
              <DownloadIcon size={13} aria-hidden /> Export all
            </button>
          </div>
        </div>

        {exported && (
          <div className="border-t border-neutral-500 bg-blue-50 px-6 py-4">
            <p className="font-mono text-[11px] leading-relaxed">
              Downloaded <strong>{exported.filename}</strong>.{" "}
              {exported.scope
                ? "It holds two copies of every tab — full-tabs/ to replace a tab outright, this-home/ to replace only this home's rows. README.txt explains which to use."
                : "Every tab, complete. Replace each tab's contents with the matching file."}
              {exported.warnings.length > 0 && (
                <span className="text-red-700">
                  {" "}
                  {exported.warnings.length} cell
                  {exported.warnings.length === 1 ? " held" : "s held"} a tab or
                  line break and
                  {exported.warnings.length === 1 ? " was" : " were"} flattened
                  — README.txt lists them.
                </span>
              )}
            </p>
          </div>
        )}

        {status === "error" && (
          <p className="border-t border-neutral-500 bg-red-50 px-6 py-4 font-mono text-[11px] text-red-700">
            {error}
          </p>
        )}
      </header>

      <div ref={layoutRef} className="flex flex-1 flex-col items-stretch lg:flex-row">
        <div
          className="lg:w-[var(--sidebar-width)] lg:shrink-0"
          style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
        >
          <PropertyPicker
            homes={homes}
            active={selected}
            onSelect={(id) => {
              setSelected(id)
              setShowHosts(false)
            }}
            onAdd={addHome}
          />
        </div>

        {/* The drag handle. Desktop only — a stacked mobile layout has nothing
            to its side worth resizing. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the home list"
          onMouseDown={startResize}
          className="hidden w-1 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-neutral-500 active:bg-neutral-300 lg:block"
        />

        <main className="min-w-0 flex-1 bg-background">
          {showHosts ? (
            <HostsPanel />
          ) : !home || !selected ? (
            <div className="flex h-full min-h-80 items-center justify-center p-10 text-center">
              <p className={cn(MONO, "max-w-90 leading-loose text-black/60")}>
                {homes.length === 0
                  ? "Nothing in the sheet yet — add a home to start."
                  : "Pick a home to edit everything about it, or add a new one."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-7 p-7">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-500 bg-blue-100 px-6 py-5 shadow-[4px_4px_0px_#000]">
                <div>
                  <h2 className="bricolage-grotesque-500 text-xl leading-tight tracking-tight">
                    {homeEntry?.name || "(unnamed home)"}
                  </h2>
                  <p className={cn(MONO, "mt-1 text-black/60")}>
                    {selected} · {homeEntry?.rowCount} rows across{" "}
                    {CHILD_TABLES.length + 1} tabs
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={deleteHome}
                    className={cn(
                      BUTTON,
                      "bg-white rounded-full border-neutral-500 -translate-y-0.5 -translate-x-0.5 active:translate-x-0 active:translate-y-0 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 shadow-[3px_3px_0px_#000] active:shadow-none"
                    )}
                  >
                    <Trash2Icon size={13} aria-hidden /> Delete home
                  </button>
                  <button
                    type="button"
                    onClick={exportHome}
                    className={cn(
                      BUTTON,
                      "bg-amber-400 rounded-full shadow-[3px_3px_0px_#000] border-neutral-500 -translate-y-0.5 -translate-x-0.5 active:translate-x-0 active:translate-y-0 transition-all active:shadow-none"
                    )}
                  >
                    <DownloadIcon size={13} aria-hidden /> Export this home
                  </button>
                </div>
              </div>

              <section className="overflow-hidden rounded-2xl border border-neutral-500 shadow-[4px_4px_0px_#000] bg-white">
                <header className="border-b border-neutral-500 px-6 py-5">
                  <h3 className="bricolage-grotesque-500 text-lg leading-tight tracking-tight">
                    The home
                    {propertyEdits.has(home.index) && (
                      <span className="ml-2.5 rounded-full border border-black/10 bg-amber-400 px-2 py-0.5 align-middle font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                        Draft
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-black/60">
                    Everything on the properties tab. Rates live on the units
                    below, not here.
                  </p>
                </header>

                <div className="px-6 py-6">
                  <RowFields
                    table="properties"
                    row={home.row}
                    onChange={(column, value) =>
                      state.setCell("properties", home.index, column, value)
                    }
                  />
                </div>
              </section>

              {SECTIONS.map((spec) => (
                <ChildSection
                  key={spec.table}
                  spec={spec}
                  rows={scopedRows(state, spec.table, selected)}
                  editedIndices={editedRows(state, spec.table)}
                  onChange={(index, column, value) =>
                    state.setCell(spec.table, index, column, value)
                  }
                  onAdd={() => addChild(spec.table)}
                  onRemove={(index) => state.removeRow(spec.table, index)}
                  onToggle={
                    spec.toggle
                      ? (key, on) =>
                          toggleChild(spec.table, spec.toggle!, key, on)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-neutral-500 bg-white px-6 py-4">
        <p className={cn(MONO, "leading-loose text-black/60")}>
          Nothing here writes to the sheet. Edits live in this browser until you
          export and paste them.
        </p>
      </footer>
    </div>
  )
}

/**
 * Hosts, edited on their own.
 *
 * Not part of a home: one host covers the whole portfolio today, and a home
 * points at one by `hostId`. Kept reachable because nothing else can edit it.
 */
const HostsPanel = () => {
  const state = useDraftStore()
  const hosts = rowsOf(state, "hosts")
  const edited = editedRows(state, "hosts")

  return (
    <div className="flex flex-col gap-7 p-7">
      <div className="rounded-2xl border border-neutral-500 bg-white px-6 py-5">
        <h2 className="bricolage-grotesque-500 text-xl leading-tight tracking-tight">
          Hosts
        </h2>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-black/60">
          Shared across homes — a home points at one by hostId. This tab is
          never published to the web, because it holds phone numbers.
        </p>
      </div>

      {hosts.map((row, index) => (
        <section
          key={row.id ?? index}
          className="overflow-hidden rounded-2xl border border-neutral-500 bg-white"
        >
          <header className="flex items-center gap-3 border-b border-neutral-500 px-6 py-5">
            <h3 className="bricolage-grotesque-500 text-lg leading-tight tracking-tight">
              {row.name || row.id || `Host ${index + 1}`}
            </h3>
            {edited.has(index) && (
              <span className="rounded-full border border-black/10 bg-amber-400 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                Draft
              </span>
            )}
          </header>
          <div className="px-6 py-6">
            <RowFields
              table="hosts"
              row={row}
              columns={2}
              onChange={(column, value) =>
                state.setCell("hosts", index, column, value)
              }
            />
          </div>
        </section>
      ))}

      <button
        type="button"
        onClick={() => state.addRow("hosts", blankRow("hosts"))}
        className={cn(
          BUTTON,
          "self-start border-amber-400 bg-amber-400 hover:border-black hover:bg-black hover:text-amber-300"
        )}
      >
        Add host
      </button>
    </div>
  )
}

export default OpsEditor
