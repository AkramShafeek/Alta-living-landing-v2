import { describe, expect, it } from "vitest"
import { parseCsv, rowsFromCsv } from "../csv"

describe("parseCsv", () => {
  it("keeps commas inside quoted fields in one cell", () => {
    // The case a split(",") gets wrong: every column after the address shifts
    // by two, and the row still validates because most of it is strings.
    const csv =
      'id,addressLine,pincode\nprop_001,"412, 12th Main, HAL 2nd Stage",560038'
    expect(parseCsv(csv)[1]).toEqual([
      "prop_001",
      "412, 12th Main, HAL 2nd Stage",
      "560038",
    ])
  })

  it("keeps newlines inside quoted fields in one cell", () => {
    const csv = 'id,body\nprop_001,"First line.\nSecond line."'
    const grid = parseCsv(csv)
    expect(grid).toHaveLength(2)
    expect(grid[1][1]).toBe("First line.\nSecond line.")
  })

  it("reads a doubled quote as one literal quote", () => {
    const csv = 'id,note\nprop_001,"the ""garden"" loft"'
    expect(parseCsv(csv)[1][1]).toBe('the "garden" loft')
  })

  it("treats CRLF as one line break and leaves no stray carriage return", () => {
    // A \r left on the last column fails every enum in the schema with a
    // message that never mentions whitespace.
    const grid = parseCsv("id,status\r\nprop_001,live\r\n")
    expect(grid).toEqual([
      ["id", "status"],
      ["prop_001", "live"],
    ])
  })

  it("reads the last row whether or not the file ends with a newline", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ])
    expect(parseCsv("a,b\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ])
  })

  it("keeps empty cells rather than collapsing them", () => {
    expect(parseCsv("a,b,c\n1,,3")).toEqual([
      ["a", "b", "c"],
      ["1", "", "3"],
    ])
  })

  it("strips the BOM Sheets puts on some exports", () => {
    // Left in place it becomes part of the first header, so `id` stops matching.
    expect(parseCsv("﻿id,name\nprop_001,Loft")[0][0]).toBe("id")
  })
})

describe("rowsFromCsv", () => {
  it("keys each row by its header", () => {
    expect(rowsFromCsv("id,name\nprop_001,The Garden Loft")).toEqual([
      { id: "prop_001", name: "The Garden Loft" },
    ])
  })

  it("drops blank rows a sheet accumulates at the bottom", () => {
    expect(rowsFromCsv("id,name\nprop_001,Loft\n,\n, ")).toHaveLength(1)
  })

  it("drops unnamed columns so a spacer cannot reach the row", () => {
    const rows = rowsFromCsv("id,,name\nprop_001,x,Loft")
    expect(rows[0]).toEqual({ id: "prop_001", name: "Loft" })
  })

  it("reads a short row as blank cells, the same as a missing column", () => {
    expect(rowsFromCsv("id,name,note\nprop_001,Loft")).toEqual([
      { id: "prop_001", name: "Loft", note: "" },
    ])
  })

  it("keeps extra named columns, since the schema drops them a layer up", () => {
    const rows = rowsFromCsv("id,opsScratch\nprop_001,chase Meera")
    expect(rows[0].opsScratch).toBe("chase Meera")
  })

  it("returns nothing for an empty file or a header with no rows", () => {
    expect(rowsFromCsv("")).toEqual([])
    expect(rowsFromCsv("id,name")).toEqual([])
  })
})
