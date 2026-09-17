// ─────────────────────────────────────────────────────────────────────────
// Where the dividers go in a long form.
//
// Only `properties` needs this — 66 fields is past the point where a flat grid
// is readable, and someone filling one in is thinking in chunks: where it is,
// how big it is, what the kitchen has, what the rules are. The groups mirror
// the section comments in models/Property.ts, so the form reads in the same
// order and with the same headings as the model it is editing.
//
// These are dividers, not sub-forms. One panel, one scroll, a hairline and a
// label between chunks — enough for the eye to find its place, not enough to
// make someone feel they are filling in eleven separate things.
//
// Anything absent from every group still renders, under "Other". A column added
// to a model must never silently vanish from the editor just because nobody
// updated this file — see the test that holds the two in step.
// ─────────────────────────────────────────────────────────────────────────

import type { TableName } from "@/db/config"

export type FieldGroup = {
  title: string
  fields: readonly string[]
}

export const FIELD_GROUPS: Partial<Record<TableName, readonly FieldGroup[]>> = {
  properties: [
    {
      title: "Identity",
      fields: [
        "id",
        "slug",
        "name",
        "status",
        "listedOn",
        "vettedOn",
        "vettedBy",
      ],
    },
    {
      title: "Location",
      fields: [
        "city",
        "neighbourhood",
        "subLocality",
        "addressLine",
        "pincode",
        "lat",
        "lng",
        "floor",
        "totalFloors",
        "hasLift",
      ],
    },
    {
      title: "The space",
      fields: [
        "propertyType",
        "bedrooms",
        "bathrooms",
        "balconies",
        "carpetAreaSqft",
        "furnishing",
        "maxOccupancy",
        "deskCount",
        "taskChairCount",
        "acRooms",
        "floorPlanUrl",
      ],
    },
    {
      title: "Kitchen",
      fields: [
        "kitchenType",
        "kitchenHob",
        "kitchenFridge",
        "kitchenMicrowave",
        "kitchenOven",
        "kitchenCookware",
      ],
    },
    {
      title: "Laundry & parking",
      fields: ["laundry", "parkingCar", "parkingTwoWheeler", "parkingCovered"],
    },
    {
      title: "Connectivity & utilities",
      fields: [
        "wifiDownMbps",
        "wifiWired",
        "wifiProvider",
        "powerBackup",
        "waterSource",
        "waterHotWater",
        "waterDrinking",
      ],
    },
    {
      title: "Service",
      fields: ["housekeepingCadence", "linenChange", "gstInvoice"],
    },
    {
      title: "House rules & fit",
      fields: [
        "tenantFit",
        "smoking",
        "alcohol",
        "pets",
        "overnightGuests",
        "partyPolicy",
        "kycRequired",
        "agreementType",
        "sharedWith",
      ],
    },
    {
      title: "Commercials",
      fields: ["currency", "minStayNights", "noticePeriodDays", "lockInMonths"],
    },
    {
      // Long prose, kept together and last-but-one so the form ends on writing
      // rather than on another wall of dropdowns.
      title: "Story",
      fields: ["hook", "body", "founderNote"],
    },
    {
      title: "Placement & links",
      fields: ["displayOnHome", "hostId"],
    },
  ],
}

/** What unlisted fields are gathered under, so nothing can go missing. */
export const OTHER_GROUP = "Other"
