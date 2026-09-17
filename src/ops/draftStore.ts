// ─────────────────────────────────────────────────────────────────────────
// The ops draft.
//
// Deliberately a separate store from `catalogStore`, and not only for tidiness.
// They hold different things for different readers: the catalog holds joined,
// validated, read-only `PropertyDetail` objects for the site, and this holds
// flat, unvalidated, editable sheet rows for one person with the link. Sharing
// a store would mean a half-typed row could reach a visitor's screen, and the
// catalog's "replace wholesale, the sheet is the source of truth" rule is the
// exact opposite of what a draft needs.
//
// Everything here is the sheet's own currency: strings. No dates, no numbers,
// no arrays. That is what localStorage can round-trip without a reviver, what
// the export writes, and what ops sees in the cells they are copying from — so
// a value cannot be quietly reformatted by passing through the editor.
//
// Two layers, and the difference matters:
//   · baseline — what the sheet said when we last read it
//   · draft    — what ops has changed since, per table
// A table with no draft entry is untouched. That is how "edited" is computed
// rather than tracked, so a change and its indicator cannot disagree.
// ─────────────────────────────────────────────────────────────────────────

import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import db from "@/db/db"
import { tables, sourceFor, type TableName } from "@/db/config"
import type { Row } from "@/db/types"

const TABLE_NAMES = Object.keys(tables) as TableName[]

const STORAGE_KEY = "alta.ops.draft.v1"

export type LoadStatus = "idle" | "loading" | "ready" | "error"

type Persisted = {
  version: 1
  savedAt: string
  /** Only tables ops has touched. Absent means "as the sheet has it". */
  edits: Partial<Record<TableName, Row[]>>
}

type DraftState = {
  baseline: Partial<Record<TableName, Row[]>>
  edits: Partial<Record<TableName, Row[]>>

  status: LoadStatus
  error: string | null
  /** When the sheet was last read, for the "showing data from" line. */
  loadedAt: string | null
  savedAt: string | null

  load: (opts?: { force?: boolean }) => Promise<void>
  setCell: (
    table: TableName,
    index: number,
    column: string,
    value: string
  ) => void
  addRow: (table: TableName, row: Row) => void
  removeRow: (table: TableName, index: number) => void
  revertTable: (table: TableName) => void
  discardAll: () => void
}

// ── persistence ─────────────────────────────────────────────────────────
// Wrapped because localStorage throws in a private window and can be full;
// losing a draft is bad, but a thrown error on every keystroke is worse.

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Persisted
    if (parsed.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

function writePersisted(
  edits: Partial<Record<TableName, Row[]>>
): string | null {
  const savedAt = new Date().toISOString()
  try {
    const payload: Persisted = { version: 1, savedAt, edits }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return savedAt
  } catch (error) {
    console.error("[ops] could not save the draft", error)
    return null
  }
}

function clearPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — the draft simply outlives the tab.
  }
}

// ── the store ───────────────────────────────────────────────────────────

/**
 * The rows a mutation starts from — the existing draft, or a copy of the sheet.
 *
 * Read off `get()` rather than off the immer draft on purpose. Inside a
 * producer, `state.baseline[table]` is a Proxy, and `structuredClone` of a
 * Proxy is not something to rely on. `get()` returns the plain, already-frozen
 * state, which clones cleanly.
 *
 * The copy is what makes "edited" meaningful: the baseline must stay exactly as
 * the sheet handed it over, or there is nothing to compare a draft against.
 */
function startingRows(
  state: {
    edits: Partial<Record<TableName, Row[]>>
    baseline: Partial<Record<TableName, Row[]>>
  },
  table: TableName
): Row[] {
  return structuredClone(state.edits[table] ?? state.baseline[table] ?? [])
}

const restored = readPersisted()

export const useDraftStore = create<DraftState>()(
  immer((set, get) => ({
    baseline: {},
    edits: restored?.edits ?? {},
    status: "idle",
    error: null,
    loadedAt: null,
    savedAt: restored?.savedAt ?? null,

    load: async (opts = {}) => {
      if (!opts.force && get().status === "loading") return

      set((state) => {
        state.status = "loading"
        state.error = null
      })

      // A forced reload is the only way to see a change someone made in the
      // sheet after this tab was opened — the db caches per process.
      if (opts.force) db.invalidate()

      try {
        const loaded = await Promise.all(
          TABLE_NAMES.map(
            async (table) => [table, await db.getRawTable(table)] as const
          )
        )

        set((state) => {
          state.baseline = Object.fromEntries(loaded) as Partial<
            Record<TableName, Row[]>
          >
          state.status = "ready"
          state.loadedAt = new Date().toISOString()
        })
      } catch (error) {
        set((state) => {
          state.status = "error"
          state.error =
            error instanceof Error ? error.message : "Could not read the sheet"
        })
        console.error("[ops] load failed", error)
      }
    },

    setCell: (table, index, column, value) => {
      set((state) => {
        const rows = startingRows(get(), table)
        if (!rows[index]) return

        rows[index][column] = value
        state.edits[table] = rows
        state.savedAt = writePersisted({ ...get().edits, [table]: rows })
      })
    },

    addRow: (table, row) => {
      set((state) => {
        const rows = startingRows(get(), table)
        rows.push(row)
        state.edits[table] = rows
        state.savedAt = writePersisted({ ...get().edits, [table]: rows })
      })
    },

    removeRow: (table, index) => {
      set((state) => {
        const rows = startingRows(get(), table)
        rows.splice(index, 1)
        state.edits[table] = rows
        state.savedAt = writePersisted({ ...get().edits, [table]: rows })
      })
    },

    revertTable: (table) => {
      // Spread from `get()` and drop the key there too: reading the count off
      // the draft would persist the table we are in the middle of removing.
      const next = { ...get().edits }
      delete next[table]

      set((state) => {
        delete state.edits[table]
        state.savedAt = writePersisted(next)
      })
    },

    discardAll: () => {
      clearPersisted()
      set((state) => {
        state.edits = {}
        state.savedAt = null
      })
    },
  }))
)

// ── derived reads ───────────────────────────────────────────────────────
// Computed from baseline vs edits rather than stored, so an indicator cannot
// drift away from the change it is reporting.
//
// Typed against the two fields they actually read rather than the whole store,
// so they are plain functions over data and can be tested without React,
// zustand or a browser.

export type DraftSlice = {
  baseline: Partial<Record<TableName, Row[]>>
  edits: Partial<Record<TableName, Row[]>>
}

/** What the editor and the export should both use: the draft where there is one. */
export function rowsOf(state: DraftSlice, table: TableName): Row[] {
  return state.edits[table] ?? state.baseline[table] ?? []
}

/** Every table, drafted where drafted. What `buildExport` is handed. */
export function allRows(state: DraftSlice): Record<TableName, Row[]> {
  return Object.fromEntries(
    TABLE_NAMES.map((table) => [table, rowsOf(state, table)])
  ) as Record<TableName, Row[]>
}

const sameRow = (a: Row | undefined, b: Row | undefined): boolean => {
  if (!a || !b) return a === b

  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if ((a[key] ?? "") !== (b[key] ?? "")) return false
  }
  return true
}

/** True when this table differs from what the sheet said. */
export function isTableEdited(state: DraftSlice, table: TableName): boolean {
  const draft = state.edits[table]
  if (!draft) return false

  const base = state.baseline[table] ?? []
  if (draft.length !== base.length) return true

  return draft.some((row, index) => !sameRow(row, base[index]))
}

/** Row indices in this table that differ from the sheet, plus any added rows. */
export function editedRows(state: DraftSlice, table: TableName): Set<number> {
  const draft = state.edits[table]
  if (!draft) return new Set()

  const base = state.baseline[table] ?? []
  const changed = new Set<number>()

  draft.forEach((row, index) => {
    if (!sameRow(row, base[index])) changed.add(index)
  })

  return changed
}

/**
 * Property ids with an unexported change anywhere in the catalog.
 *
 * Scoped by `propertyId` across every child table, not just `properties`, so a
 * home shows as drafted when its rate changed even though nothing on the
 * property row itself moved — which is the common case and the one most likely
 * to be forgotten before an export.
 */
export function draftedPropertyIds(state: DraftSlice): Set<string> {
  const ids = new Set<string>()

  for (const table of TABLE_NAMES) {
    const changed = editedRows(state, table)
    if (changed.size === 0) continue

    const rows = rowsOf(state, table)
    const base = state.baseline[table] ?? []

    for (const index of changed) {
      const id =
        table === "properties" ? rows[index]?.id : rows[index]?.propertyId
      if (id) ids.add(id)

      // A deleted or re-pointed row also drafts the property it used to be on.
      const wasId =
        table === "properties" ? base[index]?.id : base[index]?.propertyId
      if (wasId) ids.add(wasId)
    }
  }

  return ids
}

/** Tables with any change, for the sidebar and the export summary. */
export function editedTables(state: DraftSlice): TableName[] {
  return TABLE_NAMES.filter((table) => isTableEdited(state, table))
}

/** Where each table is currently read from — shown so ops knows what is live. */
export const tableSource = (table: TableName) => sourceFor(table)

export { TABLE_NAMES }
