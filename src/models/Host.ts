import { z } from "zod"

/**
 * One row of the `hosts` table — the person a guest actually deals with.
 *
 * There is exactly one host today and nothing in the UI renders this yet. It is
 * a table rather than a constant anyway, because "one host" is a fact about the
 * current portfolio, not about the domain: the second city means a second host,
 * and discovering that later would mean adding a foreign key to every property
 * row in the sheet retroactively. The column is cheap now and expensive later.
 *
 * `hosts` is deliberately NOT published to the web — `phone` and `whatsapp` are
 * contact details for a real person, and a published tab is world-readable. It
 * stays a fixture until there is somewhere authenticated to put it.
 */
export const zHost = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  photoUrl: z.string().default(""),

  /** Free text, not a duration: "under an hour" promises less than "47 min". */
  respondsWithin: z.string().default(""),
  /** When they are reachable — "8am-10pm". */
  hours: z.string().default(""),
  /** How far the host is from the property, in minutes. */
  minutesAway: z.number().int().nonnegative().optional(),

  /**
   * Pipe-separated in the sheet — "English|Kannada|Hindi".
   *
   * The only column in the catalog whose Zod type does not imply its coercer,
   * so the table registry gives it an explicit `list` override. See the
   * `coerce` escape hatch in db/config.ts, which exists for exactly this.
   */
  languages: z.array(z.string()).default([]),

  phone: z.string().default(""),
  whatsapp: z.string().default(""),
})

export type Host = z.infer<typeof zHost>
