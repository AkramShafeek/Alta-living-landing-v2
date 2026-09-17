// ─────────────────────────────────────────────────────────────────────────
// Flat rows → one nested PropertyDetail.
//
// Fluent, and every child table is optional. The service can feed it whatever
// repositories it has wired and get a coherent object back — an unfed table
// comes through as an empty list, not as `undefined` the UI has to guard.
//
// The builder only shapes. It does not validate: the rows arrived already
// coerced and checked by the db layer, and domain invariants that span rows
// (exactly one `entire` unit, at most three highlights) belong to whoever
// decides what a broken catalog should do about them.
// ─────────────────────────────────────────────────────────────────────────

import type { PropertyAmenity } from "@/models/Amenity"
import type { Highlight } from "@/models/Highlight"
import type { Host } from "@/models/Host"
import type { Housekeeping } from "@/models/Housekeeping"
import type { PropertyIncluded } from "@/models/Included"
import type { Nearby } from "@/models/Nearby"
import type { NotIncluded } from "@/models/NotIncluded"
import type { Photo } from "@/models/Photo"
import type { Property } from "@/models/Property"
import type { Review } from "@/models/Review"
import type { Unit } from "@/models/Rooms"
import type { PropertyDetail } from "@/store/types"
import { byOrder, stripAll } from "./nesting"
import { buildUnitDetails } from "./unitBuilder"

/** Hero first, then by the order ops gave them. */
const byHeroThenOrder = (a: Photo, b: Photo): number =>
  a.isHero === b.isHero
    ? a.order - b.order
    : Number(b.isHero) - Number(a.isHero)

export class PropertyBuilder {
  private readonly property: Property

  private units: Unit[] = []
  private photos: Photo[] = []
  private reviews: Review[] = []
  private nearby: Nearby[] = []
  private amenities: PropertyAmenity[] = []
  private included: PropertyIncluded[] = []
  private notIncluded: NotIncluded[] = []
  private housekeeping: Housekeeping[] = []
  private highlights: Highlight[] = []
  private host: Host | null = null

  constructor(property: Property) {
    this.property = property
  }

  withUnits(units: Unit[]): this {
    this.units = units
    return this
  }

  /** Every photo of the property. Unit photos are distributed on `build()`. */
  withPhotos(photos: Photo[]): this {
    this.photos = photos
    return this
  }

  withReviews(reviews: Review[]): this {
    this.reviews = reviews
    return this
  }

  withNearby(nearby: Nearby[]): this {
    this.nearby = nearby
    return this
  }

  withAmenities(amenities: PropertyAmenity[]): this {
    this.amenities = amenities
    return this
  }

  withIncluded(included: PropertyIncluded[]): this {
    this.included = included
    return this
  }

  withNotIncluded(notIncluded: NotIncluded[]): this {
    this.notIncluded = notIncluded
    return this
  }

  withHousekeeping(housekeeping: Housekeeping[]): this {
    this.housekeeping = housekeeping
    return this
  }

  withHighlights(highlights: Highlight[]): this {
    this.highlights = highlights
    return this
  }

  /** `null` when the property's `hostId` matches no host row. */
  withHost(host: Host | null): this {
    this.host = host
    return this
  }

  build(): PropertyDetail {
    return {
      property: this.property,

      units: buildUnitDetails(this.units, this.photos),
      photos: [...this.photos].sort(byHeroThenOrder),
      reviews: this.reviews,

      nearby: stripAll(this.nearby),
      highlights: stripAll(this.highlights).sort(byOrder),
      notIncluded: stripAll(this.notIncluded).sort(byOrder),
      housekeeping: stripAll(this.housekeeping),

      // Join rows carried nothing but the key, so they collapse to it.
      amenities: this.amenities.map((row) => row.amenityKey),
      includedInPrice: this.included.map((row) => row.includedKey),

      host: this.host,
    }
  }
}

/** `new PropertyBuilder(row)` reads oddly mid-chain; this does not. */
export const buildProperty = (property: Property): PropertyBuilder =>
  new PropertyBuilder(property)
