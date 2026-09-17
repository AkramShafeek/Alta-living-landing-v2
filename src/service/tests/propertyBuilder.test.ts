import { describe, expect, it } from "vitest"
import {
  amenityRepository,
  highlightRepository,
  housekeepingRepository,
  includedRepository,
  nearbyRepository,
  notIncludedRepository,
  photoRepository,
  propertyRepository,
  reviewRepository,
  unitRepository,
} from "@/repositories"
import { buildProperty } from "../propertyBuilder"
import { buildUnitDetail, buildUnitDetails } from "../unitBuilder"
import type { PropertyDetail } from "@/store/types"

async function fullDetail(): Promise<PropertyDetail> {
  const property = await propertyRepository.findOneBy(
    "slug",
    "indiranagar-garden-loft"
  )
  if (!property) throw new Error("fixture missing")
  const id = property.id

  return buildProperty(property)
    .withUnits(await unitRepository.findByPropertyId(id))
    .withPhotos(await photoRepository.findByPropertyId(id))
    .withReviews(await reviewRepository.findByPropertyId(id))
    .withNearby(await nearbyRepository.findByPropertyId(id))
    .withAmenities(await amenityRepository.findByPropertyId(id))
    .withIncluded(await includedRepository.findByPropertyId(id))
    .withNotIncluded(await notIncludedRepository.findByPropertyId(id))
    .withHousekeeping(await housekeepingRepository.findByPropertyId(id))
    .withHighlights(await highlightRepository.findByPropertyId(id))
    .build()
}

describe("buildUnitDetail", () => {
  it("nests the unit's photos and drops propertyId", async () => {
    const unit = await unitRepository.findById("unit_001b")
    const photos = await photoRepository.findByPropertyId("prop_001")
    const detail = buildUnitDetail(
      unit!,
      photos.filter((p) => p.unitId === "unit_001b")
    )

    expect(detail.name).toBe("Courtyard bedroom")
    expect(detail).not.toHaveProperty("propertyId")
    expect(detail.photos.map((p) => p.id)).toEqual(["ph_001c"])
  })

  it("distributes photos across units in one pass", async () => {
    const units = await unitRepository.findByPropertyId("prop_001")
    const photos = await photoRepository.findByPropertyId("prop_001")
    const details = buildUnitDetails(units, photos)

    const byId = new Map(details.map((u) => [u.id, u]))
    expect(byId.get("unit_001x")?.photos.map((p) => p.id)).toEqual(["ph_001a"])
    expect(byId.get("unit_001b")?.photos.map((p) => p.id)).toEqual(["ph_001c"])
    // ph_001b is a photo of the whole home, so it lands on no unit.
    expect(byId.get("unit_001a")?.photos).toEqual([])
    expect(byId.get("unit_001c")?.photos).toEqual([])
  })
})

describe("PropertyBuilder", () => {
  it("assembles every relation", async () => {
    const d = await fullDetail()

    expect(d.property.slug).toBe("indiranagar-garden-loft")
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

  it("collapses join rows to bare keys", async () => {
    const d = await fullDetail()
    expect(d.amenities).toContain("courtyard")
    expect(d.includedInPrice).toContain("electricity")
    expect(d.amenities[0]).toBeTypeOf("string")
  })

  it("strips propertyId from every nested child", async () => {
    const d = await fullDetail()
    for (const row of [
      ...d.nearby,
      ...d.highlights,
      ...d.notIncluded,
      ...d.housekeeping,
    ]) {
      expect(row).not.toHaveProperty("propertyId")
    }
    expect(d.units[0]).not.toHaveProperty("propertyId")
  })

  it("orders property photos hero first", async () => {
    const d = await fullDetail()
    expect(d.photos[0].id).toBe("ph_001a")
    expect(d.photos[0].isHero).toBe(true)
  })

  it("orders the ordered children by their order column", async () => {
    const d = await fullDetail()
    expect(d.notIncluded.map((n) => n.item)).toEqual(["Gas", "Linen"])
  })

  it("defaults an unfed table to an empty list, not undefined", async () => {
    const property = await propertyRepository.findById("prop_001")
    const bare = buildProperty(property!).build()

    expect(bare.units).toEqual([])
    expect(bare.reviews).toEqual([])
    expect(bare.amenities).toEqual([])
    expect(bare.housekeeping).toEqual([])
  })

  it("does not mutate the rows it was handed", async () => {
    const photos = await photoRepository.findByPropertyId("prop_001")
    const before = photos.map((p) => p.id)
    const property = await propertyRepository.findById("prop_001")
    buildProperty(property!).withPhotos(photos).build()
    expect(photos.map((p) => p.id)).toEqual(before)
  })
})
