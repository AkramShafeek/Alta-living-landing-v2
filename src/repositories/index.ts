// ─────────────────────────────────────────────────────────────────────────
// The repositories, one per table.
//
// Wired to the in-memory db here and nowhere else, so swapping in a Sheets-
// backed implementation later is a change to this file alone. Everything above
// imports the instances, not the class.
// ─────────────────────────────────────────────────────────────────────────

import { createInMemoryRepository } from "./InMemoryRepository"

export const propertyRepository = createInMemoryRepository("properties")
export const unitRepository = createInMemoryRepository("units")
export const photoRepository = createInMemoryRepository("photos")
export const reviewRepository = createInMemoryRepository("reviews")
export const nearbyRepository = createInMemoryRepository("nearby")
export const amenityRepository = createInMemoryRepository("amenities")
export const includedRepository = createInMemoryRepository("included")
export const notIncludedRepository = createInMemoryRepository("notIncluded")
export const housekeepingRepository = createInMemoryRepository("housekeeping")
export const highlightRepository = createInMemoryRepository("highlights")
export const hostRepository = createInMemoryRepository("hosts")

export { createInMemoryRepository } from "./InMemoryRepository"
export type {
  Repository,
  ReadRepository,
  IdentifiedRepository,
  PropertyScopedRepository,
} from "./types"
