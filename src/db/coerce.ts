// ─────────────────────────────────────────────────────────────────────────
// Sheet cells → JavaScript values.
//
// A spreadsheet has no types. Everything arrives as a string, formatted the way
// a human typed it: "3,200" for a number, "TRUE" for a boolean, "01/10/2025"
// for a date, "" for anything left blank. These helpers are the one place that
// knows about that, so the schema above and the UI below can both stay typed.
//
// Every helper returns `undefined` for a blank cell rather than throwing, and
// leaves "required vs optional" to the Zod schema — one concern per layer.
// ─────────────────────────────────────────────────────────────────────────

import type { Row } from "./types"

/** Blank cells and whitespace-only cells both mean "not set". */
export const isBlank = (value: string | undefined): boolean =>
  value === undefined || value.trim() === ""

export const str = (value: string | undefined): string | undefined =>
  isBlank(value) ? undefined : value!.trim()

/**
 * Accepts the shapes a sheet actually produces: "3200", "3,200", "₹ 3,200",
 * " 12.5 ". Returns `undefined` for blanks and `NaN` for genuine junk, so Zod
 * reports the bad cell rather than silently reading it as zero.
 */
export const num = (value: string | undefined): number | undefined => {
  if (isBlank(value)) return undefined
  const cleaned = value!.replace(/[₹,\s]/g, "")
  return cleaned === "" ? undefined : Number(cleaned)
}

/** Sheets checkboxes export as TRUE/FALSE; humans also type yes/no/1/0. */
export const bool = (value: string | undefined): boolean | undefined => {
  if (isBlank(value)) return undefined
  const v = value!.trim().toLowerCase()
  if (["true", "yes", "y", "1"].includes(v)) return true
  if (["false", "no", "n", "0"].includes(v)) return false
  return undefined
}

/**
 * dd/mm/yyyy — the default in Indian locale sheets, and the one format where
 * guessing wrong silently produces a plausible but wrong date. ISO
 * (yyyy-mm-dd) is accepted too since that is what a Sheets API read returns.
 */
export const date = (value: string | undefined): Date | undefined => {
  if (isBlank(value)) return undefined
  const raw = value!.trim()

  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const [, y, m, d] = iso
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  return undefined
}

/** Pipe-separated list in a single cell: "electricity|water|internet". */
export const list = (value: string | undefined): string[] => {
  if (isBlank(value)) return []
  return value!
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part !== "")
}

/**
 * Pipe-separated pairs, each joined by "::" — "1926::house, restored 2021".
 * Used where a sheet needs two fields in one cell and a whole extra tab would
 * be more ceremony than the data deserves.
 */
export const pairs = (value: string | undefined): [string, string][] =>
  list(value).map((entry) => {
    const [left, ...rest] = entry.split("::")
    return [left.trim(), rest.join("::").trim()]
  })

/** Reads "a.b" out of a flat row, since sheets have no nested columns. */
export const at = (row: Row, key: string): string | undefined => row[key]
