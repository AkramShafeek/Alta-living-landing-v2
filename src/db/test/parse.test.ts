import { describe, expect, it } from "vitest"
import { z } from "zod"
import db from "../db"
import { tables, type TableName } from "../config"
import { coercerFor, coerceRow, parseTable } from "../parse"
import { bool, date, num, str } from "../coerce"
import { RowValidationError } from "../types"

describe("coercerFor", () => {
  it("derives the coercer from the field's zod type", () => {
    expect(coercerFor(z.number())).toBe(num)
    expect(coercerFor(z.boolean())).toBe(bool)
    expect(coercerFor(z.date())).toBe(date)
    expect(coercerFor(z.string())).toBe(str)
    expect(coercerFor(z.enum(["a", "b"]))).toBe(str)
  })

  it("sees through optional, default and nullable wrappers", () => {
    expect(coercerFor(z.number().optional())).toBe(num)
    expect(coercerFor(z.boolean().default(false))).toBe(bool)
    expect(coercerFor(z.date().nullable())).toBe(date)
    expect(coercerFor(z.number().nonnegative().default(0))).toBe(num)
  })
})

describe("coerceRow", () => {
  const schema = z.object({
    id: z.string(),
    count: z.number(),
    flag: z.boolean(),
    when: z.date().optional(),
  })

  it("turns sheet strings into values", () => {
    expect(
      coerceRow(schema, {
        id: "a",
        count: "3,200",
        flag: "TRUE",
        when: "14/03/2021",
      })
    ).toEqual({ id: "a", count: 3200, flag: true, when: new Date(2021, 2, 14) })
  })

  it("drops columns the model does not declare", () => {
    const out = coerceRow(schema, {
      id: "a",
      count: "1",
      flag: "FALSE",
      scratch: "ops note",
    })
    expect(out).not.toHaveProperty("scratch")
  })

  it("reads a blank cell and a missing column the same way", () => {
    expect(
      coerceRow(schema, { id: "a", count: "1", flag: "TRUE", when: "  " }).when
    ).toBeUndefined()
    expect(
      coerceRow(schema, { id: "a", count: "1", flag: "TRUE" }).when
    ).toBeUndefined()
  })

  it("honours a per-column override", () => {
    const out = coerceRow(
      schema,
      { id: "a", count: "12", flag: "TRUE" },
      { count: () => 99 }
    )
    expect(out.count).toBe(99)
  })
})

describe("parseTable", () => {
  const schema = z.object({
    id: z.string().min(1),
    rating: z.number().min(1).max(5),
  })

  it("names the table and the row when validation fails", () => {
    expect(() =>
      parseTable("reviews", schema, [{ id: "rev_9", rating: "nonsense" }])
    ).toThrow(RowValidationError)
    expect(() =>
      parseTable("reviews", schema, [{ id: "rev_9", rating: "nonsense" }])
    ).toThrow(/reviews row "rev_9".*rating/)
  })

  it("falls back to a composite key when the table has no id", () => {
    const joinSchema = z.object({
      propertyId: z.string(),
      amenityKey: z.enum(["lift"]),
    })
    expect(() =>
      parseTable("amenities", joinSchema, [
        { propertyId: "prop_001", amenityKey: "typo" },
      ])
    ).toThrow(/amenities row "prop_001\/typo"/)
  })

  it("throws rather than dropping the bad row", () => {
    const rows = [
      { id: "a", rating: "5" },
      { id: "b", rating: "9" },
    ]
    expect(() => parseTable("reviews", schema, rows)).toThrow()
  })

  it("returns the good rows on a table that skips", () => {
    const rows = [
      { id: "a", rating: "5" },
      { id: "b", rating: "9" },
      { id: "c", rating: "4" },
    ]
    const { rows: parsed, skipped } = parseTable(
      "reviews",
      schema,
      rows,
      {},
      "skip"
    )

    expect(parsed.map((row) => row.id)).toEqual(["a", "c"])
    expect(skipped).toHaveLength(1)
  })

  it("names the dropped row and why, so it can be reported", () => {
    const { skipped } = parseTable(
      "reviews",
      schema,
      [{ id: "rev_9", rating: "nonsense" }],
      {},
      "skip"
    )

    expect(skipped[0].table).toBe("reviews")
    expect(skipped[0].row).toBe("rev_9")
    expect(skipped[0].detail).toMatch(/rating/)
  })

  it("reports nothing when every row is good", () => {
    const { skipped } = parseTable(
      "reviews",
      schema,
      [{ id: "a", rating: "5" }],
      {},
      "skip"
    )
    expect(skipped).toEqual([])
  })
})

describe("db.getTable", () => {
  const names = Object.keys(tables) as TableName[]

  it.each(names)("parses every row of %s", async (name) => {
    await expect(db.getTable(name)).resolves.toBeInstanceOf(Array)
  })

  it("returns coerced values, not strings", async () => {
    const [property] = await db.getTable("properties")
    expect(property.bedrooms).toBe(2)
    expect(property.hasLift).toBe(true)
    expect(property.carpetAreaSqft).toBe(940)
    expect(property.listedOn).toEqual(new Date(2021, 2, 14))
    expect(property.currency).toBe("INR")
  })

  it("strips the thousands separator off rates", async () => {
    const units = await db.getTable("units")
    const whole = units.find((unit) => unit.kind === "entire")
    expect(whole?.monthlyRate).toBe(30000)
    expect(whole?.nightlyRate).toBe(3200)
  })

  it("leaves a blank optional unset and applies schema defaults", async () => {
    const units = await db.getTable("units")
    const available = units.find((unit) => unit.id === "unit_001a")
    const booked = units.find((unit) => unit.id === "unit_001c")
    expect(available?.status).toBe("available")
    expect(available?.note).toBe("")
    expect(booked?.status).toBe("booked")
  })

  it("rejects an unregistered table", async () => {
    await expect(db.getTable("invoices" as TableName)).rejects.toThrow()
  })

  it("applies a per-column coerce override", async () => {
    // `languages` is an array whose Zod type does not imply its coercer, so the
    // registry gives it `list`. Without the override it arrives as the literal
    // string "English|Kannada|Hindi".
    const hosts = await db.getTable("hosts")
    expect(hosts[0].languages).toEqual(["English", "Kannada", "Hindi"])
    expect(hosts[0].minutesAway).toBe(6)
  })
})
