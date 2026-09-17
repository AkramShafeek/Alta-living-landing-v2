import { z } from "zod"
import { zFrequency } from "./common"

/**
 * One row of the `housekeeping` table — one cleaning service, at its own
 * cadence.
 *
 * Was `Property.housekeeping.covers[]`, a bare list of strings under a single
 * property-wide cadence. That could not say what is actually true of a home:
 * floors get swept weekly, the fridge gets cleaned out monthly, windows twice
 * a year. Frequency belongs to the task, not to the property.
 *
 * Natural key is (propertyId, cover).
 */
export const zHousekeeping = z.object({
  propertyId: z.string().min(1),
  /** What gets cleaned — "bathrooms", "kitchen", "floors". */
  cover: z.string().min(1),
  frequency: zFrequency,
})

export type Housekeeping = z.infer<typeof zHousekeeping>
