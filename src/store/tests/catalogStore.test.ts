import { beforeEach, describe, expect, it, vi } from "vitest"
import { __resetCatalogStore, useCatalogStore } from "../catalogStore"
import { propertyService } from "@/service"

const get = () => useCatalogStore.getState()

beforeEach(() => {
  __resetCatalogStore()
  vi.restoreAllMocks()
})

describe("loadProperty", () => {
  it("adds only that property, and does not claim the catalog is complete", async () => {
    await get().loadProperty("indiranagar-garden-loft")

    expect(Object.keys(get().properties)).toEqual(["prop_001"])
    expect(get().slugIndex["indiranagar-garden-loft"]).toBe("prop_001")
    expect(get().status).toBe("ready")
    expect(get().allLoaded).toBe(false)
  })

  it("keeps the nested shape intact", async () => {
    await get().loadProperty("indiranagar-garden-loft")
    const detail = get().properties.prop_001

    expect(detail.units).toHaveLength(4)
    expect(detail.reviews).toHaveLength(4)
    expect(detail.amenities).toContain("courtyard")
  })

  it("does not refetch a property it already has", async () => {
    const spy = vi.spyOn(propertyService, "getPropertyBySlug")
    await get().loadProperty("indiranagar-garden-loft")
    await get().loadProperty("indiranagar-garden-loft")
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("dedupes concurrent calls for the same slug", async () => {
    const spy = vi.spyOn(propertyService, "getPropertyBySlug")
    await Promise.all([
      get().loadProperty("indiranagar-garden-loft"),
      get().loadProperty("indiranagar-garden-loft"),
      get().loadProperty("indiranagar-garden-loft"),
    ])
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("records an unknown slug as notFound rather than an error", async () => {
    await get().loadProperty("no-such-home")

    expect(get().notFound).toContain("no-such-home")
    expect(get().error).toBeNull()
    expect(get().status).toBe("ready")
  })

  it("does not refetch a slug already known to be missing", async () => {
    const spy = vi.spyOn(propertyService, "getPropertyBySlug")
    await get().loadProperty("no-such-home")
    await get().loadProperty("no-such-home")
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("surfaces a real failure as an error", async () => {
    vi.spyOn(propertyService, "getPropertyBySlug").mockRejectedValueOnce(
      new Error("sheet down")
    )
    vi.spyOn(console, "error").mockImplementation(() => {})

    await get().loadProperty("indiranagar-garden-loft")

    expect(get().status).toBe("error")
    expect(get().error).toBe("sheet down")
    expect(get().notFound).toEqual([])
  })
})

describe("loadAllProperties", () => {
  it("fills the catalog and marks it complete", async () => {
    await get().loadAllProperties()

    expect(get().allLoaded).toBe(true)
    expect(get().status).toBe("ready")
    expect(Object.keys(get().properties)).toEqual(["prop_001"])
  })

  it("does not refetch once loaded", async () => {
    const spy = vi.spyOn(propertyService, "getAllProperties")
    await get().loadAllProperties()
    await get().loadAllProperties()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("refetches when forced", async () => {
    const spy = vi.spyOn(propertyService, "getAllProperties")
    await get().loadAllProperties()
    await get().loadAllProperties({ force: true })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it("dedupes concurrent calls", async () => {
    const spy = vi.spyOn(propertyService, "getAllProperties")
    await Promise.all([get().loadAllProperties(), get().loadAllProperties()])
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("leaves the store untouched when it fails", async () => {
    vi.spyOn(propertyService, "getAllProperties").mockRejectedValueOnce(
      new Error("sheet down")
    )
    vi.spyOn(console, "error").mockImplementation(() => {})

    await get().loadAllProperties()

    expect(get().status).toBe("error")
    expect(get().error).toBe("sheet down")
    expect(get().allLoaded).toBe(false)
    expect(get().properties).toEqual({})
  })
})

describe("the two paths together", () => {
  it("a deep link followed by the listing page ends up complete", async () => {
    await get().loadProperty("indiranagar-garden-loft")
    expect(get().allLoaded).toBe(false)

    await get().loadAllProperties()
    expect(get().allLoaded).toBe(true)
    expect(get().properties.prop_001.units).toHaveLength(4)
  })

  it("skips the single fetch once everything is loaded", async () => {
    await get().loadAllProperties()
    const spy = vi.spyOn(propertyService, "getPropertyBySlug")
    await get().loadProperty("indiranagar-garden-loft")
    expect(spy).not.toHaveBeenCalled()
  })
})
