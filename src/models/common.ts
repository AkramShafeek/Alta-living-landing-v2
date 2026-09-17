import { z } from "zod"

export const PROPERTY_STATUSES = [
  "draft",
  "live",
  "paused",
  "archived",
] as const
export const CITIES = ["Bangalore", "Goa", "Coorg"] as const
export const UNIT_STATUSES = [
  "available",
  "booked",
  "on_notice",
  "blocked",
] as const
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

/**
 * How often a recurring service happens. Listed most frequent to least, with
 * the unscheduled option last, so a selector can rank by index without a
 * lookup table.
 */
export const FREQUENCIES = [
  "daily",
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
  "yearly",
  "on_demand",
] as const

export const zCity = z.enum(CITIES)
export const zAmenityKey = z.enum(AMENITY_KEYS)
export const zIncludedKey = z.enum(INCLUDED_KEYS)
export const zNearbyKind = z.enum(NEARBY_KINDS)
export const zFrequency = z.enum(FREQUENCIES)
export const zPermission = z.enum(["allowed", "not_allowed", "on_request"])

export type City = (typeof CITIES)[number]
export type AmenityKey = (typeof AMENITY_KEYS)[number]
export type IncludedKey = (typeof INCLUDED_KEYS)[number]
export type NearbyKind = (typeof NEARBY_KINDS)[number]
export type Frequency = (typeof FREQUENCIES)[number]
export type Permission = z.infer<typeof zPermission>
