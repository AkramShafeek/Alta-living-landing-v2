// What an optional table does when it cannot be read, and a table switched
// to sheets without a gid. Env is read at import, so each test re-imports.

import { afterEach, describe, expect, it, vi } from "vitest"

const loadDb = async (env: Record<string, string>) => {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
  return (await import("../db")).default
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("photos on sheets, when the tab cannot be read", () => {
  const env = { VITE_SHEET_PUB_ID: "2PACX-test", VITE_DB_SOURCE_PHOTOS: "sheets" }

  it("reads as empty on the site instead of failing the catalog", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"))
    const db = await loadDb(env)

    await expect(db.getTable("photos")).resolves.toEqual([])
    expect(db.issues()).toEqual([
      expect.objectContaining({ table: "photos", row: "(whole table)" }),
    ])
  })

  it("still fails loudly in the ops editor's raw read", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"))
    const db = await loadDb(env)
    await expect(db.getRawTable("photos")).rejects.toThrow()
  })
})

describe("a required table on sheets with no gid", () => {
  it("fails with a message that names the cause", async () => {
    const db = await loadDb({
      VITE_SHEET_PUB_ID: "2PACX-test",
      VITE_DB_SOURCE_REVIEWS: "sheets",
    })
    await expect(db.getTable("reviews")).rejects.toThrow(/reviews.*no gid/)
  })
})
