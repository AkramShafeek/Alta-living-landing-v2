import { z } from "zod"

/**
 * One row of the `photos` table.
 *
 * `propertyId` is required and `unitId` is not: every photo belongs to a home,
 * and only some of them narrow to a single room. This is also the only link
 * between photos and units — `Unit` does not carry a `photoIds` array.
 */
export const zPhoto = z.object({
  id: z.string().min(1),
  propertyId: z.string().min(1),
  url: z.string().min(1),
  /** Required, not optional — WCAG 2.1 AA is a stated product requirement. */
  alt: z.string().min(1),
  /** Editorial, and separate from `alt`: "Courtyard, 4pm". */
  caption: z.string().default(""),
  /** Set when the photo belongs to one room rather than the whole home. */
  unitId: z.string().optional(),
  category: z.string().default("All Photos"),
  order: z.number().int().nonnegative(),
  isHero: z.boolean().default(false),
})

export type Photo = z.infer<typeof zPhoto>
