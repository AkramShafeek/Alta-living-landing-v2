import { describe, expect, it } from "vitest"
import { zUnit } from "../Rooms"

const room = {
  id: "unit_x",
  propertyId: "prop_001",
  kind: "room",
  name: "Bunk room",
  maxOccupancy: 1,
  monthlyRate: 9000,
  nightlyRate: 900,
  status: "available",
}

const issuesOf = (row: object) => {
  const result = zUnit.safeParse(row)
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."))
}

describe("zUnit replicas", () => {
  it("defaults to an ordinary room with no counts", () => {
    const parsed = zUnit.parse(room)
    expect(parsed.hasReplicas).toBe(false)
    expect(parsed.totalCount).toBeUndefined()
  })

  it("does not need counts when hasReplicas is false", () => {
    expect(issuesOf({ ...room, hasReplicas: false })).toEqual([])
  })

  it("needs both counts when hasReplicas is true", () => {
    expect(issuesOf({ ...room, hasReplicas: true }).sort()).toEqual([
      "occupiedCount",
      "totalCount",
    ])
  })

  it("reports missing counts even when other columns are also wrong", () => {
    // Zod skips refinements on a row that already failed, unless told not to;
    // ops would otherwise see the counts only after fixing everything else.
    const { monthlyRate: _m, nightlyRate: _n, ...unrated } = room
    expect(issuesOf({ ...unrated, hasReplicas: true }).sort()).toEqual([
      "monthlyRate",
      "nightlyRate",
      "occupiedCount",
      "totalCount",
    ])
  })

  it("rejects more occupied than exist", () => {
    expect(
      issuesOf({ ...room, hasReplicas: true, totalCount: 3, occupiedCount: 4 })
    ).toEqual(["occupiedCount"])
  })

  it("rejects replicas on the entire home", () => {
    expect(
      issuesOf({
        ...room,
        kind: "entire",
        hasReplicas: true,
        totalCount: 2,
        occupiedCount: 0,
      })
    ).toEqual(["hasReplicas"])
  })
})
