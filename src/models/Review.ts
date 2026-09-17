import { z } from "zod"

/** One row of the `reviews` table. Already flat — no change was needed. */
export const zReview = z.object({
  id: z.string().min(1),
  propertyId: z.string().min(1),
  unitId: z.string().optional(),
  authorFirstName: z.string().min(1),
  authorCity: z.string().optional(),
  /** "Mar 2025" — when the stay happened, which persuades more than a bare star. */
  stayMonth: z.string().optional(),
  stayDurationNights: z.number().int().positive().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
  source: z.enum(["direct", "google", "whatsapp"]),
  /** True only where Alta hosted the stay. */
  verified: z.boolean().default(false),
})

export type Review = z.infer<typeof zReview>
