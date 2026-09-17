// ─────────────────────────────────────────────────────────────────────────
// Status filtering and the host join.
//
// Built on a stand-in `properties` repository rather than on a second fixture,
// because a draft row in the fixtures would change the counts every other test
// asserts. The service takes its repositories by constructor for exactly this.
// ─────────────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest"
import {
  amenityRepository,
  highlightRepository,
  hostRepository,
  housekeepingRepository,
  includedRepository,
  nearbyRepository,
  notIncludedRepository,
  photoRepository,
  propertyRepository,
  reviewRepository,
  unitRepository,
} from "@/repositories"
import type { Repository } from "@/repositories"
import type { RowOf } from "@/db/config"
import { PropertyNotFoundError, PropertyService } from "../propertyService"

type PropertyRow = RowOf<"properties">

/** The real fixture row, restatused and re-slugged. */
async function variants(): Promise<PropertyRow[]> {
  const live = await propertyRepository.findById("prop_001")
  if (!live) throw new Error("fixture missing")

  return [
    live,
    { ...live, id: "prop_draft", slug: "draft-home", status: "draft" },
    { ...live, id: "prop_paused", slug: "paused-home", status: "paused" },
    { ...live, id: "prop_archived", slug: "archived-home", status: "archived" },
  ]
}

/** Only the finders the service actually calls on `properties`. */
function stubProperties(rows: PropertyRow[]): Repository<PropertyRow> {
  return {
    findAll: async () => rows,
    findById: async (id: string) => rows.find((row) => row.id === id) ?? null,
    findOneBy: async <F extends keyof PropertyRow>(field: F, value: PropertyRow[F]) =>
      rows.find((row) => row[field] === value) ?? null,
  } as unknown as Repository<PropertyRow>
}

async function serviceWith(rows: PropertyRow[]): Promise<PropertyService> {
  return new PropertyService({
    properties: stubProperties(rows),
    units: unitRepository,
    photos: photoRepository,
    reviews: reviewRepository,
    nearby: nearbyRepository,
    amenities: amenityRepository,
    included: includedRepository,
    notIncluded: notIncludedRepository,
    housekeeping: housekeepingRepository,
    highlights: highlightRepository,
    hosts: hostRepository,
  })
}

describe("status filtering", () => {
  it("lists only live properties", async () => {
    const service = await serviceWith(await variants())
    const all = await service.getAllProperties()

    expect(all).toHaveLength(1)
    expect(all[0].property.id).toBe("prop_001")
  })

  it("404s a direct link to a property that is not live", async () => {
    const service = await serviceWith(await variants())

    // Filtering it out of the listing but still serving it to anyone holding
    // the link would defeat the filter — paused is paused for everyone.
    for (const slug of ["draft-home", "paused-home", "archived-home"]) {
      await expect(service.getPropertyBySlug(slug)).rejects.toThrow(
        PropertyNotFoundError
      )
    }
  })

  it("404s by id as well as by slug", async () => {
    const service = await serviceWith(await variants())
    await expect(service.getPropertyById("prop_draft")).rejects.toThrow(
      PropertyNotFoundError
    )
  })

  it("still serves the live one", async () => {
    const service = await serviceWith(await variants())
    const detail = await service.getPropertyBySlug("indiranagar-garden-loft")
    expect(detail.property.status).toBe("live")
  })

  it("includeNonLive opens it up for an ops preview", async () => {
    const service = await serviceWith(await variants())

    await expect(
      service.getAllProperties({ includeNonLive: true })
    ).resolves.toHaveLength(4)
    await expect(
      service.getPropertyBySlug("draft-home", { includeNonLive: true })
    ).resolves.toMatchObject({ property: { status: "draft" } })
  })

  it("does not confuse a missing property with a hidden one", async () => {
    const service = await serviceWith(await variants())
    await expect(
      service.getPropertyBySlug("no-such-home", { includeNonLive: true })
    ).rejects.toThrow(PropertyNotFoundError)
  })
})

describe("host join", () => {
  it("attaches the host the property points at", async () => {
    const detail = await (
      await serviceWith(await variants())
    ).getPropertyBySlug("indiranagar-garden-loft")

    expect(detail.host?.id).toBe("host_meera")
    expect(detail.host?.name).toBe("Meera")
    // Pipe-separated in the sheet, an array by the time it gets here.
    expect(detail.host?.languages).toEqual(["English", "Kannada", "Hindi"])
  })

  it("is null when hostId points at nothing, rather than failing the page", async () => {
    const [live] = await variants()
    const service = await serviceWith([{ ...live, hostId: "host_nobody" }])
    const detail = await service.getPropertyBySlug("indiranagar-garden-loft")

    expect(detail.host).toBeNull()
    expect(detail.property.name).toBe("The Garden Loft")
  })
})

describe("displayOnHome", () => {
  it("is read off the row, not derived", async () => {
    const detail = await (
      await serviceWith(await variants())
    ).getPropertyBySlug("indiranagar-garden-loft")
    expect(detail.property.displayOnHome).toBe(true)
  })

  it("defaults to false when the column is absent", async () => {
    // A sheet without the column yet: blank reads as unset, and the schema
    // default keeps the home off the landing page until someone opts it in.
    const [live] = await variants()
    const withoutFlag = { ...live } as Record<string, unknown>
    delete withoutFlag.displayOnHome

    const service = await serviceWith([withoutFlag as PropertyRow])
    const detail = await service.getPropertyBySlug("indiranagar-garden-loft")
    expect(detail.property.displayOnHome).toBeUndefined()
  })
})
