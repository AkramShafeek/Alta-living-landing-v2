// ─────────────────────────────────────────────────────────────────────────
// What each part of a home looks like in the editor.
//
// One config entry per child table rather than nine bespoke screens. The
// differences between them are genuinely small — a title, which columns read as
// a summary, and whether the table is a join — so encoding those differences as
// data keeps the component that renders them a single thing to maintain.
//
// `toggle` is the one real shape difference. `amenities` and `included` carry
// nothing but a foreign key and an enum value, so a row is either there or it
// is not: a grid of on/off chips is the honest control, and it removes the
// possibility of a duplicate or a typo entirely.
// ─────────────────────────────────────────────────────────────────────────

import type { Row } from "@/db/types"
import {
  newPhotoId,
  newReviewId,
  newUnitId,
  type ChildTable,
} from "./propertyScope"

export type SectionSpec = {
  table: ChildTable
  title: string
  blurb: string
  /** Columns that identify a row at a glance, before it is opened. */
  summary: string[]
  /** Join tables: the enum column to render as an on/off grid. */
  toggle?: string
  /** Tables with an `id`, which needs to be unique and is easy to fumble. */
  makeId?: (rows: Row[], propertyId: string) => string
  addLabel: string
  /** Shown instead of the list when there is nothing yet. */
  empty: string
}

export const SECTIONS: SectionSpec[] = [
  {
    table: "units",
    title: "Rooms & whole home",
    blurb:
      "One row per bookable thing. A home has many rooms and exactly one entire-property row, priced directly.",
    summary: ["name", "kind", "monthlyRate", "status"],
    makeId: newUnitId,
    addLabel: "Add unit",
    empty:
      "No units yet. A home needs at least the entire-property row to be bookable.",
  },
  {
    table: "photos",
    title: "Photos",
    blurb:
      "The image files themselves are managed outside this editor — this is the caption, the alt text and the ordering.",
    summary: ["category", "caption", "url", "isHero"],
    makeId: newPhotoId,
    addLabel: "Add photo",
    empty: "No photos yet.",
  },
  {
    table: "amenities",
    title: "Amenities",
    blurb:
      "Value-free tags. Anything with a number or a cadence is a field on the home instead.",
    summary: ["amenityKey"],
    toggle: "amenityKey",
    addLabel: "Add amenity",
    empty: "No amenities tagged.",
  },
  {
    table: "included",
    title: "Included in the price",
    blurb: "What the rent covers.",
    summary: ["includedKey"],
    toggle: "includedKey",
    addLabel: "Add",
    empty: "Nothing marked as included.",
  },
  {
    table: "notIncluded",
    title: "Not included",
    blurb:
      "The honest half. Each exclusion carries a note, so this is free text rather than a tag.",
    summary: ["item", "note"],
    addLabel: "Add exclusion",
    empty: "Nothing marked as excluded.",
  },
  {
    table: "housekeeping",
    title: "Housekeeping",
    blurb: "What gets cleaned, each at its own cadence.",
    summary: ["cover", "frequency"],
    addLabel: "Add task",
    empty: "No housekeeping tasks.",
  },
  {
    table: "nearby",
    title: "Nearby",
    blurb: "Walking and driving times to the places a guest will actually go.",
    summary: ["name", "kind", "minutes", "mode"],
    addLabel: "Add place",
    empty: "Nothing nearby listed.",
  },
  {
    table: "highlights",
    title: "Highlights",
    blurb:
      'Reserved for what cannot be typed — "1926 house, restored 2021". Three at most.',
    summary: ["value", "label"],
    addLabel: "Add highlight",
    empty: "No highlights.",
  },
  {
    table: "reviews",
    title: "Reviews",
    blurb:
      "Real stays only. Below three reviews the site shows no rating at all.",
    summary: ["authorFirstName", "rating", "stayMonth"],
    makeId: newReviewId,
    addLabel: "Add review",
    empty: "No reviews yet.",
  },
]

/** Columns the editor fills in itself, so they are shown read-only. */
export const MANAGED_COLUMNS = new Set(["propertyId"])
