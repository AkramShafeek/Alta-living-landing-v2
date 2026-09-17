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

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangleIcon,
  DownloadIcon,
  RotateCwIcon,
  Trash2Icon,
  UsersIcon,
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
  "inline-flex items-center gap-2 border-2 border-black px-3.5 py-2.5 font-mono " +
  "text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"

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
      <header className="border-b-2 border-black bg-white">
        <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-4">
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
              <span className="inline-flex items-center gap-2 border-2 border-red-700 bg-red-50 px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-red-700 uppercase">
                <AlertTriangleIcon size={13} aria-hidden />
                {totalProblems} {totalProblems === 1 ? "field" : "fields"} the
                site would reject
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setShowHosts(!showHosts)
                setSelected(null)
              }}
              className={cn(
                BUTTON,
                showHosts
                  ? "bg-amber-400"
                  : "bg-white hover:bg-black hover:text-white"
              )}
            >
              <UsersIcon size={13} aria-hidden /> Hosts
            </button>

            <button
              type="button"
              onClick={() => void state.load({ force: true })}
              disabled={status === "loading"}
              className={cn(
                BUTTON,
                "bg-white hover:bg-black hover:text-white disabled:opacity-50"
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
                "bg-white hover:bg-red-700 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
              )}
            >
              <Trash2Icon size={13} aria-hidden /> Discard draft
            </button>

            <button
              type="button"
              onClick={exportEverything}
              className={cn(BUTTON, "bg-white hover:bg-black hover:text-white")}
            >
              <DownloadIcon size={13} aria-hidden /> Export all
            </button>
          </div>
        </div>

        {exported && (
          <div className="border-t-2 border-black bg-blue-50 px-6 py-3">
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
          <p className="border-t-2 border-black bg-red-50 px-6 py-3 font-mono text-[11px] text-red-700">
            {error}
          </p>
        )}
      </header>

      <div className="grid flex-1 items-stretch lg:grid-cols-[17rem_1fr]">
        <PropertyPicker
          homes={homes}
          active={selected}
          onSelect={(id) => {
            setSelected(id)
            setShowHosts(false)
          }}
          onAdd={addHome}
        />

        <main className="min-w-0 bg-background">
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
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-black bg-white px-5 py-4 shadow-[6px_6px_0_#000]">
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
                      "bg-white hover:bg-red-700 hover:text-white"
                    )}
                  >
                    <Trash2Icon size={13} aria-hidden /> Delete home
                  </button>
                  <button
                    type="button"
                    onClick={exportHome}
                    className={cn(
                      BUTTON,
                      "bg-amber-400 shadow-[4px_4px_0_#000] hover:bg-black hover:text-amber-300"
                    )}
                  >
                    <DownloadIcon size={13} aria-hidden /> Export this home
                  </button>
                </div>
              </div>

              <section className="border-2 border-black bg-white">
                <header className="border-b-2 border-black px-5 py-4">
                  <h3 className="bricolage-grotesque-500 text-lg leading-tight tracking-tight">
                    The home
                    {propertyEdits.has(home.index) && (
                      <span className="ml-2.5 border-2 border-black bg-amber-400 px-2 py-0.5 align-middle font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                        Draft
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-black/60">
                    Everything on the properties tab. Rates live on the units
                    below, not here.
                  </p>
                </header>

                <div className="px-5 py-5">
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

      <footer className="border-t-2 border-black bg-white px-6 py-3">
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
    <div className="flex flex-col gap-6 p-6">
      <div className="border-2 border-black bg-white px-5 py-4">
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
          className="border-2 border-black bg-white"
        >
          <header className="flex items-center gap-3 border-b-2 border-black px-5 py-4">
            <h3 className="bricolage-grotesque-500 text-lg leading-tight tracking-tight">
              {row.name || row.id || `Host ${index + 1}`}
            </h3>
            {edited.has(index) && (
              <span className="border-2 border-black bg-amber-400 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                Draft
              </span>
            )}
          </header>
          <div className="px-5 py-5">
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
          "self-start bg-amber-400 hover:bg-black hover:text-amber-300"
        )}
      >
        Add host
      </button>
    </div>
  )
}

export default OpsEditor
