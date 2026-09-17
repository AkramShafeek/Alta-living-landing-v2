import { z } from "zod"

/**
 * One row of the `notIncluded` table — the honest half of the "what's in the
 * price" box.
 *
 * Was `Property.notIncluded[]`. Its counterpart, `includedInPrice`, is a pure
 * key join (see Included.ts); this one carries a free-text note, so it is a
 * table of its own rather than a join row.
 */
export const zNotIncluded = z.object({
  propertyId: z.string().min(1),
  item: z.string().min(1),
  note: z.string().default(""),
  order: z.number().int().nonnegative().default(0),
})

export type NotIncluded = z.infer<typeof zNotIncluded>
