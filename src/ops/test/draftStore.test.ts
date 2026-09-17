// The draft's derived reads — the part that decides what ops sees marked.
//
// Plain functions over `{ baseline, edits }`, so nothing here needs React,
// zustand or a browser.

import { describe, expect, it } from "vitest"
import {
  allRows,
  draftedPropertyIds,
  editedRows,
  editedTables,
  isTableEdited,
  rowsOf,
  type DraftSlice,
} from "../draftStore"

const base = (): DraftSlice => ({
  baseline: {
    properties: [
      { id: "prop_001", name: "The Garden Loft", status: "live" },
      { id: "prop_002", name: "Assagao House", status: "live" },
    ],
    units: [
      { id: "unit_a", propertyId: "prop_001", monthlyRate: "18,000" },
      { id: "unit_b", propertyId: "prop_002", monthlyRate: "22,000" },
    ],
  },
  edits: {},
})

describe("rowsOf", () => {
  it("shows the sheet where nothing is drafted", () => {
    expect(rowsOf(base(), "properties")).toHaveLength(2)
  })

  it("prefers the draft once there is one", () => {
    const state = base()
    state.edits.properties = [{ id: "prop_001", name: "Renamed" }]
    expect(rowsOf(state, "properties")).toEqual([
      { id: "prop_001", name: "Renamed" },
    ])
  })

  it("is empty for a table that was never loaded", () => {
    expect(rowsOf({ baseline: {}, edits: {} }, "reviews")).toEqual([])
  })
})

describe("isTableEdited", () => {
  it("is false when the draft matches the sheet", () => {
    // Touching a cell and typing the original value back is not an edit — the
    // indicator is computed, not tracked, so it cannot get stuck on.
    const state = base()
    state.edits.properties = structuredClone(state.baseline.properties)
    expect(isTableEdited(state, "properties")).toBe(false)
  })

  it("is false for a table with no draft at all", () => {
    expect(isTableEdited(base(), "units")).toBe(false)
  })

  it("notices a changed cell", () => {
    const state = base()
    state.edits.properties = structuredClone(state.baseline.properties)!
    state.edits.properties[0].name = "The Garden Loft "
    expect(isTableEdited(state, "properties")).toBe(true)
  })

  it("notices an added or removed row", () => {
    const added = base()
    added.edits.units = [
      ...structuredClone(added.baseline.units)!,
      { id: "unit_c" },
    ]
    expect(isTableEdited(added, "units")).toBe(true)

    const removed = base()
    removed.edits.units = [structuredClone(removed.baseline.units)![0]]
    expect(isTableEdited(removed, "units")).toBe(true)
  })

  it("treats a missing key and an empty cell as the same thing", () => {
    // The sheet cannot tell them apart either — see db/parse.ts.
    const state = base()
    state.edits.properties = [
      { id: "prop_001", name: "The Garden Loft", status: "live", note: "" },
      { id: "prop_002", name: "Assagao House", status: "live" },
    ]
    expect(isTableEdited(state, "properties")).toBe(false)
  })
})

describe("editedRows", () => {
  it("names only the rows that actually moved", () => {
    const state = base()
    state.edits.units = structuredClone(state.baseline.units)!
    state.edits.units[1].monthlyRate = "23,000"

    expect([...editedRows(state, "units")]).toEqual([1])
  })

  it("is empty with no draft", () => {
    expect(editedRows(base(), "units").size).toBe(0)
  })
})

describe("draftedPropertyIds", () => {
  it("marks a home whose own row changed", () => {
    const state = base()
    state.edits.properties = structuredClone(state.baseline.properties)!
    state.edits.properties[0].name = "New name"

    expect([...draftedPropertyIds(state)]).toEqual(["prop_001"])
  })

  it("marks a home whose child row changed, which is the easy one to forget", () => {
    // Nothing on the property row moved — only a rate on one of its units.
    const state = base()
    state.edits.units = structuredClone(state.baseline.units)!
    state.edits.units[1].monthlyRate = "25,000"

    expect([...draftedPropertyIds(state)]).toEqual(["prop_002"])
  })

  it("marks both sides when a child row is repointed at another home", () => {
    const state = base()
    state.edits.units = structuredClone(state.baseline.units)!
    state.edits.units[0].propertyId = "prop_002"

    expect([...draftedPropertyIds(state)].sort()).toEqual([
      "prop_001",
      "prop_002",
    ])
  })

  it("is empty when nothing is drafted", () => {
    expect(draftedPropertyIds(base()).size).toBe(0)
  })
})

describe("editedTables / allRows", () => {
  it("lists only the tables with changes", () => {
    const state = base()
    state.edits.units = structuredClone(state.baseline.units)!
    state.edits.units[0].monthlyRate = "19,000"

    expect(editedTables(state)).toEqual(["units"])
  })

  it("hands the export every table, drafted where drafted", () => {
    const state = base()
    state.edits.units = [{ id: "unit_a" }]

    const rows = allRows(state)
    expect(rows.units).toEqual([{ id: "unit_a" }])
    expect(rows.properties).toHaveLength(2)
    // A table nobody has loaded still gets an entry, so the archive is complete.
    expect(rows.reviews).toEqual([])
  })
})
