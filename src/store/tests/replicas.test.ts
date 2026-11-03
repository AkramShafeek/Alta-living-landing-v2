import { describe, expect, it } from "vitest"
import { propertyService } from "@/service"
import {
  isUnitBookable,
  selectAvailabilityLabel,
  selectHomePageProperties,
  selectReplicaAvailability,
  selectStartingMonthly,
  selectUnitStatusLabel,
  toCardView,
  unitFreeCount,
} from "../selectors"
import type { PropertyDetail, UnitDetail } from "../types"

const load = (): Promise<PropertyDetail> =>
  propertyService.getPropertyBySlug("indiranagar-garden-loft")

/** The fixture's first room, turned into a replica room with these counts. */
const asReplica = (
  detail: PropertyDetail,
  totalCount: number,
  occupiedCount: number,
  status: UnitDetail["status"] = "available"
): PropertyDetail => {
  const first = detail.units.find((unit) => unit.kind === "room")!
  return {
    ...detail,
    units: detail.units.map((unit) =>
      unit === first
        ? { ...unit, hasReplicas: true, totalCount, occupiedCount, status }
        : unit
    ),
  }
}

const firstRoom = (detail: PropertyDetail) =>
  detail.units.find((unit) => unit.kind === "room")!

describe("replica rooms", () => {
  it("count themselves x/y available, and tag themselves Available", async () => {
    const room = firstRoom(asReplica(await load(), 5, 3))
    expect(selectReplicaAvailability(room)).toBe("2/5 Available")
    expect(selectUnitStatusLabel(room)).toBe("Available")
    expect(unitFreeCount(room)).toBe(2)
    expect(isUnitBookable(room)).toBe(true)
  })

  it("are not bookable once every replica is occupied", async () => {
    const room = firstRoom(asReplica(await load(), 4, 4))
    expect(selectReplicaAvailability(room)).toBe("0/4 Available")
    expect(selectUnitStatusLabel(room)).toBe("Fully booked")
    expect(isUnitBookable(room)).toBe(false)
  })

  it("let status close them whatever the counts say", async () => {
    const room = firstRoom(asReplica(await load(), 5, 0, "blocked"))
    expect(selectUnitStatusLabel(room)).toBe("Blocked")
    expect(isUnitBookable(room)).toBe(false)
  })

  it("count in rooms toward the home's headline", async () => {
    // Fixture: 001a and 001b available, 001c booked. 001a becomes 2 free of 5,
    // so 2 + 1 open of 5 + 1 + 1.
    const detail = asReplica(await load(), 5, 3)
    expect(selectAvailabilityLabel(detail)).toBe("3 of 7 available")
  })

  it("ignore counts on an ordinary room", async () => {
    const base = await load()
    const room = { ...firstRoom(base), totalCount: 9, occupiedCount: 9 }
    expect(room.hasReplicas).toBe(false)
    expect(isUnitBookable(room)).toBe(true)
    expect(selectUnitStatusLabel(room)).toBe("Available")
    // No count line at all: an ordinary room is available or it is not.
    expect(selectReplicaAvailability(room)).toBeUndefined()
  })
})

describe("the starting price", () => {
  /** The fixture home with each unit's monthly rate replaced, by kind. */
  const priced = (
    base: PropertyDetail,
    rates: { rooms: number[]; whole?: number }
  ): PropertyDetail => {
    let room = 0
    return {
      ...base,
      units: base.units.flatMap((unit) => {
        if (unit.kind === "entire") {
          return rates.whole === undefined
            ? []
            : [{ ...unit, monthlyRate: rates.whole }]
        }
        return [{ ...unit, monthlyRate: rates.rooms[room++] ?? 0 }]
      }),
    }
  }

  it("is the lowest monthly rate across every unit", async () => {
    const detail = priced(await load(), {
      rooms: [24000, 18000, 21000],
      whole: 60000,
    })
    expect(selectStartingMonthly(detail)).toBe(18000)

    const card = toCardView(detail)
    expect(card.price).toBe("₹ 18,000")
    expect(card.priceUnit).toBe("month (per room)")
  })

  it("includes the whole home, and labels it so when it is cheapest", async () => {
    const detail = priced(await load(), {
      rooms: [24000, 30000, 0],
      whole: 20000,
    })
    expect(selectStartingMonthly(detail)).toBe(20000)
    expect(toCardView(detail).priceUnit).toBe("month")
  })

  it("works without a whole-home unit", async () => {
    const detail = priced(await load(), { rooms: [24000, 35000, 28000] })
    expect(selectStartingMonthly(detail)).toBe(24000)
    expect(toCardView(detail).unpriced).toBe(false)
  })

  it("skips unpriced units rather than starting from ₹ 0", async () => {
    const detail = priced(await load(), { rooms: [0, 35000, 0], whole: 0 })
    expect(selectStartingMonthly(detail)).toBe(35000)
  })

  it("says so when nothing is priced", async () => {
    const card = toCardView(
      priced(await load(), { rooms: [0, 0, 0], whole: 0 })
    )
    expect(card.unpriced).toBe(true)
    expect(card.price).toBe("Price coming soon")
    expect(card.monthly).toBe(0)
  })
})

describe("the landing page's homes", () => {
  const withHome = async (displayOnHome: boolean, photos = true): Promise<PropertyDetail> => {
    const base = await load()
    return {
      ...base,
      property: { ...base.property, displayOnHome },
      photos: photos ? base.photos : [],
    }
  }

  const named = (home: PropertyDetail, id: string, displayOnHome: boolean, free = true): PropertyDetail => ({
    ...home,
    property: { ...home.property, id, displayOnHome },
    units: home.units.map((u) => ({ ...u, status: free ? "available" : "booked" })),
  })

  it("puts the featured homes first, then tops up to four", async () => {
    const base = await withHome(false)
    const homes = [
      named(base, "a", false, false),
      named(base, "b", false),
      named(base, "c", true),
      named(base, "d", false),
      named(base, "e", false),
      named(base, "f", false),
    ]
    const shown = selectHomePageProperties(homes).map((h) => h.property.id)
    expect(shown).toHaveLength(4)
    expect(shown[0]).toBe("c")
    // Fully booked "a" is passed over while open homes remain.
    expect(shown).not.toContain("a")
  })

  it("keeps every featured home, even past four", async () => {
    const base = await withHome(true)
    const homes = ["a", "b", "c", "d", "e"].map((id) => named(base, id, true))
    expect(selectHomePageProperties(homes)).toHaveLength(5)
  })

  it("leaves out homes without a photo", async () => {
    expect(selectHomePageProperties([await withHome(true, false)])).toEqual([])
  })

  it("gives cards the real carpet area", async () => {
    const detail = await load()
    expect(toCardView(detail).size).toBe(
      `${detail.property.carpetAreaSqft.toLocaleString("en-IN")} sq ft`
    )
  })
})
