// ─────────────────────────────────────────────────────────────────────────
// One home, across every table.
//
// The sheet stores a property as eleven rows in nine tabs. Ops thinks about it
// as one home. This file is the translation, and it is the whole reason the
// editor is worth using instead of the spreadsheet: the spreadsheet cannot show
// you a home, only a tab.
//
// Everything here works in *global* row indices — the position of a row in its
// full table — so the store's existing `setCell(table, index, …)` keeps working
// unchanged and there is one set of mutations rather than two.
// ─────────────────────────────────────────────────────────────────────────

import type { TableName } from "@/db/config"
import type { Row } from "@/db/types"
import { blankRow } from "./fields"
import { rowsOf, type DraftSlice } from "./draftStore"

/**
 * Tables that hang off a property, in the order the editor shows them —
 * roughly the order someone onboarding a home fills them in.
 *
 * `hosts` is absent on purpose: a host is shared across homes, so it is edited
 * once, elsewhere. `properties` is absent because it is the home itself.
 */
export const CHILD_TABLES = [
  "units",
  "photos",
  "amenities",
  "included",
  "notIncluded",
  "housekeeping",
  "nearby",
  "highlights",
  "reviews",
] as const satisfies readonly TableName[]

export type ChildTable = (typeof CHILD_TABLES)[number]

/** A child row, and where it sits in its full table. */
export type ScopedRow = {
  row: Row
  /** Index within the whole table — what the store mutators take. */
  index: number
}

/** Every row of one child table belonging to one property. */
export function scopedRows(
  state: DraftSlice,
  table: ChildTable,
  propertyId: string
): ScopedRow[] {
  return rowsOf(state, table)
    .map((row, index) => ({ row, index }))
    .filter((entry) => entry.row.propertyId === propertyId)
}

/** The property's own row, and where it sits. */
export function propertyRow(
  state: DraftSlice,
  propertyId: string
): ScopedRow | null {
  const index = rowsOf(state, "properties").findIndex(
    (row) => row.id === propertyId
  )
  if (index === -1) return null

  return { row: rowsOf(state, "properties")[index], index }
}

/** A blank child row already pointed at this property. */
export function newChildRow(table: ChildTable, propertyId: string): Row {
  return { ...blankRow(table), propertyId }
}

/**
 * A new property row with the fields that must be unique already filled.
 *
 * `id` and `slug` are generated rather than left blank because they are the two
 * columns a human is most likely to duplicate, and a duplicate id silently
 * attaches one home's units to another.
 */
export function newPropertyRow(existing: Row[]): Row {
  const numbers = existing
    .map((row) => Number(/^prop_(\d+)$/.exec(row.id ?? "")?.[1]))
    .filter((value) => Number.isFinite(value))

  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1
  const id = `prop_${String(next).padStart(3, "0")}`

  return {
    ...blankRow("properties"),
    id,
    slug: `new-home-${next}`,
    status: "draft",
    currency: "INR",
  }
}

// ── child ids ────────────────────────────────────────────────────────────
// Every generated id is the property id plus a noun and a number:
//
//   prop_004-room-1   prop_004-photo-12   prop_004-review-3   prop_004-entire
//
// Readable in a sheet cell, sortable, and scoped by construction — two homes
// cannot generate the same id because their prefixes differ. The number is the
// smallest one not already taken in the whole table, so a gap left by a
// deleted row is reused rather than the count creeping upward.
//
// Older ids (`unit_001a`, `ph_001b`) stay as they are. Nothing parses an id;
// it only has to be unique, and the two styles cannot collide.

/** The tables whose rows carry their own `id`, and the noun each one uses. */
export const ID_NOUNS = {
  units: "room",
  photos: "photo",
  reviews: "review",
} as const satisfies Partial<Record<ChildTable, string>>

export type IdTable = keyof typeof ID_NOUNS

export const hasOwnId = (table: TableName): table is IdTable =>
  table in ID_NOUNS

/**
 * A fresh id for a row of `table` belonging to `propertyId`.
 *
 * `taken` is every id already in the table — all homes, not just this one, so
 * a hand-typed id that happens to match the pattern is still avoided. Pass
 * `kind: "entire"` for the whole-home unit, which gets `<prop>-entire` when
 * that is free; a home has exactly one, so it needs no number.
 */
export function newChildId(
  table: IdTable,
  taken: ReadonlySet<string>,
  propertyId: string,
  kind?: string
): string {
  if (table === "units" && kind === "entire") {
    const whole = `${propertyId}-entire`
    if (!taken.has(whole)) return whole
  }

  const stem = `${propertyId}-${ID_NOUNS[table]}-`
  for (let n = 1; ; n += 1) {
    if (!taken.has(`${stem}${n}`)) return `${stem}${n}`
  }
}

/** Every non-blank id in a table. */
export const idsIn = (rows: readonly Row[]): Set<string> =>
  new Set(rows.map((row) => row.id ?? "").filter(Boolean))

/**
 * Fills every blank id on one home's units, photos and reviews.
 *
 * Returns only the tables it changed, ready for `replaceTables`. Ids that are
 * already set are never touched: a unit's id is what its photos point at, and
 * renaming it would silently detach them.
 */
export function fillMissingIds(
  state: DraftSlice,
  propertyId: string
): Partial<Record<TableName, Row[]>> {
  const changed: Partial<Record<TableName, Row[]>> = {}

  for (const table of Object.keys(ID_NOUNS) as IdTable[]) {
    const rows = rowsOf(state, table)
    const taken = idsIn(rows)
    let touched = false

    const next = rows.map((row) => {
      if (row.propertyId !== propertyId || (row.id ?? "").trim() !== "") {
        return row
      }
      const id = newChildId(table, taken, propertyId, row.kind)
      taken.add(id)
      touched = true
      return { ...row, id }
    })

    if (touched) changed[table] = next
  }

  return changed
}

/** How many of this home's id-bearing rows have no id yet. */
export function missingIdCount(state: DraftSlice, propertyId: string): number {
  let count = 0
  for (const table of Object.keys(ID_NOUNS) as IdTable[]) {
    for (const entry of scopedRows(state, table, propertyId)) {
      if ((entry.row.id ?? "").trim() === "") count += 1
    }
  }
  return count
}

/**
 * Every row of every table that belongs to one property, including its own.
 *
 * What the per-property export is built from, and what a cascade delete has to
 * remove. Returned as global indices, descending, so a caller can splice them
 * out without the earlier removals shifting the later ones.
 */
export function everyRowOf(
  state: DraftSlice,
  propertyId: string
): { table: TableName; index: number }[] {
  const found: { table: TableName; index: number }[] = []

  const own = propertyRow(state, propertyId)
  if (own) found.push({ table: "properties", index: own.index })

  for (const table of CHILD_TABLES) {
    for (const entry of scopedRows(state, table, propertyId)) {
      found.push({ table, index: entry.index })
    }
  }

  return found.sort((a, b) => b.index - a.index)
}

/** How many rows this home occupies, for a delete confirmation. */
export function rowCountOf(state: DraftSlice, propertyId: string): number {
  return everyRowOf(state, propertyId).length
}

/** "Indiranagar, Bangalore" from a property row. */
export const areaOf = (row: Row): string =>
  [row.neighbourhood, row.city].filter(Boolean).join(", ")
