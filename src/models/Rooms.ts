import { z } from "zod"
import { UNIT_KINDS, UNIT_STATUSES } from "./common"

/**
 * One row of the `units` table. Already flat apart from `photoIds`, which is
 * gone: a photo carries its own `unitId`, so the link is maintained from one
 * side only and the service layer walks it in reverse when it joins.
 */
export const zUnit = z.object({
  id: z.string().min(1),
  propertyId: z.string().min(1),
  /**
   * A property has many `room` units and exactly one `entire` unit. The
   * `entire` unit is priced directly rather than as a discount off the rooms,
   * so the pricing engine never needs a "maximum discount" rule.
   */
  kind: z.enum(UNIT_KINDS),
  name: z.string().min(1),
  bedType: z.enum(["king", "queen", "double", "single", "bunk"]).optional(),
  bathroom: z.enum(["ensuite", "shared"]).optional(),
  hasDesk: z.boolean().default(false),
  hasAc: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  areaSqft: z.number().positive().optional(),
  maxOccupancy: z.number().int().positive(),
  monthlyRate: z.number().nonnegative(),
  nightlyRate: z.number().nonnegative(),
  deposit: z.number().nonnegative().default(0),
  /**
   * The one source of truth for whether a unit can be taken.
   *
   * There is deliberately no companion date. We do not know when an occupied
   * room will open — that is the host's to update when it does — and a stale
   * "available from 1 Oct" reads as a promise we cannot keep. `on_notice` says
   * "leaving, not yet bookable" without naming a day.
   */
  status: z.enum(UNIT_STATUSES),
  /** Editorial one-liner for the rooms table. */
  note: z.string().default(""),
})

export type Unit = z.infer<typeof zUnit>
