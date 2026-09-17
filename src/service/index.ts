// ─────────────────────────────────────────────────────────────────────────
// Service wiring.
//
// The one place the service meets concrete repositories. Everything above
// imports `propertyService`; swapping the data source is a change here.
// ─────────────────────────────────────────────────────────────────────────

import {
  amenityRepository,
  highlightRepository,
  hostRepository,
  housekeepingRepository,
  includedRepository,
  nearbyRepository,
  notIncludedRepository,
  photoRepository,
  propertyRepository,
  reviewRepository,
  unitRepository,
} from "@/repositories"
import { PropertyService } from "./propertyService"

export const propertyService = new PropertyService({
  properties: propertyRepository,
  units: unitRepository,
  photos: photoRepository,
  reviews: reviewRepository,
  nearby: nearbyRepository,
  amenities: amenityRepository,
  included: includedRepository,
  notIncluded: notIncludedRepository,
  housekeeping: housekeepingRepository,
  highlights: highlightRepository,
  hosts: hostRepository,
})

export { PropertyService, PropertyNotFoundError } from "./propertyService"
export type { PropertyRepositories, PropertyQuery } from "./propertyService"
export { buildProperty, PropertyBuilder } from "./propertyBuilder"
export { buildUnitDetail, buildUnitDetails } from "./unitBuilder"
