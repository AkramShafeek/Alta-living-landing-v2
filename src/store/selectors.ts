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
 */
export const selectWholeUnit = (
  property: PropertyDetail
): UnitDetail | undefined =>
  property.units.find((unit) => unit.kind === "entire")

export const selectRooms = (property: PropertyDetail): UnitDetail[] =>
  property.units.filter((unit) => unit.kind === "room")

export const selectNightly = (property: PropertyDetail): number =>
  selectWholeUnit(property)?.nightlyRate ?? 0

export const selectMonthly = (property: PropertyDetail): number =>
  selectWholeUnit(property)?.monthlyRate ?? 0

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

/** One place that knows which statuses a guest can actually book. */
const isFree = (unit: UnitDetail | undefined): boolean =>
  unit?.status === "available"

/**
 * "3 of 4 available", "Fully booked".
 *
 * `status === "available"` is the whole test. There is no "available from" any
 * more: we do not know when an occupied room opens, so `booked`, `on_notice`
 * and `blocked` all read the same way to a guest — not tonight.
 */
export const selectAvailabilityLabel = (property: PropertyDetail): string => {
  const rooms = selectRooms(property)
  if (rooms.length === 0) {
    return isFree(selectWholeUnit(property)) ? "Available now" : "Fully booked"
  }

  const open = rooms.filter(isFree).length
  if (open === 0) return "Fully booked"
  return `${open} of ${rooms.length} available`
}

/** Whether the whole home can be taken right now. */
export const selectIsWholeHomeFree = (property: PropertyDetail): boolean =>
  isFree(selectWholeUnit(property))

/** Rooms a guest can actually book today. */
export const selectFreeRooms = (property: PropertyDetail): UnitDetail[] =>
  selectRooms(property).filter(isFree)

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
  availability: string
  price: string
  priceUnit: string
  rating?: string
  /** Kept as numbers so the listings filters can compare them. */
  nightly: number
  rawRating: number | null
}

export const toCardView = (property: PropertyDetail): PropertyCardView => {
  const rating = selectRating(property)
  const nightly = selectNightly(property)

  return {
    slug: property.property.slug,
    src: selectHeroPhoto(property),
    area: property.property.name,
    hook: property.property.hook,
    location: property.property.neighbourhood,
    bedType: selectBedLabel(property),
    availability: selectAvailabilityLabel(property),
    price: formatINR(nightly),
    priceUnit: "per night",
    rating: rating === null ? undefined : rating.toFixed(1),
    nightly,
    rawRating: rating,
  }
}

// ── filter ranges, derived from what is loaded ───────────────────────────

/** Neighbourhoods actually present, so a filter cannot offer an empty result. */
export const selectLocations = (properties: PropertyDetail[]): string[] =>
  [...new Set(properties.map((p) => p.property.neighbourhood))].sort()

export const selectPriceBounds = (
  properties: PropertyDetail[]
): { min: number; max: number } => {
  const rates = properties.map(selectNightly).filter((rate) => rate > 0)
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
