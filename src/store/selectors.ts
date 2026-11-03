// ─────────────────────────────────────────────────────────────────────────
// Derived reads over the catalog.
//
// Everything the UI shows but the store does not hold. `bedrooms: 2` is stored,
// "2 BHK" is computed here; a nightly rate is stored, "₹ 3,200" is computed
// here. Keeping these out of the store is what stops a display string drifting
// away from the fact it was built from.
//
// Pure functions over `PropertyDetail`, plus a few zustand selectors at the
// bottom. Nothing here touches the service or the db.
// ─────────────────────────────────────────────────────────────────────────

import type { UnitDetail } from "./types"
import type { PropertyDetail } from "./types"
import { useShallow } from "zustand/react/shallow"
import { useCatalogStore } from "./catalogStore"

export const formatINR = (value: number): string =>
  `₹ ${value.toLocaleString("en-IN")}`

// ── the whole-home unit ──────────────────────────────────────────────────

/**
 * The unit that represents taking the entire property.
 *
 * Priced directly rather than as a discount off the rooms, so the headline
 * rate is a lookup and never a sum. Exactly one is expected per property; this
 * returns `undefined` rather than throwing if the invariant is broken, because
 * a listing card with a missing price is better than a page that will not render.
 *
 * Also `undefined` for a home with `allowsEntireBooking` off — the service
 * leaves the unit out entirely, so there is nothing here to find.
 */
export const selectWholeUnit = (
  property: PropertyDetail
): UnitDetail | undefined =>
  property.units.find((unit) => unit.kind === "entire")

export const selectRooms = (property: PropertyDetail): UnitDetail[] =>
  property.units.filter((unit) => unit.kind === "room")

// ── the starting price ───────────────────────────────────────────────────

/**
 * The unit with the lowest monthly rate — rooms and the whole home alike.
 *
 * Every unit counts, booked or not: "starting from" describes what the home
 * costs, not what is free tonight. The whole home is in the running only when
 * the home offers it, because the service leaves it out otherwise.
 *
 * A rate of 0 is "not priced yet", never "free", so it is skipped. `undefined`
 * when nothing on the home has a price.
 */
export const selectCheapestUnit = (
  property: PropertyDetail
): UnitDetail | undefined =>
  property.units.reduce<UnitDetail | undefined>(
    (cheapest, unit) =>
      unit.monthlyRate > 0 &&
      (!cheapest || unit.monthlyRate < cheapest.monthlyRate)
        ? unit
        : cheapest,
    undefined
  )

/** "Starting from" — 0 when the home has no priced unit yet. */
export const selectStartingMonthly = (property: PropertyDetail): number =>
  selectCheapestUnit(property)?.monthlyRate ?? 0

// ── ratings ──────────────────────────────────────────────────────────────

/**
 * Below this, an average says more about who happened to write than about the
 * home, so nothing is shown at all rather than a confident-looking 5.0.
 */
export const MIN_REVIEWS_FOR_RATING = 3

export const selectRating = (property: PropertyDetail): number | null => {
  const { reviews } = property
  if (reviews.length < MIN_REVIEWS_FOR_RATING) return null
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

// ── labels ───────────────────────────────────────────────────────────────

/** "2 BHK", "Studio". */
export const selectBedLabel = (property: PropertyDetail): string => {
  const { propertyType, bedrooms } = property.property
  if (propertyType === "studio") return "Studio"
  return `${bedrooms} BHK`
}

/**
 * How many of this unit exist. 1 for an ordinary room or the whole home; a
 * replica room is one listing standing for `totalCount` identical rooms.
 */
export const unitCapacity = (unit: UnitDetail): number =>
  unit.hasReplicas ? (unit.totalCount ?? 0) : 1

/**
 * How many of this unit a guest could take today.
 *
 * `status` gates first: a blocked or booked replica room is shut whatever its
 * counts say, so ops have one switch that closes a room outright. Only then do
 * the counts decide, and only for a replica room.
 */
export const unitFreeCount = (unit: UnitDetail | undefined): number => {
  if (!unit || unit.status !== "available") return 0
  if (!unit.hasReplicas) return 1
  return Math.max(0, unitCapacity(unit) - (unit.occupiedCount ?? 0))
}

/** One place that knows whether a guest can actually book a unit. */
export const isUnitBookable = (unit: UnitDetail | undefined): boolean =>
  unitFreeCount(unit) > 0

/**
 * A unit's status tag: the status itself — "Available", "Booked", "On notice".
 *
 * A replica room open for booking with every copy taken reads "Fully booked"
 * rather than "Available"; its count goes on its own line, see
 * `selectReplicaAvailability`.
 */
export const selectUnitStatusLabel = (unit: UnitDetail): string => {
  if (unit.hasReplicas && unit.status === "available") {
    return unitFreeCount(unit) > 0 ? "Available" : "Fully booked"
  }
  return unit.status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
}

/**
 * "2/5 Available" — for a replica room only. `undefined` for an ordinary room,
 * which has nothing to count: it is available or it is not.
 */
export const selectReplicaAvailability = (
  unit: UnitDetail
): string | undefined =>
  unit.hasReplicas
    ? `${unitFreeCount(unit)}/${unitCapacity(unit)} Available`
    : undefined

/**
 * "3 of 4 available", "Fully booked".
 *
 * Counted in rooms, not listings: a replica room standing for five beds
 * contributes five to the total and its free count to the open side, so the
 * headline matches what the room cards add up to.
 *
 * There is no "available from" any more: we do not know when an occupied room
 * opens, so `booked`, `on_notice` and `blocked` all read the same way to a
 * guest — not tonight.
 */
export const selectAvailabilityLabel = (property: PropertyDetail): string => {
  const rooms = selectRooms(property)
  if (rooms.length === 0) {
    return isUnitBookable(selectWholeUnit(property))
      ? "Available now"
      : "Fully booked"
  }

  const total = rooms.reduce((sum, room) => sum + unitCapacity(room), 0)
  const open = rooms.reduce((sum, room) => sum + unitFreeCount(room), 0)
  if (open === 0) return "Fully booked"
  return `${open} of ${total} available`
}

/** Whether the whole home can be taken right now. */
export const selectIsWholeHomeFree = (property: PropertyDetail): boolean =>
  isUnitBookable(selectWholeUnit(property))

/** Rooms a guest can actually book today. */
export const selectFreeRooms = (property: PropertyDetail): UnitDetail[] =>
  selectRooms(property).filter(isUnitBookable)

/** "Indiranagar, Bangalore". */
export const selectArea = (property: PropertyDetail): string =>
  `${property.property.neighbourhood}, ${property.property.city}`

export const selectHeroPhoto = (property: PropertyDetail): string | undefined =>
  // `photos` is already hero-first, so position is enough.
  property.photos[0]?.url

// ── the listing card ─────────────────────────────────────────────────────

/** Everything one card renders, and nothing else. */
export type PropertyCardView = {
  slug: string
  src?: string
  area: string
  hook: string
  location: string
  bedType: string
  /** "700 sq ft" — carpet area, from the property row. */
  size: string
  availability: string
  price: string
  /** What `price` is per — "month (per room)", or "month" for a whole home. */
  priceUnit: string
  rating?: string
  /** The starting monthly rate, kept as a number for the filters and sort. */
  monthly: number
  rawRating: number | null
  /**
   * True when nothing on the home is priced yet — a property added ahead of
   * its units, mid-onboarding. `monthly` is 0 in that case, and 0 is not a
   * real rate: showing "₹ 0" would read as free, and letting the price slider
   * hide the card would make it invisible by default rather than merely
   * unpriced. Both are handled by checking this flag instead of the number.
   */
  unpriced: boolean
}

export const toCardView = (property: PropertyDetail): PropertyCardView => {
  const rating = selectRating(property)
  const cheapest = selectCheapestUnit(property)
  const monthly = cheapest?.monthlyRate ?? 0
  const unpriced = monthly === 0

  return {
    slug: property.property.slug,
    src: selectHeroPhoto(property),
    area: property.property.name,
    hook: property.property.hook,
    location: property.property.neighbourhood,
    bedType: selectBedLabel(property),
    size: `${property.property.carpetAreaSqft.toLocaleString("en-IN")} sq ft`,
    availability: selectAvailabilityLabel(property),
    // The card supplies "Starting from" itself, so the price is bare.
    price: unpriced ? "Price coming soon" : formatINR(monthly),
    priceUnit: cheapest?.kind === "entire" ? "month" : "month (per room)",
    rating: rating === null ? undefined : rating.toFixed(1),
    monthly,
    unpriced,
    rawRating: rating,
  }
}

/** How many homes the landing page aims to show. */
export const HOME_PAGE_COUNT = 4

/**
 * The homes the landing page shows.
 *
 * Every home marked `displayOnHome` comes first, all of them. If that is
 * fewer than `HOME_PAGE_COUNT`, the rest is topped up from the other homes —
 * ones with something free to book ahead of fully booked ones — so a sheet
 * that marks one home, or none, still fills the carousel.
 *
 * Homes without a photo are left out: the carousel is photographs, and a
 * blank card there reads as a broken page rather than as "coming soon".
 */
export const selectHomePageProperties = (
  properties: PropertyDetail[]
): PropertyDetail[] => {
  const pictured = properties.filter((p) => selectHeroPhoto(p) !== undefined)
  const featured = pictured.filter((p) => p.property.displayOnHome)
  const open = (p: PropertyDetail) => p.units.some(isUnitBookable)
  const others = pictured
    .filter((p) => !p.property.displayOnHome)
    .sort((a, b) => Number(open(b)) - Number(open(a)))
  return [...featured, ...others.slice(0, Math.max(0, HOME_PAGE_COUNT - featured.length))]
}

// ── filter ranges, derived from what is loaded ───────────────────────────

/** Neighbourhoods actually present, so a filter cannot offer an empty result. */
export const selectLocations = (properties: PropertyDetail[]): string[] =>
  [...new Set(properties.map((p) => p.property.neighbourhood))].sort()

export const selectPriceBounds = (
  properties: PropertyDetail[]
): { min: number; max: number } => {
  const rates = properties.map(selectStartingMonthly).filter((rate) => rate > 0)
  if (rates.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...rates), max: Math.max(...rates) }
}

// ── store selectors ──────────────────────────────────────────────────────

/**
 * Sorted by name so the grid does not reshuffle between loads — object key
 * order is stable in practice but is not a contract worth relying on.
 *
 * Wrapped in `useShallow` because the selector builds a new array every call.
 * Zustand 5 compares with `Object.is`, so without it this re-renders forever.
 * The `PropertyDetail` objects inside are stable references, so a shallow
 * comparison is exactly right.
 */
export const useAllProperties = (): PropertyDetail[] =>
  useCatalogStore(
    useShallow((state) =>
      Object.values(state.properties).sort((a, b) =>
        a.property.name.localeCompare(b.property.name)
      )
    )
  )

/** Returns a stable reference — the stored object itself — so no wrapper needed. */
export const usePropertyBySlug = (
  slug: string | undefined
): PropertyDetail | undefined =>
  useCatalogStore((state) => {
    if (!slug) return undefined
    const id = state.slugIndex[slug]
    return id ? state.properties[id] : undefined
  })

/** Same reason as `useAllProperties` — a fresh object literal every call. */
export const useCatalogStatus = () =>
  useCatalogStore(
    useShallow((state) => ({
      status: state.status,
      error: state.error,
      allLoaded: state.allLoaded,
    }))
  )

export const useIsNotFound = (slug: string | undefined): boolean =>
  useCatalogStore((state) => (slug ? state.notFound.includes(slug) : false))

export const useLoadAllProperties = () =>
  useCatalogStore((state) => state.loadAllProperties)
export const useLoadProperty = () =>
  useCatalogStore((state) => state.loadProperty)
