import { z } from "zod"
import { PROPERTY_STATUSES, zCity, zPermission } from "./common"

/**
 * One row of the `properties` table.
 *
 * Atomic columns only — no nested objects, no arrays. What used to be a nested
 * object (`kitchen`, `parking`, `wifi`, `water`) is a prefixed scalar, because
 * it is 1:1 with the property and a row can hold it directly. What used to be
 * an array lives in its own table keyed by `propertyId`:
 *
 *   nearby              → Nearby.ts
 *   amenities           → Amenity.ts
 *   includedInPrice     → Included.ts
 *   housekeeping.covers → Housekeeping.ts
 *   notIncluded         → NotIncluded.ts
 *   highlights          → Highlight.ts
 *   units / photos / reviews → Rooms.ts / Photo.ts / Review.ts
 *
 * The nested, joined shape the UI reads is assembled by the service layer and
 * held in the store. It is deliberately not this type.
 */
export const zProperty = z.object({
  // identity
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(PROPERTY_STATUSES),
  listedOn: z.date().optional(),
  vettedOn: z.date().optional(),
  vettedBy: z.string().optional(),

  // location
  city: zCity,
  neighbourhood: z.string().min(1),
  subLocality: z.string().default(""),
  addressLine: z.string().optional(), // ops-only
  pincode: z.string().optional(), // ops-only
  lat: z.number().optional(),
  lng: z.number().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  hasLift: z.boolean().default(false),

  // the space
  propertyType: z.enum(["apartment", "independent_house", "villa", "studio"]),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  balconies: z.number().int().nonnegative().default(0),
  carpetAreaSqft: z.number().positive(),
  furnishing: z.enum(["fully", "semi"]),
  maxOccupancy: z.number().int().positive(),
  deskCount: z.number().int().nonnegative().default(0),
  taskChairCount: z.number().int().nonnegative().default(0),
  acRooms: z.enum(["all", "bedrooms_only", "living_only", "none"]),

  // kitchen — 1:1, so columns rather than a table
  kitchenType: z.enum(["full", "kitchenette", "none"]),
  kitchenHob: z.boolean().default(false),
  kitchenFridge: z.boolean().default(false),
  kitchenMicrowave: z.boolean().default(false),
  kitchenOven: z.boolean().default(false),
  kitchenCookware: z.boolean().default(false),

  laundry: z.enum(["washer_dryer", "washer", "shared", "none"]),

  // parking — 1:1
  parkingCar: z.number().int().nonnegative().default(0),
  parkingTwoWheeler: z.number().int().nonnegative().default(0),
  parkingCovered: z.boolean().default(false),

  floorPlanUrl: z.string().optional(),

  // connectivity, utilities, service — the "no surprises" pillar
  wifiDownMbps: z.number().positive(),
  wifiWired: z.boolean().default(false),
  wifiProvider: z.string().optional(),

  powerBackup: z.enum(["none", "partial", "full"]),

  waterSource: z.enum(["corporation", "borewell", "both"]),
  waterHotWater: z.enum(["geyser", "solar", "none"]),
  waterDrinking: z.enum(["ro", "can", "none"]),

  /** The cadence is 1:1; what a clean covers is 1:N — see Housekeeping.ts. */
  housekeepingCadence: z.enum(["weekly", "fortnightly", "on_demand", "none"]),
  linenChange: z.enum(["weekly", "fortnightly", "on_request"]),
  gstInvoice: z.boolean().default(false),

  // house rules & fit
  tenantFit: z.enum([
    "anyone",
    "couples_welcome",
    "family_only",
    "women_only",
    "men_only",
  ]),
  smoking: zPermission,
  alcohol: zPermission,
  pets: zPermission,
  overnightGuests: z.enum(["allowed", "on_request", "not_allowed"]),
  partyPolicy: z.enum(["no_parties", "ok_with_notice"]),
  kycRequired: z.boolean().default(true),
  agreementType: z.enum(["rental_agreement", "license", "none"]),
  /** Only meaningful for per-room stays; unset when the whole home is taken. */
  sharedWith: z.string().optional(),

  // commercials (the rates themselves live on units)
  currency: z.literal("INR").default("INR"),
  minStayNights: z.number().int().positive(),
  noticePeriodDays: z.number().int().nonnegative().default(0),
  lockInMonths: z.number().int().nonnegative().default(0),

  // story — hand-written, and deliberately not structured
  hook: z.string().min(1).max(140),
  body: z.string().min(1),
  founderNote: z.string().default(""),

  // placement
  /**
   * Whether this home is featured on the landing page.
   *
   * Defaults to false, so a property is on the home page only because someone
   * said so. The opposite default would put every new listing in front of the
   * first thing a visitor sees, which is the wrong way for this to fail.
   *
   * Distinct from `status`: `status` says whether the home is public at all,
   * this says whether it is promoted. A draft home is not on the home page
   * regardless of this flag, because it is not anywhere.
   */
  displayOnHome: z.boolean().default(false),

  // foreign keys
  /**
   * The host responsible for this home.
   *
   * Required, though every row points at the same host today — see Host.ts for
   * why this is a relation rather than a constant. Nothing renders it yet.
   */
  hostId: z.string().min(1),
})

export type Property = z.infer<typeof zProperty>
