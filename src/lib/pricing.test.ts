import { describe, expect, it } from "vitest"
import type { Unit } from "@/content/schema"
import { basisFor, quote, stayNights } from "./pricing"

const unit = (over: Partial<Unit> & Pick<Unit, "id" | "name">): Unit => ({
  propertyId: "prop_001",
  kind: "room",
  hasDesk: false,
  hasAc: false,
  hasBalcony: false,
  maxOccupancy: 2,
  monthlyRate: 0,
  nightlyRate: 0,
  deposit: 0,
  photoIds: [],
  status: "available",
  note: "",
  ...over,
})

const master = unit({ id: "u1", name: "Master bedroom", monthlyRate: 18000, nightlyRate: 2000, deposit: 36000 })
const courtyard = unit({ id: "u2", name: "Courtyard bedroom", monthlyRate: 13500, nightlyRate: 1500, deposit: 27000 })
const whole = unit({ id: "ux", name: "Entire property", kind: "entire", monthlyRate: 30000, nightlyRate: 3200, deposit: 60000 })

describe("basis", () => {
  it("prices a month or more monthly, shorter stays nightly", () => {
    expect(basisFor({ months: 1 })).toBe("monthly")
    expect(basisFor({ nights: 30 })).toBe("monthly")
    expect(basisFor({ nights: 29 })).toBe("nightly")
    expect(stayNights({ months: 3 })).toBe(90)
  })
})

describe("quote v1 — rate × duration, summed", () => {
  it("prices a single room", () => {
    const q = quote([master], { months: 2 })
    expect(q.basis).toBe("monthly")
    expect(q.lines).toHaveLength(1)
    expect(q.lines[0]).toMatchObject({ rate: 18000, qty: 2, subtotal: 36000 })
    expect(q.total).toBe(36000)
  })

  it("adds rooms together", () => {
    const q = quote([master, courtyard], { months: 1 })
    expect(q.subtotal).toBe(31500)
    expect(q.total).toBe(31500)
    expect(q.deposit).toBe(63000)
  })

  it("prices the whole home below the sum of its rooms", () => {
    const rooms = quote([master, courtyard], { months: 1 })
    const entire = quote([whole], { months: 1 })
    expect(entire.total).toBe(30000)
    // The discount lives in the entire unit's own rate, not in a pricing rule.
    expect(entire.total).toBeLessThan(rooms.total)
  })

  it("uses nightly rates for short stays", () => {
    const q = quote([whole], { nights: 5 })
    expect(q.basis).toBe("nightly")
    expect(q.total).toBe(16000)
  })

  it("carries no discounts in v1", () => {
    expect(quote([master, courtyard], { months: 6 }).discounts).toEqual([])
  })

  it("flags a short stay rather than rejecting it", () => {
    expect(quote([master], { nights: 3 }, 7).minStayMet).toBe(false)
    expect(quote([master], { nights: 9 }, 7).minStayMet).toBe(true)
  })

  it("prices an empty selection at zero", () => {
    const q = quote([], { months: 1 })
    expect(q.total).toBe(0)
    expect(q.lines).toEqual([])
  })
})
