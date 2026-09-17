import { z } from "zod"
import { zAmenityKey } from "./common"

/**
 * One row of the `propertyAmenities` table — a join between a property and one
 * amenity tag.
 *
 * Was `Property.amenities[]`. Natural key is (propertyId, amenityKey); the key
 * itself is an enum from common.ts, so the sheet column is a dropdown and a
 * typo cannot reach the store.
 */
export const zPropertyAmenity = z.object({
  propertyId: z.string().min(1),
  amenityKey: zAmenityKey,
})

export type PropertyAmenity = z.infer<typeof zPropertyAmenity>
