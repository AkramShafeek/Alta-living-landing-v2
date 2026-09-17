import { describe, expect, it } from "vitest"
import {
  blankRow,
  checkCell,
  checkRow,
  fieldFor,
  fieldsOf,
  rowLabel,
} from "../fields"
import { z } from "zod"

describe("fieldFor", () => {
  it("turns a model enum into a closed list of options", () => {
    // The point of the whole file: where the right answers are enumerable, ops
    // picks from them instead of typing one.
    const city = fieldFor("city", z.enum(["Bangalore", "Goa", "Coorg"]))
    expect(city.kind).toBe("enum")
    expect(city.options).toEqual(["Bangalore", "Goa", "Coorg"])
  })

  it("treats a literal as an enum of one", () => {
    const currency = fieldFor("currency", z.literal("INR").default("INR"))
    expect(currency).toMatchObject({ kind: "enum", options: ["INR"] })
  })

  it("sees through optional and default wrappers to the real control", () => {
    expect(fieldFor("a", z.number().optional()).kind).toBe("number")
    expect(fieldFor("b", z.boolean().default(false)).kind).toBe("boolean")
    expect(fieldFor("c", z.date().optional()).kind).toBe("date")
    expect(fieldFor("d", z.array(z.string()).default([])).kind).toBe("list")
  })

  it("derives required from the schema rather than a declaration", () => {
    expect(fieldFor("a", z.string().min(1)).required).toBe(true)
    expect(fieldFor("b", z.string().optional()).required).toBe(false)
    // A default means a blank cell is legal — the schema fills it in.
    expect(fieldFor("c", z.boolean().default(false)).required).toBe(false)
  })

  it("gives long prose a textarea", () => {
    expect(fieldFor("body", z.string()).kind).toBe("paragraph")
    expect(fieldFor("slug", z.string()).kind).toBe("text")
  })
})

describe("fieldsOf", () => {
  it("covers every column of the real model, in the sheet's order", () => {
    const fields = fieldsOf("properties")
    const names = fields.map((field) => field.name)

    expect(names[0]).toBe("id")
    expect(names).toContain("displayOnHome")
    expect(names).toContain("hostId")
    expect(fields.length).toBeGreaterThan(60)
  })

  it("maps the amenity enum so a typo is not possible", () => {
    const amenityKey = fieldsOf("amenities").find(
      (field) => field.name === "amenityKey"
    )
    expect(amenityKey?.options).toContain("courtyard")
    expect(amenityKey?.options).toHaveLength(18)
  })

  it("marks the one array column as a pipe-separated list", () => {
    const languages = fieldsOf("hosts").find(
      (field) => field.name === "languages"
    )
    expect(languages?.kind).toBe("list")
  })
})

describe("checkCell", () => {
  it("accepts what the sheet actually produces", () => {
    expect(checkCell("units", "monthlyRate", "18,000")).toBeNull()
    expect(checkCell("properties", "listedOn", "14/03/2021")).toBeNull()
    expect(checkCell("properties", "hasLift", "TRUE")).toBeNull()
  })

  it("rejects a value outside a model enum, with the model's own message", () => {
    expect(checkCell("properties", "city", "Mumbai")).toMatch(/Mumbai|option/i)
    expect(checkCell("properties", "city", "Bangalore")).toBeNull()
  })

  it("rejects junk in a number column rather than reading it as zero", () => {
    expect(checkCell("properties", "bedrooms", "about three")).toMatch(
      /NaN|number/i
    )
  })

  it("distinguishes a required blank from an optional one", () => {
    expect(checkCell("properties", "name", "")).not.toBeNull()
    expect(checkCell("properties", "vettedBy", "")).toBeNull()
  })

  it("ignores a column the model does not declare", () => {
    expect(checkCell("properties", "opsScratch", "anything")).toBeNull()
  })

  it("uses the registry's coerce override, not the one derived from the type", () => {
    // `hosts.languages` is a pipe-separated string in the sheet and an array in
    // the model. Deriving the coercer from the Zod type hands a string to an
    // array schema, and the editor condemns a cell the site reads fine.
    expect(checkCell("hosts", "languages", "English|Kannada|Hindi")).toBeNull()
    expect(checkCell("hosts", "languages", "English")).toBeNull()
    expect(checkCell("hosts", "languages", "")).toBeNull()
  })
})

describe("checkRow", () => {
  it("reports nothing for a row the site would accept", () => {
    const row = {
      propertyId: "prop_001",
      amenityKey: "courtyard",
    }
    expect(checkRow("amenities", row)).toEqual({})
  })

  it("names every bad column, not just the first", () => {
    const problems = checkRow("amenities", {
      propertyId: "",
      amenityKey: "jacuzzi",
    })
    expect(Object.keys(problems).sort()).toEqual(["amenityKey", "propertyId"])
  })
})

describe("blankRow", () => {
  it("carries every column, so a new row exports the same header", () => {
    const row = blankRow("units")
    expect(Object.keys(row)).toEqual(
      fieldsOf("units").map((field) => field.name)
    )
    expect(Object.values(row).every((value) => value === "")).toBe(true)
  })

  it("is invalid until filled, which is what the row list should show", () => {
    expect(
      Object.keys(checkRow("units", blankRow("units"))).length
    ).toBeGreaterThan(0)
  })
})

describe("rowLabel", () => {
  it("uses the id where a table has one", () => {
    expect(
      rowLabel("units", { id: "unit_001a", name: "Master bedroom" }, 0)
    ).toBe("unit_001a")
  })

  it("falls back to the composite key ops would recognise", () => {
    expect(
      rowLabel("amenities", { propertyId: "prop_001", amenityKey: "lift" }, 0)
    ).toBe("prop_001 · lift")
  })

  it("falls back to the row number for a row with nothing filled in", () => {
    expect(rowLabel("amenities", {}, 4)).toBe("Row 5")
  })
})
