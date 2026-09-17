// ─────────────────────────────────────────────────────────────────────────
// CSV text → raw rows.
//
// Hand-rolled rather than pulled from npm, because the job is small and the
// failure mode of getting it wrong is silent. `properties.body` is a prose
// column with commas in it, and `reviews.text` will eventually have a line
// break; a `split(",")` shifts every column after the comma by one and the
// row still validates, because most of this schema is strings. So the quoting
// rules of RFC 4180 are the whole point of this file:
//
//   - a field wrapped in quotes may contain commas, newlines and quotes
//   - a literal quote inside a quoted field is written twice ("")
//   - anything outside quotes ends at the next comma or line break
//
// Google's published CSV follows this exactly — it quotes a field only when it
// has to, which is why most of a row looks like it would survive a naive split.
// ─────────────────────────────────────────────────────────────────────────

import type { Row } from "./types"

/**
 * Splits CSV text into a grid of cells.
 *
 * Line endings are normalised on the way through: Sheets sends \r\n, and a
 * stray \r left on the last column of every row would fail every enum in the
 * schema with a message that does not mention whitespace.
 */
export function parseCsv(text: string): string[][] {
  // Sheets prefixes a BOM on some exports; left in place it becomes part of
  // the first header name, so `id` silently stops matching.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text

  const grid: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  let index = 0

  const endField = () => {
    row.push(field)
    field = ""
  }

  const endRow = () => {
    endField()
    grid.push(row)
    row = []
  }

  while (index < input.length) {
    const char = input[index]

    if (quoted) {
      if (char === '"') {
        // A doubled quote is an escaped quote; a lone one closes the field.
        if (input[index + 1] === '"') {
          field += '"'
          index += 2
          continue
        }
        quoted = false
        index += 1
        continue
      }
      field += char
      index += 1
      continue
    }

    if (char === '"') {
      quoted = true
      index += 1
      continue
    }

    if (char === ",") {
      endField()
      index += 1
      continue
    }

    if (char === "\r" || char === "\n") {
      endRow()
      // \r\n is one line break, not two.
      index += char === "\r" && input[index + 1] === "\n" ? 2 : 1
      continue
    }

    field += char
    index += 1
  }

  // The last row has no line break after it unless the file ends with one, in
  // which case there is nothing pending and appending would invent a blank row.
  if (field !== "" || row.length > 0 || quoted) endRow()

  return grid
}

const isBlankRow = (cells: string[]): boolean =>
  cells.every((cell) => cell.trim() === "")

/**
 * Turns CSV text into the `Row` shape the rest of the db layer speaks: one
 * object per data row, keyed by the header, every value still a string.
 *
 * Deliberately forgiving about the sheet's shape, because ops owns it:
 *
 *   - blank rows are dropped, since a sheet accumulates them at the bottom and
 *     an empty row is not a record ops meant to create
 *   - unnamed columns are dropped, so a spacer column between sections cannot
 *     land in the row object
 *   - a short row reads as blank cells, which `coerceRow` already treats the
 *     same as a missing column
 *
 * Extra *named* columns are kept here and dropped a layer up — `coerceRow`
 * walks the schema's keys, not the row's — so ops can keep working columns in
 * the sheet without them reaching the store.
 */
export function rowsFromCsv(text: string): Row[] {
  const grid = parseCsv(text)
  if (grid.length === 0) return []

  const headers = grid[0].map((header) => header.trim())

  return grid.slice(1).flatMap((cells) => {
    if (isBlankRow(cells)) return []

    const row: Row = {}
    headers.forEach((header, column) => {
      if (header === "") return
      row[header] = cells[column] ?? ""
    })
    return [row]
  })
}
