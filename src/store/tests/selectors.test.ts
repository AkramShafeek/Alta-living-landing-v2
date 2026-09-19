import { describe, expect, it } from "vitest"
import { propertyService } from "@/service"
import {
  selectAvailabilityLabel,
  selectFreeRooms,
  selectIsWholeHomeFree,
} from "../selectors"
import type { PropertyDetail } from "../types"

const load = (): Promise<PropertyDetail> =>
  propertyService.getPropertyBySlug("indiranagar-garden-loft")

const allRoomsBooked = (base: PropertyDetail): PropertyDetail => ({
  ...base,
  units: base.units.map((unit) =>
    unit.kind === "room" ? { ...unit, status: "booked" as const } : unit
  ),
})

describe("status drives availability", () => {
  it("counts only the rooms whose status is available", async () => {
    const detail = await load()
    // Fixture: 001a and 001b available, 001c booked.
    expect(selectAvailabilityLabel(detail)).toBe("2 of 3 available")
    expect(selectFreeRooms(detail)).toHaveLength(2)
  })

  it("says fully booked when no room is available", async () => {
    const detail = allRoomsBooked(await load())
    expect(selectAvailabilityLabel(detail)).toBe("Fully booked")
    expect(selectFreeRooms(detail)).toEqual([])
  })

  it("treats on_notice and blocked as not bookable", async () => {
    const base = await load()
    const detail: PropertyDetail = {
      ...base,
      units: base.units.map((unit, i) =>
        unit.kind === "room"
          ? {
              ...unit,
              status: (["on_notice", "blocked", "booked"] as const)[i],
            }
          : unit
      ),
    }

    // Nothing is "available", so nothing is offered — a guest cannot book a
    // room that is merely leaving soon.
    expect(selectAvailabilityLabel(detail)).toBe("Fully booked")
    expect(selectFreeRooms(detail)).toEqual([])
  })

  it("reports the whole home separately", async () => {
    const detail = await load()
    expect(selectIsWholeHomeFree(detail)).toBe(true)
  })
})

describe("no availability date", () => {
  it("carries no free-from date to go stale", async () => {
    const detail = await load()
    const occupied = detail.units.find((u) => u.id === "unit_001c")

    expect(occupied?.status).toBe("booked")
    expect(occupied).not.toHaveProperty("availableFrom")
  })
})
