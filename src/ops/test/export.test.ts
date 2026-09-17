import { describe, expect, it } from "vitest"
import { unzipSync, strFromU8 } from "fflate"
import { buildExport, buildPropertyExport, columnsOf, toTsv } from "../export"
import { tables, type TableName } from "@/db/config"
import type { Row } from "@/db/types"

const empty = (): Record<TableName, Row[]> =>
  Object.fromEntries(
    (Object.keys(tables) as TableName[]).map((table) => [table, [] as Row[]])
  ) as unknown as Record<TableName, Row[]>

/** Reads back what the export wrote, the way a spreadsheet would. */
function parseTsv(text: string): Row[] {
  const [header, ...lines] = text.split("\r\n")
  const columns = header.split("\t")

  return lines.map((line) =>
    Object.fromEntries(
      line.split("\t").map((cell, index) => [columns[index], cell])
    )
  )
}

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer())

describe("toTsv", () => {
  it("takes its header from the model, not from the rows", () => {
    // A row typed in the editor and a row read from the sheet must produce the
    // same columns in the same order, or pasting one over the other misaligns.
    const tsv = toTsv("amenities", [{ amenityKey: "lift" }])
    expect(tsv.split("\r\n")[0]).toBe("propertyId\tamenityKey")
  })

  it("keeps a column the row is missing as an empty cell", () => {
    const [, row] = toTsv("amenities", [{ amenityKey: "lift" }]).split("\r\n")
    expect(row).toBe("\tlift")
  })

  it("writes CRLF, which is what Sheets and Excel expect", () => {
    expect(
      toTsv("amenities", [{ propertyId: "p", amenityKey: "lift" }])
    ).toContain("\r\n")
  })

  it("flattens a cell containing a tab, and says which one", () => {
    // Left alone this becomes two cells on paste, shifting every column after
    // it — the failure is silent and the row still looks plausible.
    const warnings: Parameters<typeof toTsv>[2] = []
    const tsv = toTsv(
      "notIncluded",
      [
        {
          propertyId: "p",
          item: "Gas",
          note: "billed\tat actuals",
          order: "0",
        },
      ],
      warnings
    )

    expect(tsv).toContain("billed at actuals")
    expect(warnings).toEqual([{ table: "notIncluded", row: 0, column: "note" }])
  })

  it("flattens a newline inside a cell for the same reason", () => {
    const warnings: Parameters<typeof toTsv>[2] = []
    const tsv = toTsv(
      "properties",
      [{ id: "p", body: "First.\nSecond." }],
      warnings
    )

    expect(tsv.split("\r\n")).toHaveLength(2)
    expect(warnings.map((warning) => warning.column)).toEqual(["body"])
  })

  it("emits a header and nothing else for an empty table", () => {
    expect(toTsv("amenities", [])).toBe("propertyId\tamenityKey")
  })
})

describe("columnsOf", () => {
  it("matches the model's declared order", () => {
    expect(columnsOf("units").slice(0, 4)).toEqual([
      "id",
      "propertyId",
      "kind",
      "name",
    ])
  })
})

describe("buildExport", () => {
  it("names the archive with a timestamp", () => {
    expect(buildExport(empty()).filename).toMatch(/^alta-catalog-.*\.zip$/)
  })

  it("includes a file per registered table, so no tab is left half-updated", () => {
    const names = buildExport(empty()).tables.map((table) => table.table)
    expect(names.sort()).toEqual((Object.keys(tables) as TableName[]).sort())
  })

  it("writes an archive that unzips, holding a file per table plus a README", async () => {
    const files = unzipSync(await bytesOf(buildExport(empty()).blob))

    expect(Object.keys(files)).toContain("README.txt")
    expect(Object.keys(files)).toContain("properties.txt")
    expect(Object.keys(files)).toHaveLength(Object.keys(tables).length + 1)
  })

  it("round-trips: what comes out, read back, is what went in", async () => {
    const rows = empty()
    rows.amenities = [
      { propertyId: "prop_001", amenityKey: "lift" },
      { propertyId: "prop_001", amenityKey: "courtyard" },
    ]

    const files = unzipSync(await bytesOf(buildExport(rows).blob))
    expect(parseTsv(strFromU8(files["amenities.txt"]))).toEqual(rows.amenities)
  })

  it("carries the paste instructions and the hosts warning", async () => {
    const files = unzipSync(await bytesOf(buildExport(empty()).blob))
    const readme = strFromU8(files["README.txt"])

    expect(readme).toMatch(/Split text to columns/)
    expect(readme).toMatch(/Plain text/)
    expect(readme).toMatch(/hosts tab holds phone numbers/)
  })

  it("lists flattened cells in the README so they can be checked by hand", async () => {
    const rows = empty()
    rows.properties = [{ id: "prop_001", body: "one\ntwo" }]

    const result = buildExport(rows)
    const readme = strFromU8(
      unzipSync(await bytesOf(result.blob))["README.txt"]
    )

    expect(result.warnings).toHaveLength(1)
    expect(readme).toMatch(/CELLS THAT WERE FLATTENED/)
    expect(readme).toMatch(/properties - row 1, column body/)
  })
})

describe("buildPropertyExport", () => {
  const twoHomes = (): Record<TableName, Row[]> => {
    const rows = empty()
    rows.properties = [
      { id: "prop_001", name: "The Garden Loft" },
      { id: "prop_002", name: "Assagao House" },
    ]
    rows.units = [
      { id: "unit_001a", propertyId: "prop_001", name: "Master bedroom" },
      { id: "unit_002a", propertyId: "prop_002", name: "Sea room" },
    ]
    return rows
  }

  const home = { id: "prop_001", name: "The Garden Loft" }

  it("names the archive after the home", () => {
    expect(buildPropertyExport(twoHomes(), home).filename).toMatch(
      /^alta-the-garden-loft-.*\.zip$/
    )
  })

  it("ships both a full tab and a this-home slice for each table", async () => {
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )

    expect(Object.keys(files)).toContain("full-tabs/units.txt")
    expect(Object.keys(files)).toContain("this-home/units.txt")
    expect(Object.keys(files)).toContain("README.txt")
  })

  it("keeps every home in the full tab", async () => {
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )
    const rows = parseTsv(strFromU8(files["full-tabs/units.txt"]))

    expect(rows.map((row) => row.id)).toEqual(["unit_001a", "unit_002a"])
  })

  it("keeps only this home in the scoped slice", async () => {
    // The whole reason Route B exists: pasting this cannot touch prop_002.
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )
    const rows = parseTsv(strFromU8(files["this-home/units.txt"]))

    expect(rows.map((row) => row.id)).toEqual(["unit_001a"])
  })

  it("scopes the properties tab by id, not by propertyId", async () => {
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )
    const rows = parseTsv(strFromU8(files["this-home/properties.txt"]))

    expect(rows.map((row) => row.id)).toEqual(["prop_001"])
  })

  it("gives the scoped slice the same header as the full tab", async () => {
    // Ops pastes these into a tab that already has a header; the columns have
    // to line up with it or every value lands one column off.
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )

    const full = strFromU8(files["full-tabs/units.txt"]).split("\r\n")[0]
    const scoped = strFromU8(files["this-home/units.txt"]).split("\r\n")[0]
    expect(scoped).toBe(full)
  })

  it("leaves hosts out of the scoped slice, since a host is shared", async () => {
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )

    expect(Object.keys(files)).toContain("full-tabs/hosts.txt")
    expect(Object.keys(files)).not.toContain("this-home/hosts.txt")
  })

  it("explains both routes and names the home in the README", async () => {
    const files = unzipSync(
      await bytesOf(buildPropertyExport(twoHomes(), home).blob)
    )
    const readme = strFromU8(files["README.txt"])

    expect(readme).toMatch(/THE GARDEN LOFT/)
    expect(readme).toMatch(/ROUTE A/)
    expect(readme).toMatch(/ROUTE B/)
    // The tradeoff is the point — Route A reverts other people's edits.
    expect(readme).toMatch(/silently reverts/)
    expect(readme).toMatch(/prop_001/)
  })

  it("reports a flattened cell once, not once per copy", async () => {
    const rows = twoHomes()
    rows.properties[0].body = "one\ntwo"

    expect(buildPropertyExport(rows, home).warnings).toHaveLength(1)
  })

  it("counts this home's rows against the tab's total", () => {
    const result = buildPropertyExport(twoHomes(), home)
    const units = result.tables.find((table) => table.table === "units")

    expect(units).toMatchObject({ rowCount: 2, scopedCount: 1 })
  })
})
