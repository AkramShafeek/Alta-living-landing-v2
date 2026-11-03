// Bulk import: nested JSON → the editor's flat rows.
//
// The example document in docs/ is imported here too, so the spec cannot claim
// a shape the importer does not accept.

import { describe, expect, it } from "vitest"
import type { DraftSlice } from "../draftStore"
import { ImportError, parseImportText, planImport } from "../importJson"
import { checkRow } from "../fields"
import { fillMissingIds } from "../propertyScope"
import type { TableName } from "@/db/config"
import example from "../../../docs/examples/bulk-import.example.json"

const empty = (): DraftSlice => ({ baseline: {}, edits: {} })

const existing = (): DraftSlice => ({
  baseline: {
    properties: [
      { id: "prop_001", slug: "garden-loft", name: "The Garden Loft" },
      { id: "prop_002", slug: "sea-house", name: "Sea House" },
    ],
    units: [
      { id: "unit_001a", propertyId: "prop_001", name: "Master" },
      { id: "unit_002a", propertyId: "prop_002", name: "Sea room" },
    ],
    amenities: [{ propertyId: "prop_001", amenityKey: "lift" }],
  },
  edits: {},
})

/** The smallest document the importer accepts: one home, nothing nested. */
const home = (extra: Record<string, unknown> = {}) => ({
  id: "prop_009",
  slug: "new-home",
  name: "New Home",
  ...extra,
})

const problemsOf = (fn: () => unknown): string[] => {
  try {
    fn()
  } catch (error) {
    if (error instanceof ImportError) return error.problems
    throw error
  }
  return []
}

describe("the documented example", () => {
  const doc: unknown = example

  it("imports with nothing wrong but the ids it left blank", () => {
    const plan = planImport(doc, empty())
    expect(plan.homes.map((entry) => entry.id)).toEqual(["prop_101", "prop_102"])
    expect(plan.warnings).toEqual([])

    const columns = Object.entries(plan.tables).flatMap(([table, rows]) =>
      rows!.flatMap((row) => Object.keys(checkRow(table as TableName, row)))
    )
    expect(columns.length).toBe(plan.problemCount)
    expect(new Set(columns)).toEqual(new Set(["id"]))
  })

  it("is fully valid once Fill missing ids has run on each home", () => {
    const plan = planImport(doc, empty())
    let slice: DraftSlice = { baseline: plan.tables, edits: {} }
    for (const { id } of plan.homes) {
      slice = { baseline: { ...slice.baseline, ...fillMissingIds(slice, id) }, edits: {} }
    }

    const problems = Object.entries(slice.baseline).flatMap(([table, rows]) =>
      rows!.map((row) => checkRow(table as TableName, row))
    )
    expect(problems.filter((p) => Object.keys(p).length > 0)).toEqual([])
  })

  it("nests rooms, photos and reviews under the right keys", () => {
    const plan = planImport(doc, empty())
    const units = plan.tables.units!.filter((u) => u.propertyId === "prop_101")
    expect(units.map((u) => u.kind)).toEqual(["room", "room", "entire"])

    // The second room had no id but nested a photo, so it was given one.
    expect(units[1].id).toBe("prop_101-room-2")
    // The entire unit had none and nothing pointed at it: left blank.
    expect(units[2].id).toBe("")
    expect(plan.generatedIds).toBe(1)

    const photos = plan.tables.photos!.filter((p) => p.propertyId === "prop_101")
    // Home photos first, then each room's, numbered in that order.
    expect(photos.map((p) => [p.unitId, p.order])).toEqual([
      ["", "0"],
      ["", "1"],
      ["prop_101-room-1", "2"],
      ["prop_101-room-2", "3"],
    ])
  })
})

describe("cells", () => {
  it("writes JSON values the way the sheet holds them", () => {
    const plan = planImport(
      home({ hasLift: true, wifiWired: false, bedrooms: 3, lat: 12.9 }),
      empty()
    )
    const row = plan.tables.properties![0]
    expect([row.hasLift, row.wifiWired, row.bedrooms, row.lat]).toEqual([
      "TRUE",
      "FALSE",
      "3",
      "12.9",
    ])
  })

  it("gives every row every column, like a row added by hand", () => {
    const plan = planImport(home({ units: [{ name: "Room" }] }), empty())
    expect(Object.keys(plan.tables.units![0])).toContain("hasReplicas")
    expect(plan.tables.units![0].kind).toBe("room")
  })

  it("leaves a blank id blank when nothing points at it", () => {
    const plan = planImport(
      home({ units: [{ name: "Room" }], reviews: [{ authorFirstName: "A" }] }),
      empty()
    )
    expect(plan.tables.units![0].id).toBe("")
    expect(plan.tables.reviews![0].id).toBe("")
    expect(plan.generatedIds).toBe(0)
  })

  it("reports unknown keys rather than importing them", () => {
    const plan = planImport(home({ colour: "blue" }), empty())
    expect(plan.warnings).toEqual([
      expect.stringMatching(/colour ignored/),
    ])
  })

  it("turns key lists into join rows, once each", () => {
    const plan = planImport(
      home({ amenities: ["lift", "washer", "lift"] }),
      empty()
    )
    expect(plan.tables.amenities!.map((row) => row.amenityKey)).toEqual([
      "lift",
      "washer",
    ])
  })

  it("counts what the site would reject, without refusing it", () => {
    const plan = planImport(home({ city: "Mumbai" }), empty())
    expect(plan.problemCount).toBeGreaterThan(0)
  })
})

describe("against an existing draft", () => {
  it("appends a new home and keeps everything else", () => {
    const plan = planImport(home(), existing())
    expect(plan.tables.properties!.map((row) => row.id)).toEqual([
      "prop_001",
      "prop_002",
      "prop_009",
    ])
    expect(plan.homes[0].replaced).toBe(false)
  })

  it("replaces a home with the same id across every tab", () => {
    const plan = planImport(
      { id: "prop_001", slug: "garden-loft", name: "Loft v2", units: [{ name: "New room" }] },
      existing()
    )
    expect(plan.homes[0].replaced).toBe(true)
    expect(plan.tables.properties!.map((row) => row.name)).toEqual([
      "Sea House",
      "Loft v2",
    ])
    expect(plan.tables.units!.map((row) => row.name)).toEqual([
      "Sea room",
      "New room",
    ])
    // Its old amenity row is gone even though the document lists none.
    expect(plan.tables.amenities).toEqual([])
  })
})

describe("refusals — nothing changes", () => {
  it("needs an id on every home", () => {
    expect(problemsOf(() => planImport({ name: "x" }, empty()))).toEqual([
      expect.stringMatching(/Expected/),
    ])
    expect(
      problemsOf(() => planImport({ properties: [{ name: "x" }] }, empty()))
    ).toEqual([expect.stringMatching(/needs an id/)])
  })

  it("rejects an id already used by another home's row", () => {
    const problems = problemsOf(() =>
      planImport(home({ units: [{ id: "unit_002a" }] }), existing())
    )
    expect(problems).toEqual([expect.stringMatching(/unit_002a.*already in use/)])
  })

  it("rejects a slug another home already has", () => {
    const problems = problemsOf(() =>
      planImport(home({ slug: "sea-house" }), existing())
    )
    expect(problems).toEqual([expect.stringMatching(/sea-house.*prop_002/)])
  })

  it("rejects the same home twice", () => {
    const problems = problemsOf(() =>
      planImport({ properties: [home(), home()] }, empty())
    )
    expect(problems).toEqual([expect.stringMatching(/appears twice/)])
  })

  it("reports every problem, not just the first", () => {
    const problems = problemsOf(() =>
      planImport(
        { properties: [{ name: "no id" }, home({ units: "nope", photos: [3] })] },
        empty()
      )
    )
    expect(problems).toHaveLength(3)
  })

  it("explains a syntax error", () => {
    expect(problemsOf(() => parseImportText("{ nope"))).toEqual([
      expect.stringMatching(/Not valid JSON/),
    ])
  })
})
