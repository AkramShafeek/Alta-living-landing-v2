// ─────────────────────────────────────────────────────────────────────────
// Bulk import: one nested JSON document → sheet rows.
//
// The format is specified in docs/bulk-import-format.md. In short: a home is
// one object, and everything that belongs to it nests inside — units with
// their own photos and reviews, then the home's photos, reviews, amenities and
// the rest. The editor's flat tables are an artefact of the sheet; nobody
// writing fifty homes should have to repeat `propertyId` fifty times per home.
//
// Pure: document + current draft in, replacement tables out. Nothing touches
// the store until the caller applies the plan, so a bad file changes nothing.
//
// What this does NOT do is validate values. A cell is turned into the string
// the sheet would hold and left for the model to judge, exactly as if ops had
// typed it — the editor then shows every problem in place, with the model's own
// message. Duplicating those rules here would be a second copy to drift.
// What it does refuse is a document whose *shape* is wrong, or that would
// collide with ids already in use, because neither is fixable in a form.
// ─────────────────────────────────────────────────────────────────────────

import type { TableName } from "@/db/config"
import type { Row } from "@/db/types"
import { blankRow, fieldsOf, problemCountOf } from "./fields"
import { rowsOf, type DraftSlice } from "./draftStore"
import {
  CHILD_TABLES,
  idsIn,
  newChildId,
  type ChildTable,
  type IdTable,
} from "./propertyScope"

/** A home in the document, as the summary reports it. */
export type ImportedHome = {
  id: string
  name: string
  /** True when a home with this id was already in the draft and is replaced. */
  replaced: boolean
}

export type ImportPlan = {
  /** Every table the import changes, whole — hand straight to `replaceTables`. */
  tables: Partial<Record<TableName, Row[]>>
  homes: ImportedHome[]
  /** Rows written across all tables. */
  rowCount: number
  /** Ids the import had to make up so nested photos/reviews keep their room. */
  generatedIds: number
  /** Fields the site would reject, summed — fix them in the editor. */
  problemCount: number
  /** Things ignored rather than imported, e.g. an unknown key. */
  warnings: string[]
}

/** The document cannot be imported; nothing has been changed. */
export class ImportError extends Error {
  readonly problems: string[]

  constructor(problems: string[]) {
    super(problems.join("\n"))
    this.name = "ImportError"
    this.problems = problems
  }
}

/** Keys on a home that hold a nested table rather than a column. */
const HOME_NESTED = {
  units: "units",
  photos: "photos",
  reviews: "reviews",
  amenities: "amenities",
  included: "included",
  notIncluded: "notIncluded",
  housekeeping: "housekeeping",
  nearby: "nearby",
  highlights: "highlights",
} as const satisfies Record<string, ChildTable>

/** Keys on a unit that hold its own photos and reviews. */
const UNIT_NESTED = ["photos", "reviews"] as const

/** Join tables: the document gives a bare list of keys. */
const KEY_LISTS: Partial<Record<ChildTable, string>> = {
  amenities: "amenityKey",
  included: "includedKey",
}

/** Tables with an `order` column the import fills from document position. */
const ORDERED = new Set<ChildTable>(["photos", "notIncluded", "highlights"])

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const blank = (value: string | undefined): boolean =>
  (value ?? "").trim() === ""

// ── reading one row ─────────────────────────────────────────────────────

type Context = {
  problems: string[]
  warnings: string[]
}

/**
 * One JSON value as the string a sheet cell would hold.
 *
 * Booleans become TRUE/FALSE and arrays are pipe-joined, because that is what
 * the db's coercers read back. Numbers are written bare: "18000", not "18,000"
 * — the coercer accepts both, and bare is what a machine-written file has.
 */
function toCell(value: unknown, path: string, ctx: Context): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : ""
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value.join("|")
  }

  ctx.problems.push(`${path}: expected a string, number or boolean`)
  return ""
}

/**
 * The columns of `table` read off `source`, onto a blank row.
 *
 * Starts from `blankRow` so every imported row has every column, like a row
 * added by hand — the export writes one header per tab and relies on it.
 * Keys in `skip` are handled by the caller (nesting, `propertyId`); any other
 * key the model does not have is reported and dropped.
 */
function readRow(
  table: TableName,
  source: Record<string, unknown>,
  path: string,
  ctx: Context,
  skip: ReadonlySet<string> = new Set()
): Row {
  const row = blankRow(table)
  const columns = new Set(fieldsOf(table).map((field) => field.name))

  for (const [key, value] of Object.entries(source)) {
    if (skip.has(key)) continue

    if (key === "propertyId" && table !== "properties") {
      ctx.warnings.push(
        `${path}.propertyId ignored — it is taken from the home it is nested in`
      )
      continue
    }
    if (!columns.has(key)) {
      ctx.warnings.push(`${path}.${key} ignored — not a ${table} column`)
      continue
    }

    row[key] = toCell(value, `${path}.${key}`, ctx)
  }

  return row
}

/** An array of objects at `path`, or a problem and an empty list. */
function objectList(
  value: unknown,
  path: string,
  ctx: Context
): Record<string, unknown>[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    ctx.problems.push(`${path}: expected a list`)
    return []
  }

  return value.filter((item, index) => {
    if (isObject(item)) return true
    ctx.problems.push(`${path}[${index}]: expected an object`)
    return false
  }) as Record<string, unknown>[]
}

// ── one home ────────────────────────────────────────────────────────────

/** A row waiting for its id, if it has none and something must point at it. */
type Pending = { table: IdTable; row: Row; needsId: boolean }

type ReadHome = {
  id: string
  property: Row
  children: Partial<Record<ChildTable, Row[]>>
  /** Units that nested photos/reviews point at, and so need an id. */
  pending: Pending[]
  /** Rows whose `unitId` should be set to their unit's id once it is known. */
  links: { child: Row; unit: Row }[]
}

function readHome(
  source: Record<string, unknown>,
  path: string,
  ctx: Context
): ReadHome | null {
  const id = typeof source.id === "string" ? source.id.trim() : ""
  if (!id) {
    // The one id that is never optional: every other row is keyed by it, and
    // every generated id is built from it.
    ctx.problems.push(`${path}.id: every home needs an id, e.g. "prop_014"`)
    return null
  }

  const property = readRow(
    "properties",
    source,
    path,
    ctx,
    new Set(Object.keys(HOME_NESTED))
  )
  property.id = id

  const children: Partial<Record<ChildTable, Row[]>> = {}
  const pending: Pending[] = []
  const links: ReadHome["links"] = []

  const push = (table: ChildTable, row: Row) => {
    row.propertyId = id
    ;(children[table] ??= []).push(row)
  }

  // Photos nested in units are held back and appended after the home's own,
  // so the gallery opens on the home and then walks room by room. Default
  // `order` follows that sequence.
  const unitPhotos: Row[] = []

  objectList(source.units, `${path}.units`, ctx).forEach((unitSource, u) => {
    const unitPath = `${path}.units[${u}]`
    const unit = readRow("units", unitSource, unitPath, ctx, new Set(UNIT_NESTED))
    if (blank(unit.kind)) unit.kind = "room"
    push("units", unit)

    let nested = 0
    for (const key of UNIT_NESTED) {
      const table = key as "photos" | "reviews"
      objectList(unitSource[key], `${unitPath}.${key}`, ctx).forEach(
        (childSource, c) => {
          const childPath = `${unitPath}.${key}[${c}]`
          if ("unitId" in childSource) {
            ctx.warnings.push(
              `${childPath}.unitId ignored — it is the unit it is nested in`
            )
          }
          const child = readRow(table, childSource, childPath, ctx, new Set(["unitId"]))
          links.push({ child, unit })
          if (table === "photos") unitPhotos.push(child)
          else push("reviews", child)
          nested += 1
        }
      )
    }

    pending.push({ table: "units", row: unit, needsId: nested > 0 })
  })

  for (const [key, table] of Object.entries(HOME_NESTED)) {
    if (table === "units") continue
    const listPath = `${path}.${key}`
    const keyColumn = KEY_LISTS[table]

    if (keyColumn) {
      const value = source[key]
      if (value === undefined || value === null) continue
      if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
        ctx.problems.push(`${listPath}: expected a list of keys, e.g. ["washer", "lift"]`)
        continue
      }
      for (const item of new Set(value)) {
        push(table, { ...blankRow(table), [keyColumn]: item })
      }
      continue
    }

    const rows = objectList(source[key], listPath, ctx).map((childSource, c) =>
      readRow(table, childSource, `${listPath}[${c}]`, ctx)
    )
    if (table === "photos") rows.push(...unitPhotos)
    rows.forEach((row) => push(table, row))
  }

  // Position is the order, unless the document says otherwise.
  for (const table of ORDERED) {
    children[table]?.forEach((row, index) => {
      if (blank(row.order)) row.order = String(index)
    })
  }

  return { id, property, children, pending, links }
}

// ── the document ────────────────────────────────────────────────────────

/** The list of homes, from any of the three accepted top-level shapes. */
function homesIn(doc: unknown, ctx: Context): Record<string, unknown>[] {
  if (Array.isArray(doc)) return objectList(doc, "homes", ctx)
  if (isObject(doc) && Array.isArray(doc.properties)) {
    return objectList(doc.properties, "properties", ctx)
  }
  if (isObject(doc) && "id" in doc) return [doc]

  ctx.problems.push(
    'Expected { "properties": [ … ] }, a list of homes, or a single home'
  )
  return []
}

/**
 * Plans an import against the current draft.
 *
 * A home whose id is already in the draft is **replaced** whole: its old rows
 * in every tab are removed and the document's take their place. That makes a
 * re-import of a corrected file the way to fix it, rather than a merge whose
 * result nobody can predict.
 *
 * Throws `ImportError` with every problem found, not just the first, so one
 * round trip fixes the file.
 */
export function planImport(doc: unknown, state: DraftSlice): ImportPlan {
  const ctx: Context = { problems: [], warnings: [] }

  const homes = homesIn(doc, ctx)
    .map((source, index) =>
      readHome(source, `properties[${index}] (${String(source.id ?? "no id")})`, ctx)
    )
    .filter((home): home is ReadHome => home !== null)

  if (homes.length === 0 && ctx.problems.length === 0) {
    ctx.problems.push("The document has no homes in it")
  }

  // ── collisions ────────────────────────────────────────────────────────
  const importing = new Set<string>()
  for (const home of homes) {
    if (importing.has(home.id)) {
      ctx.problems.push(`Home id "${home.id}" appears twice in the document`)
    }
    importing.add(home.id)
  }

  // What stays: everything not belonging to a home being imported.
  const kept = (table: TableName): Row[] =>
    rowsOf(state, table).filter((row) =>
      table === "properties"
        ? !importing.has(row.id ?? "")
        : !importing.has(row.propertyId ?? "")
    )

  // Slugs are the site's URLs; two homes on one slug means one is unreachable.
  const slugs = new Map<string, string>()
  for (const row of kept("properties")) {
    if (!blank(row.slug)) slugs.set(row.slug!, row.id ?? "?")
  }
  for (const home of homes) {
    const slug = home.property.slug ?? ""
    if (blank(slug)) continue
    const owner = slugs.get(slug)
    if (owner && owner !== home.id) {
      ctx.problems.push(`Slug "${slug}" on ${home.id} is already used by ${owner}`)
    }
    slugs.set(slug, home.id)
  }

  // Given ids must be unique across the whole table, not just this home.
  const taken: Record<IdTable, Set<string>> = {
    units: idsIn(kept("units")),
    photos: idsIn(kept("photos")),
    reviews: idsIn(kept("reviews")),
  }
  for (const home of homes) {
    for (const table of Object.keys(taken) as IdTable[]) {
      for (const row of home.children[table] ?? []) {
        const id = (row.id ?? "").trim()
        if (!id) continue
        if (taken[table].has(id)) {
          ctx.problems.push(`${table} id "${id}" (in ${home.id}) is already in use`)
        }
        taken[table].add(id)
      }
    }
  }

  if (ctx.problems.length > 0) throw new ImportError(ctx.problems)

  // ── ids that something points at ─────────────────────────────────────
  // A blank id stays blank, as asked — unless nested photos or reviews hang
  // off it, in which case the link needs a value to point at. Generated in the
  // same `<prop>-room-N` shape as the editor's button.
  let generatedIds = 0
  for (const home of homes) {
    for (const entry of home.pending) {
      if (!entry.needsId || !blank(entry.row.id)) continue
      const id = newChildId(entry.table, taken[entry.table], home.id, entry.row.kind)
      entry.row.id = id
      taken[entry.table].add(id)
      generatedIds += 1
    }
    for (const { child, unit } of home.links) child.unitId = unit.id ?? ""
  }

  // ── the replacement tables ───────────────────────────────────────────
  const tables: Partial<Record<TableName, Row[]>> = {
    properties: [...kept("properties"), ...homes.map((home) => home.property)],
  }
  for (const table of CHILD_TABLES) {
    const added = homes.flatMap((home) => home.children[table] ?? [])
    const replacing = rowsOf(state, table).some((row) =>
      importing.has(row.propertyId ?? "")
    )
    if (added.length > 0 || replacing) tables[table] = [...kept(table), ...added]
  }

  const existing = new Set(rowsOf(state, "properties").map((row) => row.id))
  let rowCount = 0
  let problemCount = 0
  for (const home of homes) {
    rowCount += 1
    problemCount += problemCountOf("properties", home.property)
    for (const table of CHILD_TABLES) {
      for (const row of home.children[table] ?? []) {
        rowCount += 1
        problemCount += problemCountOf(table, row)
      }
    }
  }

  return {
    tables,
    homes: homes.map((home) => ({
      id: home.id,
      name: home.property.name ?? "",
      replaced: existing.has(home.id),
    })),
    rowCount,
    generatedIds,
    problemCount,
    warnings: ctx.warnings,
  }
}

/** Parses the file's text, turning a JSON syntax error into an `ImportError`. */
export function parseImportText(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new ImportError([
      `Not valid JSON — ${error instanceof Error ? error.message : String(error)}`,
    ])
  }
}
