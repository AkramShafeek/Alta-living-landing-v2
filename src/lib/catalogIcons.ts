// ─────────────────────────────────────────────────────────────────────────
// Enum value → icon.
//
// Every key in this file comes from a closed enum in models/common.ts, so the
// maps are typed `Record<Key, LucideIcon>` rather than a lookup with a
// fallback. That is the whole design: adding a member to `AMENITY_KEYS` makes
// this file a compile error until someone chooses an icon for it. A partial map
// with a `?? HelpCircle` default would ship the same change silently, and the
// missing icon would first be noticed on a live listing.
//
// The enums are also what makes the sheet's dropdown trustworthy. The dropdown
// is a convenience for whoever is typing; the enforcement is `zPropertyAmenity`
// rejecting anything outside the enum at the db boundary, which is why a value
// can never arrive here without an icon waiting for it.
//
// Icons are decorative. Every place these render, the label renders beside them
// — an icon alone would leave "Dog" and "pet friendly" indistinguishable to a
// screen reader, and several of these (Fence for a balcony, Wind for a dryer)
// only read correctly with the word next to them. Pass `aria-hidden`.
// ─────────────────────────────────────────────────────────────────────────

import {
  ArrowUpDown,
  Armchair,
  BatteryCharging,
  BedDouble,
  Bike,
  Building2,
  Coffee,
  Dog,
  Droplets,
  Dumbbell,
  Fence,
  Flame,
  GlassWater,
  Hospital,
  LampDesk,
  Plane,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Sofa,
  SprayCan,
  SquareParking,
  TrainFront,
  TreeDeciduous,
  Trees,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"

import type { AmenityKey, IncludedKey, NearbyKind } from "@/models/common"

/**
 * One size and one stroke everywhere these appear, so a row of amenities reads
 * as a set rather than as a collection of unrelated marks.
 */
export const CATALOG_ICON_SIZE = 14

export const AMENITY_ICONS: Record<AmenityKey, LucideIcon> = {
  fully_furnished: Sofa,
  work_desk: LampDesk,
  task_chair: Armchair,
  washer: WashingMachine,
  // No tumble-dryer glyph exists; moving air is the closest honest reading, and
  // the label carries the meaning.
  dryer: Wind,
  dishwasher: UtensilsCrossed,
  ro_water: GlassWater,
  power_backup: BatteryCharging,
  covered_parking: SquareParking,
  two_wheeler_parking: Bike,
  // A balcony railing, not a garden fence — it reads as the edge you stand at.
  balcony: Fence,
  courtyard: Trees,
  lift: ArrowUpDown,
  gym: Dumbbell,
  pool: Waves,
  security: ShieldCheck,
  pet_friendly: Dog,
  gst_invoice: ReceiptText,
}

export const INCLUDED_ICONS: Record<IncludedKey, LucideIcon> = {
  electricity: Zap,
  water: Droplets,
  gas: Flame,
  internet: Wifi,
  maintenance: Wrench,
  housekeeping: SprayCan,
  linen: BedDouble,
}

export const NEARBY_ICONS: Record<NearbyKind, LucideIcon> = {
  metro: TrainFront,
  tech_park: Building2,
  airport: Plane,
  cafe_strip: Coffee,
  grocery: ShoppingCart,
  hospital: Hospital,
  gym: Dumbbell,
  park: TreeDeciduous,
}
