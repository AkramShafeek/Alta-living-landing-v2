import { describe, expect, it } from "vitest"
import { bool, date, isBlank, list, num, pairs, str } from "../coerce"

describe("num", () => {
  it("reads the formats a sheet actually produces", () => {
    expect(num("3200")).toBe(3200)
    expect(num("3,200")).toBe(3200)
    expect(num("₹ 3,200")).toBe(3200)
    expect(num(" 12.5 ")).toBe(12.5)
    expect(num("-4")).toBe(-4)
  })

  it("treats blanks as unset and junk as NaN, never as zero", () => {
    expect(num("")).toBeUndefined()
    expect(num("   ")).toBeUndefined()
    expect(num(undefined)).toBeUndefined()
    // Surfacing NaN lets Zod name the bad cell instead of reading it as free.
    expect(num("about 3000")).toBeNaN()
  })
})

describe("bool", () => {
  it("accepts checkbox exports and the things humans type", () => {
    expect(bool("TRUE")).toBe(true)
    expect(bool("true")).toBe(true)
    expect(bool("Yes")).toBe(true)
    expect(bool("1")).toBe(true)
    expect(bool("FALSE")).toBe(false)
    expect(bool("no")).toBe(false)
    expect(bool("0")).toBe(false)
  })

  it("returns undefined for blanks so schema defaults apply", () => {
    expect(bool("")).toBeUndefined()
    expect(bool("maybe")).toBeUndefined()
  })
})

describe("date", () => {
  it("reads dd/mm/yyyy as day-first, not month-first", () => {
    const parsed = date("01/10/2025")!
    expect(parsed.getDate()).toBe(1)
    expect(parsed.getMonth()).toBe(9) // October
    expect(parsed.getFullYear()).toBe(2025)
  })

  it("reads ISO, which is what a Sheets API read returns", () => {
    const parsed = date("2025-10-01")!
    expect(parsed.getDate()).toBe(1)
    expect(parsed.getMonth()).toBe(9)
  })

  it("returns undefined rather than an Invalid Date", () => {
    expect(date("")).toBeUndefined()
    expect(date("soon")).toBeUndefined()
  })
})

describe("list and pairs", () => {
  it("splits pipe-separated cells and drops the empties", () => {
    expect(list("electricity|water|internet")).toEqual([
      "electricity",
      "water",
      "internet",
    ])
    expect(list("a | b |")).toEqual(["a", "b"])
    expect(list("")).toEqual([])
  })

  it("splits pairs on :: and keeps commas inside the value", () => {
    expect(pairs("1926::house, restored 2021")).toEqual([
      ["1926", "house, restored 2021"],
    ])
    expect(pairs("3 days::move-in|2x::extensions")).toEqual([
      ["3 days", "move-in"],
      ["2x", "extensions"],
    ])
  })
})

describe("str and isBlank", () => {
  it("trims and treats whitespace-only as unset", () => {
    expect(str("  Indiranagar ")).toBe("Indiranagar")
    expect(str("   ")).toBeUndefined()
    expect(isBlank("  ")).toBe(true)
    expect(isBlank("x")).toBe(false)
  })
})
