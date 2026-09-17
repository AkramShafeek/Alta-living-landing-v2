import { z } from "zod"

/**
 * One row of the `highlights` table.
 *
 * Was `Property.highlights[]`. Reserved for what cannot be typed — "1926 house,
 * restored 2021". Anything quantifiable (Wi-Fi speed, desk count) is a column
 * on the property instead.
 *
 * The old schema capped this at three per property with `.max(3)`. A cap across
 * rows is not expressible on a row, so the service layer enforces it when it
 * groups highlights by `propertyId`.
 */
export const zHighlight = z.object({
  propertyId: z.string().min(1),
  value: z.string().min(1),
  label: z.string().min(1),
  /** Display order within the property. Rows in a sheet have no inherent one. */
  order: z.number().int().nonnegative().default(0),
})

export type Highlight = z.infer<typeof zHighlight>

/** What the service layer enforces after grouping. */
export const MAX_HIGHLIGHTS_PER_PROPERTY = 3
