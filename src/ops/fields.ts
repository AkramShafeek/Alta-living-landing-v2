// ─────────────────────────────────────────────────────────────────────────
// Zod schema → editable field.
//
// Derived from the schema rather than declared per table, for the same reason
// db/parse.ts derives its coercers that way: `properties` alone has 66 columns,
// and a hand-written field list is a second copy of the schema for those columns
// to drift against. Add a column to a model and it becomes editable here, with
// the right control and the right validation, without touching this file.
//
// The point of the control mapping is that ops cannot type a wrong answer where
// a right one is enumerable. `city` is three values, so it is a dropdown, not a
// text box that fails validation after the fact. Every enum in models/common.ts
// arrives here as a closed list for free.
//
// What this file does NOT do is re-implement validation. A cell is valid if the
// model says so — `check()` runs the real coercer and the real Zod field, which
// is the same pair the db will run when the sheet is read back. Anything else
// would let the editor bless a value the site then rejects.
// ─────────────────────────────────────────────────────────────────────────

import { z } from "zod"
import { coercerFor, type Coercer } from "@/db/parse"
import type { TableDef, TableName } from "@/db/config"
import { tables } from "@/db/config"
import type { Row } from "@/db/types"

/** How a cell is edited. */
export type FieldKind =
  | "text"
  /** Long prose — `body`, a review's text. Rendered as a textarea. */
  | "paragraph"
  | "number"
  /** TRUE / FALSE, as the sheet spells it. */
  | "boolean"
  /** A closed list from the model. */
  | "enum"
  /** dd/mm/yyyy. */
  | "date"
  /** Pipe-separated in one cell — "English|Kannada|Hindi". */
  | "list"

export type Field = {
  name: string
  kind: FieldKind
  /** Present for `enum`; the only legal values. */
  options?: readonly string[]
  /**
   * Whether a blank cell is rejected by the model.
   *
   * Derived, not declared: a field is optional if it survives `.optional()`,
   * carries a `.default()`, or accepts `undefined`.
   */
  required: boolean
  /** Ops-facing note, shown under the control. */
  hint?: string
}

/** Peels wrappers until the type that decides the control is reached. */
function unwrap(schema: z.ZodType): z.ZodType {
  let current = schema as z.ZodType & {
    def: { type: string; innerType?: z.ZodType }
  }
  while (
    (current.def.type === "optional" ||
      current.def.type === "default" ||
      current.def.type === "nullable" ||
      current.def.type === "prefault") &&
    current.def.innerType
  ) {
    current = current.def.innerType as typeof current
  }
  return current
}

/** A field is required when the schema rejects a missing value. */
const isRequired = (schema: z.ZodType): boolean =>
  !schema.safeParse(undefined).success

/**
 * Columns whose prose is long enough that a single-line input is the wrong
 * shape. Listed by name because nothing in a `z.string()` says how long the
 * string tends to be.
 */
const PARAGRAPH_FIELDS = new Set([
  "body",
  "text",
  "note",
  "founderNote",
  "addressLine",
])

const HINTS: Record<string, string> = {
  date: "dd/mm/yyyy",
  list: "Separate with | — e.g. English|Kannada|Hindi",
  boolean: "TRUE or FALSE",
}

export function fieldFor(name: string, schema: z.ZodType): Field {
  const inner = unwrap(schema) as z.ZodType & {
    def: { type: string; entries?: object; values?: readonly unknown[] }
  }
  const required = isRequired(schema)

  if (inner.def.type === "enum") {
    const options = Object.keys(
      (inner.def.entries ?? {}) as Record<string, string>
    )
    return { name, kind: "enum", options, required }
  }

  // A literal is an enum of one — `currency` is the only case, and a dropdown
  // holding "INR" is better than a text box that accepts "inr" and then fails.
  if (inner.def.type === "literal") {
    return {
      name,
      kind: "enum",
      options: (inner.def.values ?? []).map(String),
      required,
    }
  }

  if (inner.def.type === "array") {
    return { name, kind: "list", required, hint: HINTS.list }
  }

  if (inner.def.type === "number") return { name, kind: "number", required }
  if (inner.def.type === "boolean")
    return { name, kind: "boolean", required, hint: HINTS.boolean }
  if (inner.def.type === "date")
    return { name, kind: "date", required, hint: HINTS.date }

  return {
    name,
    kind: PARAGRAPH_FIELDS.has(name) ? "paragraph" : "text",
    required,
  }
}

/** Every editable field of a table, in the order the model declares them. */
export function fieldsOf(tableName: TableName): Field[] {
  const shape = tables[tableName].schema.shape as Record<string, z.ZodType>
  return Object.entries(shape).map(([name, schema]) => fieldFor(name, schema))
}

/**
 * The coercer the db will actually use for this column.
 *
 * The registry's per-column override wins over the one derived from the Zod
 * type — exactly as `coerceRow` resolves it in db/parse.ts. Deriving it here
 * instead was a bug worth naming: `hosts.languages` is a pipe-separated string
 * in the sheet and an array in the model, so the derived coercer handed a
 * string to an array schema and the editor reported "expected array, received
 * string" on a cell the site reads perfectly well. The editor must run the
 * same pair as the db or it will disagree with the site in one direction or
 * the other.
 */
function coercerUsedBy(
  tableName: TableName,
  fieldName: string,
  schema: z.ZodType
): Coercer {
  // Widened from the `as const` literal, which narrows away the optional
  // `coerce` key on every table that does not declare one — the same widening
  // db.ts does for the same reason.
  const definition: TableDef = tables[tableName]
  return definition.coerce?.[fieldName] ?? coercerFor(schema)
}

/**
 * Validates one cell the way the db will.
 *
 * Runs the real coercer and the real field schema, so "12,000" passes a number
 * column, "English|Kannada" passes a list column, and "Mumbai" fails a `city`
 * enum with the model's own message. Returns `null` when the cell is fine.
 */
export function checkCell(
  tableName: TableName,
  fieldName: string,
  value: string | undefined
): string | null {
  const shape = tables[tableName].schema.shape as Record<string, z.ZodType>
  const schema = shape[fieldName]
  if (!schema) return null

  const result = schema.safeParse(
    coercerUsedBy(tableName, fieldName, schema)(value)
  )
  if (result.success) return null

  return result.error.issues.map((issue) => issue.message).join("; ")
}

/**
 * Every complaint about one row, keyed by column. Empty when the row is good.
 *
 * Memoised on the row object itself. The editor validates every row of every
 * table on each render so the sidebar counts stay honest, and `properties`
 * alone is 66 `safeParse` calls per row — at a few hundred rows that is enough
 * work per keystroke to be felt. Immer shares structure, so a row that did not
 * change keeps its identity and its cached answer; only the edited row is
 * revalidated.
 *
 * Safe because these rows are never mutated in place: immer freezes what it
 * produces, and the mutators copy before they write.
 */
const problemCache = new WeakMap<Row, Record<string, string>>()

export function checkRow(
  tableName: TableName,
  row: Row
): Record<string, string> {
  const cached = problemCache.get(row)
  if (cached) return cached

  const problems: Record<string, string> = {}

  for (const field of fieldsOf(tableName)) {
    const problem = checkCell(tableName, field.name, row[field.name])
    if (problem) problems[field.name] = problem
  }

  problemCache.set(row, problems)
  return problems
}

/**
 * How ops recognises a row in a list.
 *
 * `id` where a table has one; otherwise the composite key ops themselves would
 * use, which is the same shape `db/parse.ts` reaches for when it names a bad
 * row. Falls back to the row number so a half-typed new row still has a label.
 */
export function rowLabel(
  _tableName: TableName,
  row: Row,
  index: number
): string {
  if (row.id) return row.id

  const second =
    row.name ??
    row.amenityKey ??
    row.includedKey ??
    row.cover ??
    row.item ??
    row.value
  if (row.propertyId) {
    return second ? `${row.propertyId} · ${second}` : row.propertyId
  }

  return second ?? `Row ${index + 1}`
}

/**
 * A blank row shaped like the table.
 *
 * Every column present and empty, so a new row has the same keys as every other
 * row and the exported TSV keeps one consistent header.
 */
export function blankRow(tableName: TableName): Row {
  const row: Row = {}
  for (const field of fieldsOf(tableName)) row[field.name] = ""
  return row
}

/** How many columns of this row the model would reject. */
export const problemCountOf = (tableName: TableName, row: Row): number =>
  Object.keys(checkRow(tableName, row)).length
