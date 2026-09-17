import { z } from "zod"
import { zIncludedKey } from "./common"

/**
 * One row of the `propertyIncluded` table — a join between a property and one
 * thing the rent covers.
 *
 * Was `Property.includedInPrice[]`. Its counterpart is NotIncluded.ts, which is
 * a table rather than a join because each exclusion carries a free-text note.
 *
 * Natural key is (propertyId, includedKey).
 */
export const zPropertyIncluded = z.object({
  propertyId: z.string().min(1),
  includedKey: zIncludedKey,
})

export type PropertyIncluded = z.infer<typeof zPropertyIncluded>
