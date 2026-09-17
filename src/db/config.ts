// ─────────────────────────────────────────────────────────────────────────
// The table registry.
//
// Declarative on purpose. Registration could instead be a side effect in each
// model file (`db.registerTable("properties", zProperty)`, mongoose-style), and
// ES module ordering would guarantee `db` exists by then — but the registry
// would then contain exactly the tables some module happened to import, and a
// bundler is free to drop a module nobody imports. That failure shows up in
// production and not in dev, because Vite's dev server does not tree-shake.
//
// Listing them here instead makes the set statically complete, keeps the
// dependency arrow pointing one way (models ← config ← db, never a cycle), and
// puts the sheet gids — deployment config, which differs between the test sheet
// and the real one — somewhere other than the model definitions.
// ─────────────────────────────────────────────────────────────────────────

import type { z } from "zod"
import { list } from "./coerce"
import type { CoerceOverrides } from "./parse"

import { zProperty } from "@/models/Property"
import { zUnit } from "@/models/Rooms"
import { zPhoto } from "@/models/Photo"
import { zReview } from "@/models/Review"
import { zNearby } from "@/models/Nearby"
import { zPropertyAmenity } from "@/models/Amenity"
import { zPropertyIncluded } from "@/models/Included"
import { zNotIncluded } from "@/models/NotIncluded"
import { zHousekeeping } from "@/models/Housekeeping"
import { zHighlight } from "@/models/Highlight"
import { zHost } from "@/models/Host"

/**
 * Where one table's rows come from.
 *
 * Per table rather than one global switch, so the sheet can take over the
 * catalog a tab at a time. A table is only as migrated as its data is ready:
 * `properties` can be live off the sheet while `reviews` is still a fixture,
 * and neither the service layer nor a component can tell the difference.
 */
export type TableSource = "mock" | "sheets"

export const dbConfig = {
  /**
   * The `2PACX-…` id from File > Share > Publish to web. Not the spreadsheet id
   * in the editing URL — that one is for the Sheets API and does not work here.
   */
  pubId: import.meta.env.VITE_SHEET_PUB_ID ?? "",
}

export type TableDef = {
  /**
   * Sheet tab id — the `gid=` in the URL bar with that tab selected.
   *
   * Empty means "whole-document publish", which serves the first tab of the
   * spreadsheet. Only one table can legitimately be empty; the rest need their
   * own gid or they will all read the same tab.
   */
  gid: string
  schema: z.ZodObject
  /**
   * Per-column coercer overrides. Empty everywhere today — the coercer is
   * derived from each field's Zod type, and no column currently needs an
   * exception. Kept so the first weird cell does not force a rethink.
   */
  coerce?: CoerceOverrides
  /**
   * What a row that fails validation does to the rest of its table.
   *
   * Defaults to "fail". Ops edits a live spreadsheet, so an invalid row is now
   * a routine event rather than something a reviewer would have caught, and
   * the right answer genuinely differs per table:
   *
   *   "fail" — the table is unusable without this row. A dropped unit renders
   *            a home with one fewer bedroom at a price that no longer matches
   *            what is there, which is worse than showing nothing.
   *
   *   "skip" — the row is one item in a list the rest of which is still true.
   *            One property missing from the listing is a smaller incident
   *            than every property missing because of one typo.
   *
   * Skipped rows are never silent — see `db.issues()`.
   */
  onBadRow?: "fail" | "skip"
}

export const tables = {
  // "skip" rather than "fail": this is the table ops edits most, so a typo in
  // one home costs that home rather than the whole catalog.
  properties: { gid: "1205454703", schema: zProperty, onBadRow: "skip" },
  units: { gid: "0", schema: zUnit },
  photos: { gid: "", schema: zPhoto },
  reviews: { gid: "", schema: zReview },
  nearby: { gid: "", schema: zNearby },
  amenities: { gid: "", schema: zPropertyAmenity },
  included: { gid: "", schema: zPropertyIncluded },
  notIncluded: { gid: "", schema: zNotIncluded },
  housekeeping: { gid: "", schema: zHousekeeping },
  highlights: { gid: "", schema: zHighlight },

  // Not published, and not to be: `phone` and `whatsapp` are a real person's
  // contact details and a published tab is world-readable. Fixture only.
  //
  // `languages` is the one column whose Zod type does not imply its coercer —
  // an array reads as text and would arrive as the literal string
  // "English|Kannada|Hindi". This is what the `coerce` escape hatch is for.
  hosts: { gid: "", schema: zHost, coerce: { languages: list } },
} as const satisfies Record<string, TableDef>

export type TableName = keyof typeof tables

// ─────────────────────────────────────────────────────────────────────────
// Per-table source selection.
//
// Written out one line per table instead of a loop over the table names,
// because Vite replaces `import.meta.env.VITE_SOMETHING` textually at build
// time. A computed read — ``import.meta.env[`VITE_DB_SOURCE_${name}`]`` — is
// never substituted, so it resolves in dev (where the dev server exposes the
// whole env object) and is `undefined` in the production bundle. That bug
// ships green: every table silently falls back to its fixture and the site
// serves stale content that looks entirely correct.
//
// So the repetition is load-bearing. It also keeps this file's promise that
// the registry is statically complete — the set of tables and the set of
// switches are both readable here, with nothing resolved at runtime.
// ─────────────────────────────────────────────────────────────────────────

function readSource(
  value: string | undefined,
  fallback: TableSource
): TableSource {
  const source = value?.trim().toLowerCase()
  if (source === "mock" || source === "sheets") return source
  return fallback
}

/** Applies to any table without its own switch. Defaults to fixtures. */
const defaultSource = readSource(import.meta.env.VITE_DB_SOURCE, "mock")

const sources: Record<TableName, TableSource> = {
  properties: readSource(
    import.meta.env.VITE_DB_SOURCE_PROPERTIES,
    defaultSource
  ),
  units: readSource(import.meta.env.VITE_DB_SOURCE_UNITS, defaultSource),
  photos: readSource(import.meta.env.VITE_DB_SOURCE_PHOTOS, defaultSource),
  reviews: readSource(import.meta.env.VITE_DB_SOURCE_REVIEWS, defaultSource),
  nearby: readSource(import.meta.env.VITE_DB_SOURCE_NEARBY, defaultSource),
  amenities: readSource(
    import.meta.env.VITE_DB_SOURCE_AMENITIES,
    defaultSource
  ),
  included: readSource(import.meta.env.VITE_DB_SOURCE_INCLUDED, defaultSource),
  notIncluded: readSource(
    import.meta.env.VITE_DB_SOURCE_NOT_INCLUDED,
    defaultSource
  ),
  housekeeping: readSource(
    import.meta.env.VITE_DB_SOURCE_HOUSEKEEPING,
    defaultSource
  ),
  highlights: readSource(
    import.meta.env.VITE_DB_SOURCE_HIGHLIGHTS,
    defaultSource
  ),
  // No env switch: there is no published tab for this one to switch to.
  hosts: "mock",
}

/** Where this table reads from right now. */
export const sourceFor = (tableName: TableName): TableSource =>
  sources[tableName]

/** Every table and its current source — for a startup log or a debug panel. */
export const sourceReport = (): Record<TableName, TableSource> => ({
  ...sources,
})

/** The model a table yields once its rows are coerced and validated. */
export type RowOf<K extends TableName> = z.infer<(typeof tables)[K]["schema"]>
