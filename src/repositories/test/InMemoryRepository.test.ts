import { describe, expect, it } from "vitest"
import {
  amenityRepository,
  housekeepingRepository,
  photoRepository,
  propertyRepository,
  reviewRepository,
  unitRepository,
} from "../index"

describe("findAll / count", () => {
  it("returns the whole table, already typed", async () => {
    const properties = await propertyRepository.findAll()
    expect(properties).toHaveLength(1)
    expect(properties[0].bedrooms).toBe(2)
    expect(properties[0].listedOn).toBeInstanceOf(Date)
  })

  it("counts without the caller loading rows", async () => {
    await expect(amenityRepository.count()).resolves.toBe(10)
    await expect(reviewRepository.count()).resolves.toBe(4)
  })
})

describe("findById", () => {
  it("finds a row by its id", async () => {
    const unit = await unitRepository.findById("unit_001c")
    expect(unit?.name).toBe("Study room")
    expect(unit?.status).toBe("booked")
  })

  it("returns null rather than throwing when nothing matches", async () => {
    await expect(unitRepository.findById("unit_nope")).resolves.toBeNull()
  })

  it("reports existence", async () => {
    await expect(propertyRepository.exists("prop_001")).resolves.toBe(true)
    await expect(propertyRepository.exists("prop_999")).resolves.toBe(false)
  })

  it("findByIds keeps the requested order and skips misses", async () => {
    const units = await unitRepository.findByIds(["unit_001x", "unit_nope", "unit_001a"])
    expect(units.map((unit) => unit.id)).toEqual(["unit_001x", "unit_001a"])
  })
})

describe("findByPropertyId", () => {
  it("scopes a child table to one property", async () => {
    const units = await unitRepository.findByPropertyId("prop_001")
    expect(units).toHaveLength(4)
  })

  it("returns an empty list for an unknown property", async () => {
    await expect(reviewRepository.findByPropertyId("prop_999")).resolves.toEqual([])
  })

  it("findByPropertyIds gives every requested id an entry", async () => {
    const grouped = await reviewRepository.findByPropertyIds(["prop_001", "prop_999"])
    expect(grouped.get("prop_001")).toHaveLength(4)
    expect(grouped.get("prop_999")).toEqual([])
  })
})

describe("findBy / findOneBy / findWhere", () => {
  it("filters on any column, type-checked against the model", async () => {
    const rooms = await unitRepository.findBy("kind", "room")
    expect(rooms).toHaveLength(3)
  })

  it("findOneBy returns the first match", async () => {
    const whole = await unitRepository.findOneBy("kind", "entire")
    expect(whole?.id).toBe("unit_001x")
  })

  it("findWhere covers what the named finders do not", async () => {
    const cheap = await unitRepository.findWhere((unit) => unit.monthlyRate < 14000)
    expect(cheap.map((unit) => unit.id).sort()).toEqual(["unit_001b", "unit_001c"])
  })
})

describe("groupBy", () => {
  it("buckets in one pass", async () => {
    const byFrequency = await housekeepingRepository.groupBy("frequency")
    expect(byFrequency.get("fortnightly")).toHaveLength(2)
    expect(byFrequency.get("weekly")).toHaveLength(1)
  })

  it("omits rows whose key is unset", async () => {
    // ph_001b belongs to the whole home, so it carries no unitId.
    const byUnit = await photoRepository.groupBy("unitId")
    expect([...byUnit.keys()].sort()).toEqual(["unit_001b", "unit_001x"])
    expect(await photoRepository.count()).toBe(3)
  })
})
