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

/** A new unit id that does not collide inside this property. */
export function newUnitId(units: Row[], propertyId: string): string {
  const suffix = propertyId.replace(/^prop_/, "")
  const taken = new Set(units.map((unit) => unit.id))

  for (let i = 0; i < 26; i += 1) {
    const candidate = `unit_${suffix}${String.fromCharCode(97 + i)}`
    if (!taken.has(candidate)) return candidate
  }
  return `unit_${suffix}_${Date.now()}`
}

/** Same, for photos. */
export function newPhotoId(photos: Row[], propertyId: string): string {
  const suffix = propertyId.replace(/^prop_/, "")
  const taken = new Set(photos.map((photo) => photo.id))

  for (let i = 0; i < 26; i += 1) {
    const candidate = `ph_${suffix}${String.fromCharCode(97 + i)}`
    if (!taken.has(candidate)) return candidate
  }
  return `ph_${suffix}_${Date.now()}`
}

/** Same, for reviews. */
export function newReviewId(reviews: Row[], propertyId: string): string {
  const suffix = propertyId.replace(/^prop_/, "")
  const taken = new Set(reviews.map((review) => review.id))

  for (let i = 0; i < 26; i += 1) {
    const candidate = `rev_${suffix}${String.fromCharCode(97 + i)}`
    if (!taken.has(candidate)) return candidate
  }
  return `rev_${suffix}_${Date.now()}`
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
