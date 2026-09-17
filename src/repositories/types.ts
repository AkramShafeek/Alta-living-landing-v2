// ─────────────────────────────────────────────────────────────────────────
// The repository port.
//
// One repository per table, read-only for now. The db layer below already
// returns coerced, validated model objects, so a repository adds no parsing —
// it adds *addressing*: the handful of ways the layers above actually look a
// row up. Nothing here knows about Zod, sheets, or strings.
//
// The method set is not uniform across tables, and deliberately so. `findById`
// is meaningless on a join table that has no id column, and `findByPropertyId`
// is meaningless on `properties` itself. Rather than offer them everywhere and
// return empty, the type conditionally grants each group only where its key
// exists — so `amenityRepository.findById(...)` is a compile error rather than
// a runtime surprise.
// ─────────────────────────────────────────────────────────────────────────

/** Available on every table. */
export interface ReadRepository<T> {
  findAll(): Promise<T[]>

  /** Every row whose `field` equals `value`. */
  findBy<K extends keyof T>(field: K, value: T[K]): Promise<T[]>

  /** The first such row, or `null`. For fields that are unique by convention. */
  findOneBy<K extends keyof T>(field: K, value: T[K]): Promise<T | null>

  /** Escape hatch for anything the named finders do not cover. */
  findWhere(predicate: (row: T) => boolean): Promise<T[]>

  /**
   * Every row bucketed by one column, in a single pass.
   *
   * This is what the service layer joins with: fetching each property's rows
   * one call at a time is an N+1, and against a spreadsheet there is no index
   * to make that cheap. Rows whose key is unset are omitted.
   */
  groupBy<K extends keyof T>(field: K): Promise<Map<NonNullable<T[K]>, T[]>>

  count(): Promise<number>
}

/** Granted only to tables with an `id` column. */
export interface IdentifiedRepository<T> {
  findById(id: string): Promise<T | null>

  /** Preserves the order of `ids`; ids that match nothing are skipped. */
  findByIds(ids: readonly string[]): Promise<T[]>

  exists(id: string): Promise<boolean>
}

/** Granted only to tables with a `propertyId` column. */
export interface PropertyScopedRepository<T> {
  findByPropertyId(propertyId: string): Promise<T[]>

  /** The grouped form, for joining many properties without an N+1. */
  findByPropertyIds(propertyIds: readonly string[]): Promise<Map<string, T[]>>
}

/**
 * What a caller actually receives. The intersections resolve per table:
 * `Repository<Property>` has `findById` but not `findByPropertyId`;
 * `Repository<PropertyAmenity>` has neither; `Repository<Unit>` has both.
 *
 * Wrapped in tuples so the conditionals do not distribute over a union type.
 */
export type Repository<T> = ReadRepository<T> &
  ([T] extends [{ id: string }] ? IdentifiedRepository<T> : unknown) &
  ([T] extends [{ propertyId: string }] ? PropertyScopedRepository<T> : unknown)
