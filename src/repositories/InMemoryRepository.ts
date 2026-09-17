// ─────────────────────────────────────────────────────────────────────────
// A repository backed by the in-memory db.
//
// It knows exactly one thing the port does not: that the whole table is
// available at once, so every lookup is a pass over an array rather than a
// query. That is not a shortcut — a spreadsheet genuinely cannot serve a single
// row, and pretending otherwise would let callers assume an index that the real
// backend will never have.
//
// The db caches each parsed table, so only the first call does any work; every
// finder after that is a scan of objects already in memory.
// ─────────────────────────────────────────────────────────────────────────

import database, { type Database } from "@/db/db"
import type { RowOf, TableName } from "@/db/config"
import type { Repository } from "./types"

class InMemoryRepository<K extends TableName> {
  // Declared rather than written as constructor parameter properties, which
  // `erasableSyntaxOnly` disallows.
  private readonly tableName: K
  private readonly db: Database

  constructor(tableName: K, db: Database) {
    this.tableName = tableName
    this.db = db
  }

  private rows(): Promise<RowOf<K>[]> {
    return this.db.getTable(this.tableName)
  }

  async findAll(): Promise<RowOf<K>[]> {
    return this.rows()
  }

  async findBy<F extends keyof RowOf<K>>(
    field: F,
    value: RowOf<K>[F]
  ): Promise<RowOf<K>[]> {
    const rows = await this.rows()
    return rows.filter((row) => row[field] === value)
  }

  async findOneBy<F extends keyof RowOf<K>>(
    field: F,
    value: RowOf<K>[F]
  ): Promise<RowOf<K> | null> {
    const rows = await this.rows()
    return rows.find((row) => row[field] === value) ?? null
  }

  async findWhere(predicate: (row: RowOf<K>) => boolean): Promise<RowOf<K>[]> {
    const rows = await this.rows()
    return rows.filter(predicate)
  }

  async groupBy<F extends keyof RowOf<K>>(
    field: F
  ): Promise<Map<NonNullable<RowOf<K>[F]>, RowOf<K>[]>> {
    const rows = await this.rows()
    const grouped = new Map<NonNullable<RowOf<K>[F]>, RowOf<K>[]>()

    for (const row of rows) {
      const key = row[field]
      // An unset foreign key means "belongs to no one" — a photo of the whole
      // home rather than of one room. Bucketing those under `undefined` would
      // invite a caller to read them back as a group.
      if (key === undefined || key === null || key === "") continue

      const bucket = grouped.get(key as NonNullable<RowOf<K>[F]>)
      if (bucket) bucket.push(row)
      else grouped.set(key as NonNullable<RowOf<K>[F]>, [row])
    }

    return grouped
  }

  async count(): Promise<number> {
    return (await this.rows()).length
  }

  // ── id-keyed tables ────────────────────────────────────────────────────

  async findById(id: string): Promise<RowOf<K> | null> {
    return this.findOneBy(
      "id" as keyof RowOf<K>,
      id as RowOf<K>[keyof RowOf<K>]
    )
  }

  async findByIds(ids: readonly string[]): Promise<RowOf<K>[]> {
    const rows = await this.rows()
    const byId = new Map(rows.map((row) => [(row as { id: string }).id, row]))
    return ids
      .map((id) => byId.get(id))
      .filter((row): row is RowOf<K> => row !== undefined)
  }

  async exists(id: string): Promise<boolean> {
    return (await this.findById(id)) !== null
  }

  // ── property-scoped tables ─────────────────────────────────────────────

  async findByPropertyId(propertyId: string): Promise<RowOf<K>[]> {
    return this.findBy(
      "propertyId" as keyof RowOf<K>,
      propertyId as RowOf<K>[keyof RowOf<K>]
    )
  }

  async findByPropertyIds(
    propertyIds: readonly string[]
  ): Promise<Map<string, RowOf<K>[]>> {
    const grouped = (await this.groupBy("propertyId" as keyof RowOf<K>)) as Map<
      string,
      RowOf<K>[]
    >

    // Every requested id gets an entry, so a caller can read the map without
    // guarding each lookup — a property with no reviews yet is an empty list,
    // not a missing key.
    const out = new Map<string, RowOf<K>[]>()
    for (const id of propertyIds) out.set(id, grouped.get(id) ?? [])
    return out
  }
}

/**
 * Builds the repository for one table.
 *
 * The cast is where the conditional method set is applied: the class implements
 * every finder, and `Repository<T>` exposes only the ones whose key column that
 * table actually has.
 */
export function createInMemoryRepository<K extends TableName>(
  tableName: K,
  db: Database = database
): Repository<RowOf<K>> {
  return new InMemoryRepository(tableName, db) as unknown as Repository<
    RowOf<K>
  >
}
