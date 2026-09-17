// ─────────────────────────────────────────────────────────────────────────
// The database object.
//
// Reads a table, coerces its string cells, validates the result against the
// model, and hands back typed objects. Callers above this line never see a
// string where a number belongs, and never see a row the schema rejects.
//
// It does not join. Relations are followed one layer up — a table here is a
// table, flat, exactly as the sheet stores it.
// ─────────────────────────────────────────────────────────────────────────

import {
  dbConfig,
  sourceFor,
  tables,
  type RowOf,
  type TableDef,
  type TableName,
} from "./config"
import { parseTable, type BadRow } from "./parse"
import { csvUrl, fetchTable } from "./sheets"
import { DbError, type Row } from "./types"

import properties from "@/data/mock/properties.json"
import units from "@/data/mock/units.json"
import photos from "@/data/mock/photos.json"
import reviews from "@/data/mock/reviews.json"
import nearby from "@/data/mock/nearby.json"
import amenities from "@/data/mock/amenities.json"
import included from "@/data/mock/included.json"
import notIncluded from "@/data/mock/notIncluded.json"
import housekeeping from "@/data/mock/housekeeping.json"
import highlights from "@/data/mock/highlights.json"
import hosts from "@/data/mock/hosts.json"

/**
 * Imported statically rather than fetched, so a missing fixture is a build
 * error instead of a 404 at runtime. Every value is a string here, the same way
 * a Sheets export is — see db/parse.ts for why that is deliberate.
 */
const mockTables: Record<TableName, Row[]> = {
  properties,
  units,
  photos,
  reviews,
  nearby,
  amenities,
  included,
  notIncluded,
  housekeeping,
  highlights,
  hosts,
}

class DB {
  /**
   * Parsed tables, kept so repeated reads cost nothing after the first.
   *
   * The *promise* is cached, not the result. A page renders several components
   * that each ask for `properties`, and they ask before any of them resolves —
   * caching the result only would let all of them past the check and fire a
   * network request each. A failed read drops its entry so the next caller
   * retries instead of inheriting the error forever.
   */
  private cache = new Map<TableName, Promise<unknown[]>>()

  /** Rows dropped by a "skip" table on its last read, per table. */
  private badRows = new Map<TableName, BadRow[]>()

  /** Unparsed rows, for callers that need the sheet's own strings. */
  private rawCache = new Map<TableName, Promise<Row[]>>()

  /**
   * Reads one table from whichever source that table is pointed at.
   *
   * The decision is per table and made here, which is why the migration is
   * boring: a table that flips to sheets returns the same `Row[]` shape the
   * fixture did, and every layer above — coercion, validation, repositories,
   * the service — is unchanged and untested-against either way.
   */
  private async loadRaw(
    tableName: TableName,
    definition: TableDef
  ): Promise<Row[]> {
    const source = sourceFor(tableName)

    if (source === "mock") {
      // Cloned so a caller mutating a row cannot corrupt the fixture for the
      // next read — the Sheets driver hands back fresh objects anyway.
      return structuredClone(mockTables[tableName])
    }

    if (source === "sheets") {
      if (dbConfig.pubId === "") {
        throw new DbError(
          `Table "${tableName}" is set to read from sheets but VITE_SHEET_PUB_ID is not set`
        )
      }
      return fetchTable(tableName, csvUrl(dbConfig.pubId, definition.gid))
    }

    throw new DbError(`Unknown source "${source}" for table "${tableName}"`)
  }

  /**
   * One table exactly as the sheet hands it over — every cell a string, nothing
   * coerced, nothing validated, nothing dropped.
   *
   * The ops editor reads this rather than `getTable`, for one reason: the rows
   * it most needs to show are the ones `getTable` refuses. A property that fails
   * validation is quarantined out of the typed result, and quarantined rows are
   * precisely the ones somebody has to go and fix. Reading the typed table would
   * hide the work.
   *
   * It is also lossless in a way the typed table is not — a cell reading
   * "12,000" or "14/03/2021" comes back as it was typed, so an editor that
   * writes it back out cannot silently reformat a column it never touched.
   *
   * Cached separately from the parsed table: the two hold different shapes of
   * the same fetch, and `invalidate()` clears both.
   */
  public getRawTable(tableName: TableName): Promise<Row[]> {
    const cached = this.rawCache.get(tableName)
    if (cached) return cached

    const definition: TableDef = tables[tableName]
    if (!definition) {
      return Promise.reject(new DbError(`Table "${tableName}" is not registered`))
    }

    const pending = this.loadRaw(tableName, definition)
    pending.catch(() => this.rawCache.delete(tableName))

    this.rawCache.set(tableName, pending)
    return pending
  }

  /** Reads one table, coerced and validated into its model type. */
  public getTable<K extends TableName>(tableName: K): Promise<RowOf<K>[]> {
    const cached = this.cache.get(tableName)
    if (cached) return cached as Promise<RowOf<K>[]>

    // Widened from the `as const` literal, which narrows away the optional
    // `coerce` key while no table declares one.
    const definition: TableDef = tables[tableName]
    if (!definition) {
      return Promise.reject(
        new DbError(`Table "${tableName}" is not registered`)
      )
    }

    const pending = this.loadRaw(tableName, definition).then((raw) => {
      const { rows, skipped } = parseTable(
        tableName,
        definition.schema,
        raw,
        definition.coerce,
        definition.onBadRow
      )

      if (skipped.length > 0) {
        // Kept and logged rather than swallowed. A quarantined row is a silent
        // content bug otherwise: the home simply is not on the site, and the
        // person who typed the bad cell has no reason to suspect anything.
        this.badRows.set(tableName, skipped)
        for (const bad of skipped) {
          console.error(
            `[db] dropped ${bad.table} row "${bad.row}" — ${bad.detail}`
          )
        }
      } else {
        this.badRows.delete(tableName)
      }

      return rows
    })

    pending.catch(() => this.cache.delete(tableName))

    this.cache.set(tableName, pending)
    return pending as Promise<RowOf<K>[]>
  }

  /**
   * Drops the cache, so the next read goes back to the driver.
   *
   * This is what makes a correction in the sheet reachable without a page
   * reload — the store calls it on a forced refresh. Note Google edge-caches
   * the published CSV for about five minutes, so an edit made moments ago may
   * still come back stale however often this is called.
   */
  public invalidate(tableName?: TableName): void {
    if (tableName) {
      this.cache.delete(tableName)
      this.rawCache.delete(tableName)
      this.badRows.delete(tableName)
      return
    }
    this.cache.clear()
    this.rawCache.clear()
    this.badRows.clear()
  }

  /**
   * Every row dropped by a "skip" table on its most recent read.
   *
   * The seam for telling someone. Nothing surfaces this in the UI yet; an ops
   * banner or a health check is the obvious next consumer.
   */
  public issues(): BadRow[] {
    return [...this.badRows.values()].flat()
  }
}

/** The shape a repository is injected with, so a test can pass a stand-in. */
export type Database = DB

const db = new DB()

export default db
