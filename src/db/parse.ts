// ─────────────────────────────────────────────────────────────────────────
// Raw rows → model objects.
//
// The coercer for a column is *derived from its Zod type* rather than listed in
// a mapping table. Every model field is a scalar (the arrays and nested objects
// all became tables of their own), so the type fully determines the treatment:
// a `z.number()` column wants `num`, a `z.date()` column wants `date`, and
// there is no judgement call left over to encode by hand.
//
// The alternative — `{ bedrooms: num, listedOn: date, ... }` per table — is a
// second copy of the schema, and `properties` alone has 60-odd columns for it
// to drift against. Adding a field here costs nothing; forgetting to add it is
// not possible.
//
// A blank cell and a missing column are the same thing: every coercer returns
// `undefined` for both, and Zod's `.optional()` / `.default()` decide what that
// means. In a spreadsheet they genuinely are the same thing — ops clearing a
// cell and ops never filling it are indistinguishable — so this is a modelling
// decision, not a shortcut.
// ─────────────────────────────────────────────────────────────────────────

import { z } from "zod"
import { bool, date, num, str } from "./coerce"
import { RowValidationError, type Row } from "./types"

/** Turns one cell into one value. `undefined` means "blank". */
export type Coercer = (value: string | undefined) => unknown

/** Per-column escape hatch, for the rare cell its Zod type describes badly. */
export type CoerceOverrides = Record<string, Coercer>

/**
 * Peels `.optional()`, `.default()` and `.nullable()` off to reach the type
 * that actually says how to read the cell.
 */
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

export function coercerFor(schema: z.ZodType): Coercer {
  const inner = unwrap(schema) as z.ZodType & { def: { type: string } }
  switch (inner.def.type) {
    case "number":
      return num
    case "boolean":
      return bool
    case "date":
      return date
    // string, enum, literal — and anything new that reads as text.
    default:
      return str
  }
}

/**
 * Applies the derived coercers across one row.
 *
 * Driven by the schema's keys, not the row's: a stray column the model does not
 * declare is dropped rather than carried along, so a spare working column in
 * the ops sheet cannot reach the store.
 */
export function coerceRow(
  schema: z.ZodObject,
  row: Row,
  overrides: CoerceOverrides = {}
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(schema.shape)) {
    const coerce = overrides[key] ?? coercerFor(field as z.ZodType)
    out[key] = coerce(row[key])
  }
  return out
}

/**
 * How a bad row is addressed in an error message. `id` when the table has one,
 * otherwise the composite key ops would recognise, otherwise the row number.
 */
function rowLabel(row: Row, index: number): string {
  if (row.id) return row.id
  if (row.propertyId) {
    const second =
      row.name ??
      row.amenityKey ??
      row.includedKey ??
      row.cover ??
      row.item ??
      row.value
    return second ? `${row.propertyId}/${second}` : row.propertyId
  }
  return `row ${index + 1}`
}

/** One row that did not validate, kept so a human can be told about it. */
export type BadRow = {
  table: string
  /** How ops would recognise the row — its id, or its composite key. */
  row: string
  /** Every complaint Zod made about it, joined. */
  detail: string
}

export type ParseResult<T> = {
  rows: T[]
  /** Empty unless the table is "skip" and something was actually dropped. */
  skipped: BadRow[]
}

/**
 * Coerces and validates a whole table.
 *
 * Two behaviours, chosen per table by `onBadRow` in the registry:
 *
 *   "fail" (default) — throw on the first bad row. The original stance, and
 *   still right where a missing row corrupts the meaning of the ones that
 *   remain: a silently dropped unit renders a home with one fewer bedroom at a
 *   price that no longer matches what is there.
 *
 *   "skip" — drop the row, keep the table, and report what was dropped. That
 *   argument above is about *wrong* data; it is not the same argument as
 *   *unavailable* data, and a live spreadsheet is what separates them. An ops
 *   typo used to require a code change and a reviewer. It now reaches
 *   production five minutes after someone types it, so for a table that is a
 *   list of independent things, one bad entry should cost one entry.
 *
 * Nothing is dropped quietly: every skipped row comes back in `skipped`, and
 * the db layer logs it and keeps it for `db.issues()`.
 */
export function parseTable<T extends z.ZodObject>(
  tableName: string,
  schema: T,
  rows: Row[],
  overrides: CoerceOverrides = {},
  onBadRow: "fail" | "skip" = "fail"
): ParseResult<z.infer<T>> {
  const parsed: z.infer<T>[] = []
  const skipped: BadRow[] = []

  rows.forEach((row, index) => {
    const result = schema.safeParse(coerceRow(schema, row, overrides))

    if (result.success) {
      parsed.push(result.data)
      return
    }

    const label = rowLabel(row, index)
    const detail = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(row)"}: ${issue.message}`)
      .join("; ")

    if (onBadRow === "fail") {
      throw new RowValidationError(
        `${tableName} row "${label}" is invalid — ${detail}`
      )
    }

    skipped.push({ table: tableName, row: label, detail })
  })

  return { rows: parsed, skipped }
}
