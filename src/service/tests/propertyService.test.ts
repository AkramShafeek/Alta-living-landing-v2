import { describe, expect, it } from "vitest"
import { propertyService } from "../index"
import { PropertyNotFoundError } from "../propertyService"

describe("getPropertyBySlug", () => {
  it("returns the property fully nested", async () => {
    const d = await propertyService.getPropertyBySlug("indiranagar-garden-loft")

    expect(d.property.name).toBe("The Garden Loft")
    expect(d.units).toHaveLength(4)
    expect(d.photos).toHaveLength(3)
    expect(d.reviews).toHaveLength(4)
    expect(d.nearby).toHaveLength(3)
    expect(d.amenities).toHaveLength(10)
    expect(d.includedInPrice).toHaveLength(5)
    expect(d.notIncluded).toHaveLength(2)
    expect(d.housekeeping).toHaveLength(3)
    expect(d.highlights).toHaveLength(1)
  })

  it("nests each unit's photos", async () => {
    const d = await propertyService.getPropertyBySlug("indiranagar-garden-loft")
    const whole = d.units.find((u) => u.kind === "entire")
    expect(whole?.photos.map((p) => p.id)).toEqual(["ph_001a"])
  })

  it("throws PropertyNotFoundError on an unknown slug", async () => {
    await expect(
      propertyService.getPropertyBySlug("no-such-home")
    ).rejects.toThrow(PropertyNotFoundError)
  })
})

describe("getPropertyById", () => {
  it("returns the same object as the slug lookup", async () => {
    const bySlug = await propertyService.getPropertyBySlug(
      "indiranagar-garden-loft"
    )
    const byId = await propertyService.getPropertyById("prop_001")
    expect(byId).toEqual(bySlug)
  })

  it("throws on an unknown id", async () => {
    await expect(propertyService.getPropertyById("prop_999")).rejects.toThrow(
      PropertyNotFoundError
    )
  })
})

describe("getAllProperties", () => {
  it("builds every property with its relations", async () => {
    const all = await propertyService.getAllProperties()
    expect(all).toHaveLength(1)
    expect(all[0].units).toHaveLength(4)
    expect(all[0].amenities).toContain("courtyard")
  })

  it("agrees with the single-property path", async () => {
    const [fromList] = await propertyService.getAllProperties()
    const direct = await propertyService.getPropertyById("prop_001")
    expect(fromList).toEqual(direct)
  })
})
