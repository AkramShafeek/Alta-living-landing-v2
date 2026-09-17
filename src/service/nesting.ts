// ─────────────────────────────────────────────────────────────────────────
// Small helpers shared by the builders.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Drops the foreign key from a child row.
 *
 * Once a row sits inside the property it belongs to, `propertyId` is a second
 * place the association can be wrong — and the UI would have to read past it.
 * Mirrors `Nested<T>` in store/types.ts at runtime.
 */
export function stripPropertyId<T extends { propertyId: string }>(
  row: T
): Omit<T, "propertyId"> {
  const { propertyId: _propertyId, ...rest } = row
  return rest
}

export const stripAll = <T extends { propertyId: string }>(
  rows: T[]
): Omit<T, "propertyId">[] => rows.map(stripPropertyId)

/** Sheet rows have no inherent order, so anything displayed in sequence carries one. */
export const byOrder = (a: { order: number }, b: { order: number }): number =>
  a.order - b.order
