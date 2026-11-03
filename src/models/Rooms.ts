import { z } from "zod"
import { UNIT_KINDS, UNIT_STATUSES } from "./common"

/**
 * One row of the `units` table. Already flat apart from `photoIds`, which is
 * gone: a photo carries its own `unitId`, so the link is maintained from one
 * side only and the service layer walks it in reverse when it joins.
 */
export const zUnit = z
  .object({
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

    /**
     * Several identical rooms listed as one — a dorm's beds, a floor of the
     * same studio. Rendered once with "x/y available" rather than y times.
     *
     * `totalCount` and `occupiedCount` mean nothing unless this is true, and
     * are ignored when it is false. `status` still applies on top: a blocked
     * replica room is blocked whatever its counts say.
     */
    hasReplicas: z.boolean().default(false),
    totalCount: z.number().int().positive().optional(),
    occupiedCount: z.number().int().nonnegative().optional(),
  })
  // Row-level rules: they compare columns, so no single field can carry them.
  // Reported against the column ops would fix, which is also where the ops
  // editor shows them.
  //
  // `when` makes them run even if another column already failed. Zod skips a
  // refinement by default once a row has any error, so a replica room with no
  // rates and no counts showed only the rates — and the counts surfaced one
  // round of fixes later. Safe on a half-valid row: a junk number arrives as
  // NaN, and every comparison below is false for NaN.
  .superRefine(
    (unit, ctx) => {
      if (!unit.hasReplicas) return

      if (unit.kind === "entire") {
        ctx.addIssue({
          code: "custom",
          path: ["hasReplicas"],
          message: "Only a room can have replicas, not the entire home",
        })
      }
      if (unit.totalCount === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["totalCount"],
          message: "Required when hasReplicas is TRUE",
        })
      }
      if (unit.occupiedCount === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["occupiedCount"],
          message: "Required when hasReplicas is TRUE",
        })
      }
      if (
        unit.totalCount !== undefined &&
        unit.occupiedCount !== undefined &&
        unit.occupiedCount > unit.totalCount
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["occupiedCount"],
          message: `Cannot exceed totalCount (${unit.totalCount})`,
        })
      }
    },
    {
      when: (payload) =>
        typeof payload.value === "object" && payload.value !== null,
    }
  )

export type Unit = z.infer<typeof zUnit>
