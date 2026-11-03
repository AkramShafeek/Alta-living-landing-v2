// Scoping rows to one home, and the id generation that stops two homes from
// colliding. All plain functions over `{ baseline, edits }`.

import { describe, expect, it } from "vitest"
import type { DraftSlice } from "../draftStore"
import {
  CHILD_TABLES,
  everyRowOf,
  fillMissingIds,
  idsIn,
  missingIdCount,
  newChildId,
  newChildRow,
  newPropertyRow,
  propertyRow,
  scopedRows,
} from "../propertyScope"

const state = (): DraftSlice => ({
  baseline: {
    properties: [
      { id: "prop_001", name: "The Garden Loft" },
      { id: "prop_002", name: "Assagao House" },
    ],
    units: [
      { id: "unit_001a", propertyId: "prop_001", name: "Master bedroom" },
      { id: "unit_002a", propertyId: "prop_002", name: "Sea room" },
      { id: "unit_001x", propertyId: "prop_001", name: "Entire property" },
    ],
    amenities: [
      { propertyId: "prop_001", amenityKey: "lift" },
      { propertyId: "prop_002", amenityKey: "pool" },
    ],
  },
  edits: {},
})

describe("scopedRows", () => {
  it("returns only this home's rows", () => {
    const rows = scopedRows(state(), "units", "prop_001")
    expect(rows.map((entry) => entry.row.id)).toEqual([
      "unit_001a",
      "unit_001x",
    ])
  })

  it("carries the index in the FULL table, which is what the store mutates", () => {
    // unit_001x is second among prop_001's units but third in the table. Using
    // the local position here would edit another home's row.
    const rows = scopedRows(state(), "units", "prop_001")
    expect(rows.map((entry) => entry.index)).toEqual([0, 2])
  })

  it("is empty for a home with none", () => {
    expect(scopedRows(state(), "reviews", "prop_001")).toEqual([])
  })
})

describe("propertyRow", () => {
  it("finds the home and its index", () => {
    expect(propertyRow(state(), "prop_002")).toMatchObject({
      index: 1,
      row: { name: "Assagao House" },
    })
  })

  it("is null for an unknown id", () => {
    expect(propertyRow(state(), "prop_404")).toBeNull()
  })
})

describe("everyRowOf", () => {
  it("gathers the home's own row and all its children", () => {
    const all = everyRowOf(state(), "prop_001")
    expect(all).toHaveLength(4) // 1 property + 2 units + 1 amenity
  })

  it("returns descending indices so a caller can delete without reindexing", () => {
    // Removing ascending would shift every later index by one and delete the
    // wrong rows — the bug this ordering exists to prevent.
    const all = everyRowOf(state(), "prop_001")
    const units = all
      .filter((entry) => entry.table === "units")
      .map((entry) => entry.index)
    expect(units).toEqual([2, 0])
  })

  it("touches nothing belonging to another home", () => {
    const all = everyRowOf(state(), "prop_001")
    const draft = state()
    for (const target of all) {
      const row = draft.baseline[target.table]![target.index]
      expect(row.propertyId ?? row.id).toBe("prop_001")
    }
  })
})

describe("newChildRow", () => {
  it("is blank but already pointed at the home", () => {
    const row = newChildRow("units", "prop_003")
    expect(row.propertyId).toBe("prop_003")
    expect(row.name).toBe("")
  })

  it("carries every column, so the export header stays consistent", () => {
    expect(Object.keys(newChildRow("nearby", "prop_001")).sort()).toEqual(
      ["kind", "minutes", "mode", "name", "propertyId"].sort()
    )
  })
})

describe("id generation", () => {
  it("gives a new home the next free prop_NNN", () => {
    expect(newPropertyRow(state().baseline.properties!).id).toBe("prop_003")
  })

  it("starts at prop_001 in an empty sheet", () => {
    expect(newPropertyRow([]).id).toBe("prop_001")
  })

  it("defaults a new home to draft, so it cannot publish itself", () => {
    expect(newPropertyRow([]).status).toBe("draft")
  })

  it("prefixes child ids with the property id", () => {
    expect(newChildId("units", new Set(), "prop_007")).toBe("prop_007-room-1")
    expect(newChildId("photos", new Set(), "prop_007")).toBe("prop_007-photo-1")
    expect(newChildId("reviews", new Set(), "prop_007")).toBe(
      "prop_007-review-1"
    )
  })

  it("takes the smallest number not already used", () => {
    const taken = new Set(["prop_001-room-1", "prop_001-room-3"])
    expect(newChildId("units", taken, "prop_001")).toBe("prop_001-room-2")
  })

  it("names the whole-home unit once, then falls back to a number", () => {
    expect(newChildId("units", new Set(), "prop_001", "entire")).toBe(
      "prop_001-entire"
    )
    expect(
      newChildId("units", new Set(["prop_001-entire"]), "prop_001", "entire")
    ).toBe("prop_001-room-1")
  })

  it("does not reuse an id already on the table", () => {
    const units = state().baseline.units!
    const id = newChildId("units", idsIn(units), "prop_001")
    expect(units.map((unit) => unit.id)).not.toContain(id)
  })
})

describe("fillMissingIds", () => {
  const withBlanks = (): DraftSlice => ({
    baseline: {
      units: [
        { id: "unit_001a", propertyId: "prop_001" },
        { id: "", propertyId: "prop_001", kind: "room" },
        { id: "", propertyId: "prop_001", kind: "entire" },
        { id: "", propertyId: "prop_002", kind: "room" },
      ],
      photos: [{ id: "", propertyId: "prop_001" }],
    },
    edits: {},
  })

  it("fills only this home's blank ids, and leaves set ones alone", () => {
    const changed = fillMissingIds(withBlanks(), "prop_001")
    expect(changed.units!.map((row) => row.id)).toEqual([
      "unit_001a",
      "prop_001-room-1",
      "prop_001-entire",
      "",
    ])
    expect(changed.photos!.map((row) => row.id)).toEqual(["prop_001-photo-1"])
    expect(changed.reviews).toBeUndefined()
  })

  it("counts what it would fill", () => {
    expect(missingIdCount(withBlanks(), "prop_001")).toBe(3)
    expect(missingIdCount(withBlanks(), "prop_002")).toBe(1)
  })
})

describe("CHILD_TABLES", () => {
  it("covers every property-scoped table and excludes the two that are not", () => {
    expect(CHILD_TABLES).not.toContain("properties")
    expect(CHILD_TABLES).not.toContain("hosts")
    expect(CHILD_TABLES).toHaveLength(9)
  })
})
