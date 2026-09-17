// ─────────────────────────────────────────────────────────────────────────
// Draft → files ops can paste into the sheet.
//
// Tab-separated, not CSV, and deliberately so. Ops pastes these into Google
// Sheets, which splits a pasted block on tabs automatically and needs "Split
// text to columns" for commas. The one hazard is a cell that itself contains a
// tab or a newline, which would silently become two cells or two rows — so
// those are flattened to spaces on the way out, and every one is reported.
//
// ── Why a per-home export ships two copies of every tab ──────────────────
//
// A spreadsheet's unit of paste is a whole tab, but the editor's unit of work
// is one home, and those do not line up. So the archive carries both:
//
//   full-tabs/   the complete tab, every home. Paste over the tab and it is
//                correct by construction. Wrong only if somebody else changed
//                a different home since this draft was read — then this
//                silently reverts their work.
//
//   this-home/   only this home's rows. Safe alongside other people's edits,
//                at the cost of deleting the old rows by hand first.
//
// The second is only workable because nothing in the reader depends on the row
// order of a tab: `db/csv.ts` keys by header, and ordering *within* a home is
// carried by explicit `order` columns. So "delete this home's rows, paste these
// at the bottom" is a correct operation, not a lucky one.
// ─────────────────────────────────────────────────────────────────────────

import { zipSync, strToU8 } from "fflate"
import { tables, type TableName } from "@/db/config"
import { fieldsOf } from "./fields"
import type { Row } from "@/db/types"
import { CHILD_TABLES } from "./propertyScope"

/** A cell that would break the paste, and where it is. */
export type CellWarning = {
  table: TableName
  row: number
  column: string
}

export type ExportedTable = {
  table: TableName
  rowCount: number
  /** Rows belonging to the exported home, when the export is scoped to one. */
  scopedCount?: number
}

/**
 * Columns come from the model, not from the rows.
 *
 * Driven by the schema so the header is identical every time regardless of
 * which keys a given row happens to carry — a new row typed in the editor and
 * a row read from the sheet produce the same columns in the same order, and
 * that order matches the sheet's own.
 */
export function columnsOf(tableName: TableName): string[] {
  return fieldsOf(tableName).map((field) => field.name)
}

const flatten = (value: string): string => value.replace(/[\t\r\n]+/g, " ")

export function toTsv(
  tableName: TableName,
  rows: Row[],
  warnings: CellWarning[] = []
): string {
  const columns = columnsOf(tableName)
  const lines = [columns.join("\t")]

  rows.forEach((row, index) => {
    const cells = columns.map((column) => {
      const raw = row[column] ?? ""
      if (/[\t\r\n]/.test(raw))
        warnings.push({ table: tableName, row: index, column })
      return flatten(raw)
    })
    lines.push(cells.join("\t"))
  })

  // CRLF, because that is what Sheets and Excel both expect from a pasted or
  // opened text file on Windows, which is where this lands.
  return lines.join("\r\n")
}

export type ExportResult = {
  blob: Blob
  filename: string
  tables: ExportedTable[]
  warnings: CellWarning[]
  /** The home this archive was built for, when it was built for one. */
  scope: { id: string; name: string } | null
}

const stampNow = (): string =>
  new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "home"

// ── README ──────────────────────────────────────────────────────────────

const PASTE_STEPS = [
  "  1. Open the spreadsheet and go to the tab named after the file.",
  "  2. Select the whole tab and set Format > Number > Plain text. This keeps",
  "     12,000 / 560038 / 14/03/2021 from being reinterpreted on paste.",
  "  3. Open the .txt file, select everything, copy.",
  "  4. Click the target cell and paste. Columns are tab-separated, so Sheets",
  "     splits them for you. If it all lands in column A, use",
  "     Data > Split text to columns > Separator: Tab.",
]

function warningLines(warnings: CellWarning[]): string[] {
  if (warnings.length === 0) return []

  return [
    "",
    "CELLS THAT WERE FLATTENED",
    "  These held a tab or a line break, which would have broken the paste into",
    "  extra cells or rows. Each was replaced with a single space. Check them:",
    ...warnings.map(
      (warning) =>
        `  ${warning.table} - row ${warning.row + 1}, column ${warning.column}`
    ),
  ]
}

const HOSTS_NOTE = [
  "",
  "NOTE ON hosts",
  "  The hosts tab holds phone numbers and is deliberately NOT published to the",
  "  web. Keep that tab private.",
]

function wholeCatalogReadme(
  exported: ExportedTable[],
  warnings: CellWarning[]
): string {
  return [
    "ALTA LIVING - FULL CATALOG EXPORT",
    "",
    `Exported ${new Date().toLocaleString("en-IN")}`,
    "",
    "This is every tab, complete. Replace each tab's contents with the matching",
    "file. Do not append - each file already contains the header row and every",
    "row, so appending duplicates the catalog.",
    "",
    "HOW TO APPLY",
    ...PASTE_STEPS,
    "",
    "  Delete the tab's existing contents before pasting, and paste at A1.",
    "",
    "FILES",
    ...exported.map(
      (item) =>
        `  ${item.table}.txt - ${item.rowCount} row${item.rowCount === 1 ? "" : "s"}`
    ),
    ...HOSTS_NOTE,
    ...warningLines(warnings),
  ].join("\r\n")
}

function propertyReadme(
  home: { id: string; name: string },
  exported: ExportedTable[],
  warnings: CellWarning[]
): string {
  return [
    `ALTA LIVING - EXPORT FOR ${home.name.toUpperCase()}`,
    "",
    `Home: ${home.name} (${home.id})`,
    `Exported ${new Date().toLocaleString("en-IN")}`,
    "",
    "There are two copies of every tab in here. Use ONE of the two routes.",
    "",
    "════ ROUTE A - replace the whole tab (simplest) ════",
    "",
    "  Use the files in full-tabs/. Each is the complete tab including every",
    "  other home, with this home's rows already updated.",
    "",
    ...PASTE_STEPS,
    "",
    "  Delete the tab's existing contents before pasting, and paste at A1.",
    "",
    "  Use this when you are the only person editing the sheet. If somebody",
    "  else changed a DIFFERENT home since this export was made, this route",
    "  silently reverts their change - the file still holds the old version of",
    "  their rows.",
    "",
    "════ ROUTE B - replace only this home's rows (safe alongside others) ════",
    "",
    "  Use the files in this-home/. Each holds only the rows for this home,",
    "  with the same header.",
    "",
    "  For each tab:",
    "    1. Set the tab to plain text (Format > Number > Plain text).",
    "    2. Sort or filter the tab by propertyId and find the rows for",
    `       ${home.id}. On the properties tab, look at the id column instead.`,
    "    3. Delete those rows entirely (right-click > Delete rows).",
    "    4. Paste the rows from the file at the first empty row at the bottom.",
    "       Skip the header line - the tab already has one.",
    "",
    "  Row order across homes does not matter to the site; ordering within a",
    "  home is handled by the order columns, which are in the data.",
    "",
    "ROWS FOR THIS HOME",
    ...exported.map(
      (item) =>
        `  ${item.table} - ${item.scopedCount ?? 0} of ${item.rowCount} row(s) on the tab`
    ),
    ...HOSTS_NOTE,
    ...warningLines(warnings),
  ].join("\r\n")
}

// ── builders ────────────────────────────────────────────────────────────

/**
 * Every table, complete. For a bulk update or a first upload.
 */
export function buildExport(
  rowsByTable: Record<TableName, Row[]>
): ExportResult {
  const warnings: CellWarning[] = []
  const files: Record<string, Uint8Array> = {}
  const exported: ExportedTable[] = []

  for (const table of Object.keys(tables) as TableName[]) {
    const rows = rowsByTable[table] ?? []
    exported.push({ table, rowCount: rows.length })
    files[`${table}.txt`] = strToU8(toTsv(table, rows, warnings))
  }

  files["README.txt"] = strToU8(wholeCatalogReadme(exported, warnings))

  return {
    blob: new Blob([zipSync(files) as BlobPart], { type: "application/zip" }),
    filename: `alta-catalog-${stampNow()}.zip`,
    tables: exported,
    warnings,
    scope: null,
  }
}

/**
 * One home, both ways.
 *
 * `hosts` appears in full-tabs only — a host is shared across homes, so there
 * is no per-home slice of it to paste.
 */
export function buildPropertyExport(
  rowsByTable: Record<TableName, Row[]>,
  home: { id: string; name: string }
): ExportResult {
  const warnings: CellWarning[] = []
  const files: Record<string, Uint8Array> = {}
  const exported: ExportedTable[] = []

  const scopedOf = (table: TableName, rows: Row[]): Row[] => {
    if (table === "properties") return rows.filter((row) => row.id === home.id)
    if ((CHILD_TABLES as readonly string[]).includes(table)) {
      return rows.filter((row) => row.propertyId === home.id)
    }
    return []
  }

  for (const table of Object.keys(tables) as TableName[]) {
    const rows = rowsByTable[table] ?? []
    const scoped = scopedOf(table, rows)

    exported.push({ table, rowCount: rows.length, scopedCount: scoped.length })

    // Warnings are collected from the full tab only, so a flattened cell is
    // reported once rather than twice for the same row.
    files[`full-tabs/${table}.txt`] = strToU8(toTsv(table, rows, warnings))
    if (table !== "hosts") {
      files[`this-home/${table}.txt`] = strToU8(toTsv(table, scoped))
    }
  }

  files["README.txt"] = strToU8(propertyReadme(home, exported, warnings))

  return {
    blob: new Blob([zipSync(files) as BlobPart], { type: "application/zip" }),
    filename: `alta-${slugify(home.name)}-${stampNow()}.zip`,
    tables: exported,
    warnings,
    scope: home,
  }
}

/** Hands the archive to the browser as a download. */
export function downloadExport(result: ExportResult): void {
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement("a")
  link.href = url
  link.download = result.filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Revoked on a delay rather than immediately: Safari cancels an in-flight
  // download when the object URL disappears under it.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
