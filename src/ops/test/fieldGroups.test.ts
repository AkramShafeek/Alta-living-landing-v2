// The form's dividers, held in step with the model.
//
// The risk this guards against is quiet: a column is added to a model, nobody
// updates the group config, and the field stops being editable — with no error,
// no warning, and a form that still looks complete.

import { describe, expect, it } from "vitest"
import type { TableName } from "@/db/config"
import { fieldsOf } from "../fields"
import { FIELD_GROUPS, type FieldGroup } from "../fieldGroups"

describe("FIELD_GROUPS", () => {
  const grouped = Object.entries(FIELD_GROUPS) as unknown as [
    TableName,
    readonly FieldGroup[],
  ][]

  it("names only columns the model actually has", () => {
    for (const [table, groups] of grouped) {
      const real = new Set(fieldsOf(table).map((field) => field.name))

      for (const group of groups) {
        for (const name of group.fields) {
          expect(
            real,
            `${table}.${name} is grouped but not in the model`
          ).toContain(name)
        }
      }
    }
  })

  it("places every field exactly once", () => {
    for (const [table, groups] of grouped) {
      const placed = groups.flatMap((group) => group.fields)
      expect(new Set(placed).size, `${table} groups a field twice`).toBe(
        placed.length
      )
    }
  })

  it("covers the whole model, so nothing falls into Other by accident", () => {
    // Not a hard requirement — an ungrouped field still renders under "Other" —
    // but drifting into that state should be a deliberate choice, not a
    // surprise found later in the UI.
    for (const [table, groups] of grouped) {
      const placed = new Set(groups.flatMap((group) => group.fields))
      const missing = fieldsOf(table)
        .map((field) => field.name)
        .filter((name) => !placed.has(name))

      expect(missing, `${table} has ungrouped columns`).toEqual([])
    }
  })

  it("groups the one table that needs it", () => {
    expect(FIELD_GROUPS.properties).toBeDefined()
    expect(fieldsOf("properties").length).toBeGreaterThan(60)
  })

  it("keeps the long prose columns together", () => {
    const story = FIELD_GROUPS.properties?.find(
      (group) => group.title === "Story"
    )
    expect(story?.fields).toEqual(["hook", "body", "founderNote"])
  })
})
