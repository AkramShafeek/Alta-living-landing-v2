// ─────────────────────────────────────────────────────────────────────────
// Alta Living — the property content model.
//
// This is the contract the whole data path is built around. Ops maintains the
// records in a Google Sheet (one tab per entity, every cell a string); the
// service layer coerces and validates raw rows against these schemas before
// anything reaches the store.
//
// The rule that shapes every field below: store facts, derive display strings.
// `bedrooms: 2` is stored, "2 BHK" is a selector. Nothing a human would
// hand-write and could let drift out of sync lives here.
// ─────────────────────────────────────────────────────────────────────────

import { z } from "zod"

// ── shared vocabularies ──────────────────────────────────────────────────
// Every enum here is mirrored in the sheet's `enums` tab as a Data Validation
// dropdown, so ops cannot type `availabl` into a status column.

export const CITIES = ["Bangalore", "Goa", "Coorg"] as const
export const PROPERTY_STATUSES = ["draft", "live", "paused", "archived"] as const
export const UNIT_STATUSES = ["available", "booked", "on_notice", "blocked"] as const
export const UNIT_KINDS = ["room", "entire"] as const

/**
 * Amenity tags are deliberately value-free. Anything carrying a number or a
 * cadence (Wi-Fi speed, clean frequency, parking count) is a typed field
 * instead, so it can be filtered and badged rather than only read.
 */
export const AMENITY_KEYS = [
  "fully_furnished",
  "work_desk",
  "task_chair",
  "washer",
  "dryer",
  "dishwasher",
  "ro_water",
  "power_backup",
  "covered_parking",
  "two_wheeler_parking",
  "balcony",
  "courtyard",
  "lift",
  "gym",
  "pool",
  "security",
  "pet_friendly",
  "gst_invoice",
] as const

export const INCLUDED_KEYS = [
  "electricity",
  "water",
  "gas",
  "internet",
  "maintenance",
  "housekeeping",
  "linen",
] as const

export const NEARBY_KINDS = [
  "metro",
  "tech_park",
  "airport",
  "cafe_strip",
  "grocery",
  "hospital",
  "gym",
  "park",
] as const

export const zCity = z.enum(CITIES)
export const zAmenityKey = z.enum(AMENITY_KEYS)
export const zIncludedKey = z.enum(INCLUDED_KEYS)
export const zPermission = z.enum(["allowed", "not_allowed", "on_request"])

// ── leaf entities ────────────────────────────────────────────────────────

export const zNearby = z.object({
  kind: z.enum(NEARBY_KINDS),
  name: z.string().min(1),
  minutes: z.number().int().positive(),
  mode: z.enum(["walk", "drive"]),
})

export const zPhoto = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  /** Required, not optional — WCAG 2.1 AA is a stated product requirement. */
  alt: z.string().min(1),
  /** Editorial, and separate from `alt`: "Courtyard, 4pm". */
  caption: z.string().default(""),
  /** Set when the photo belongs to one room rather than the whole home. */
  unitId: z.string().optional(),
  order: z.number().int().nonnegative(),
  isHero: z.boolean().default(false),
})

export const zHost = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  photoUrl: z.string().optional(),
  respondsWithin: z.string().min(1),
  hours: z.string().min(1),
  minutesAway: z.number().int().nonnegative().optional(),
  languages: z.array(z.string()).default([]),
  // Ops-only — never rendered before a booking exists.
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
})

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
  photoIds: z.array(z.string()).default([]),
  status: z.enum(UNIT_STATUSES),
  /** When a booked unit frees up. Drives "available from 1 Oct". */
  availableFrom: z.date().optional(),
  /** Editorial one-liner for the rooms table. */
  note: z.string().default(""),
})

// ── the property ─────────────────────────────────────────────────────────

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
  nearby: z.array(zNearby).default([]),

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
  kitchen: z.object({
    type: z.enum(["full", "kitchenette", "none"]),
    hob: z.boolean().default(false),
    fridge: z.boolean().default(false),
    microwave: z.boolean().default(false),
    oven: z.boolean().default(false),
    cookware: z.boolean().default(false),
  }),
  laundry: z.enum(["washer_dryer", "washer", "shared", "none"]),
  parking: z.object({
    car: z.number().int().nonnegative().default(0),
    twoWheeler: z.number().int().nonnegative().default(0),
    covered: z.boolean().default(false),
  }),
  floorPlanUrl: z.string().optional(),

  // connectivity, utilities, service — the "no surprises" pillar
  wifi: z.object({
    downMbps: z.number().positive(),
    wired: z.boolean().default(false),
    provider: z.string().optional(),
  }),
  powerBackup: z.enum(["none", "partial", "full"]),
  water: z.object({
    source: z.enum(["corporation", "borewell", "both"]),
    hotWater: z.enum(["geyser", "solar", "none"]),
    drinking: z.enum(["ro", "can", "none"]),
  }),
  includedInPrice: z.array(zIncludedKey).default([]),
  /** The honest half of the same box. */
  notIncluded: z.array(z.object({ item: z.string(), note: z.string().default("") })).default([]),
  housekeeping: z.object({
    cadence: z.enum(["weekly", "fortnightly", "on_demand", "none"]),
    covers: z.array(z.string()).default([]),
  }),
  linenChange: z.enum(["weekly", "fortnightly", "on_request"]),
  gstInvoice: z.boolean().default(false),
  amenities: z.array(zAmenityKey).default([]),

  // house rules & fit
  tenantFit: z.enum(["anyone", "couples_welcome", "family_only", "women_only", "men_only"]),
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
  /**
   * Reserved for what cannot be typed — "1926 house, restored 2021". Anything
   * quantifiable (Wi-Fi speed, desk count) renders from its own field instead.
   */
  highlights: z.array(z.object({ value: z.string(), label: z.string() })).max(3).default([]),

  // relations, resolved by the service layer
  hostId: z.string().min(1),
  host: zHost,
  units: z.array(zUnit).default([]),
  photos: z.array(zPhoto).default([]),
  reviews: z.array(zReview).default([]),
})

export type Nearby = z.infer<typeof zNearby>
export type Photo = z.infer<typeof zPhoto>
export type Host = z.infer<typeof zHost>
export type Review = z.infer<typeof zReview>
export type Unit = z.infer<typeof zUnit>
export type Property = z.infer<typeof zProperty>
export type AmenityKey = (typeof AMENITY_KEYS)[number]
export type IncludedKey = (typeof INCLUDED_KEYS)[number]
export type City = (typeof CITIES)[number]
