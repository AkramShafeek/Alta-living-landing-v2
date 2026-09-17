import { z } from "zod"
import { NEARBY_KINDS } from "./common"

/**
 * One row of the `nearby` table — what a property is close to.
 *
 * Was `Property.nearby[]`. Natural key is (propertyId, name); no surrogate id,
 * because ops types these straight into the sheet and a generated id would be
 * one more column to keep unique by hand.
 */
export const zNearby = z.object({
  propertyId: z.string().min(1),
  kind: z.enum(NEARBY_KINDS),
  name: z.string().min(1),
  minutes: z.number().int().positive(),
  mode: z.enum(["walk", "drive"]),
})

export type Nearby = z.infer<typeof zNearby>
