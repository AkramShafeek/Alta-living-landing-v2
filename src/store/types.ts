// ─────────────────────────────────────────────────────────────────────────
// What a property looks like once it is assembled.
//
// Plain TypeScript, no Zod. Schemas belong at a trust boundary, and the only
// one is db/parse.ts — every row here was already coerced and validated on its
// way out of `getTable`. A schema at this layer would be a second declaration
// of the same shape, revalidating data we built ourselves, and it would not
// catch the bug it looks like it prevents: a join that attaches the wrong
// property's reviews produces a perfectly valid object.
//
// (If the store is ever persisted to localStorage, rehydration *is* a trust
// boundary and does want a schema. Add it then, for that.)
//
// Every type below is composed from the models rather than written out, so a
// column added to a table cannot go missing here.
// ─────────────────────────────────────────────────────────────────────────

import type { AmenityKey, IncludedKey } from "@/models/common"
import type { Highlight } from "@/models/Highlight"
import type { Host } from "@/models/Host"
import type { Housekeeping } from "@/models/Housekeeping"
import type { Nearby } from "@/models/Nearby"
import type { NotIncluded } from "@/models/NotIncluded"
import type { Photo } from "@/models/Photo"
import type { Property as PropertyRow } from "@/models/Property"
import type { Review } from "@/models/Review"
import type { Unit } from "@/models/Rooms"

/**
 * `propertyId` is dropped from every nested child: once a row sits inside the
 * property it belongs to, the foreign key is noise the UI would have to read
 * past, and a second place for the association to be wrong.
 */
type Nested<T> = Omit<T, "propertyId">

/** A room, with the photos that belong to it. */
export type UnitDetail = Nested<Unit> & {
  photos: Photo[]
}

/**
 * One property, whole.
 *
 * Extends the flat row rather than restating it, so all ~60 scalar columns
 * (`bedrooms`, `kitchenHob`, `wifiDownMbps`, …) come through unchanged. The
 * scalars stay flat deliberately: re-nesting `kitchen`/`parking`/`wifi`/`water`
 * back into objects would buy the UI nothing and cost a translation step that
 * can disagree with the table.
 *
 * What *is* nested is the 1:N relations, because those genuinely are
 * collections and the UI reads them as such.
 */
export type PropertyDetail = {
  property: PropertyRow
  units: UnitDetail[]
  /** Every photo of the home, hero first. Unit photos also appear on the unit. */
  photos: Photo[]
  reviews: Review[]
  nearby: Nested<Nearby>[]
  highlights: Nested<Highlight>[]
  notIncluded: Nested<NotIncluded>[]
  housekeeping: Nested<Housekeeping>[]
  /** Join rows collapse to bare keys — the row carried nothing else. */
  amenities: AmenityKey[]
  includedInPrice: IncludedKey[]

  /**
   * The host responsible for this home, or `null` if the row points at a host
   * that does not exist.
   *
   * Nullable rather than required because a dangling foreign key is an ops
   * mistake, not a reason to fail the page — the rest of the property is still
   * true. Nothing renders this yet; it is joined so the relation is real rather
   * than notional.
   */
  host: Host | null
}

/**
 * Nothing derived is stored. No "2 BHK", no "2 of 3 available", no price-from,
 * no formatted rupees. Those are selectors computed at read time, so a stored
 * display string cannot drift out of sync with the fact it was built from.
 */
