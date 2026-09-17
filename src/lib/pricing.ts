// ─────────────────────────────────────────────────────────────────────────
// Pricing engine.
//
// A pure function over resolved units — no store access, no React, no fetching
// — so pricing policy can change without touching a component, and so it can
// be tested by arithmetic alone.
//
// v1 is deliberately flat: rate × duration, summed. The discount seams exist
// and return zero, so adding multi-unit and long-stay tiers later changes one
// function each and no call site.
// ─────────────────────────────────────────────────────────────────────────

import type { Unit } from "@/content/schema"

export type Stay = { nights: number } | { months: number }

export type QuoteLine = {
  unitId: string
  name: string
  /** The per-period rate used, monthly or nightly depending on `basis`. */
  rate: number
  /** Number of periods — months or nights. */
  qty: number
  subtotal: number
}

export type Discount = {
  code: string
  label: string
  /** Always positive; subtracted from the subtotal. */
  amount: number
}

export type Quote = {
  basis: "monthly" | "nightly"
  lines: QuoteLine[]
  subtotal: number
  discounts: Discount[]
  total: number
  deposit: number
  /** A flag rather than a block — every enquiry is reviewed by a human. */
  minStayMet: boolean
  /** Nights equivalent of the stay, for the min-stay check and for display. */
  nights: number
}

const NIGHTS_PER_MONTH = 30

export const stayNights = (stay: Stay): number =>
  "months" in stay ? stay.months * NIGHTS_PER_MONTH : stay.nights

/**
 * Alta is a monthly-first product: any stay of a month or more is priced on the
 * monthly rate, and nightly is the short-stay fallback.
 */
export const basisFor = (stay: Stay): "monthly" | "nightly" =>
  "months" in stay || stay.nights >= NIGHTS_PER_MONTH ? "monthly" : "nightly"

// ── discount seams (v2) ──────────────────────────────────────────────────
// Both return 0 today. The whole-home price is set directly on the `entire`
// unit rather than derived here, so "maximum discount on the whole unit" needs
// no rule — it is just a cheaper line item.

export const multiUnitDiscount = (_unitCount: number, _subtotal: number): number => 0

export const durationDiscount = (_months: number, _subtotal: number): number => 0

export function quote(units: Unit[], stay: Stay, minStayNights = 1): Quote {
  const basis = basisFor(stay)
  const nights = stayNights(stay)
  const qty = basis === "monthly" ? Math.max(1, Math.round(nights / NIGHTS_PER_MONTH)) : nights

  const lines: QuoteLine[] = units.map((unit) => {
    const rate = basis === "monthly" ? unit.monthlyRate : unit.nightlyRate
    return { unitId: unit.id, name: unit.name, rate, qty, subtotal: rate * qty }
  })

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)

  const months = nights / NIGHTS_PER_MONTH
  const candidates: Discount[] = [
    { code: "multi_unit", label: "Multiple rooms", amount: multiUnitDiscount(units.length, subtotal) },
    { code: "long_stay", label: "Long stay", amount: durationDiscount(months, subtotal) },
  ]
  const discounts = candidates.filter((discount) => discount.amount > 0)

  const discounted = discounts.reduce((sum, discount) => sum + discount.amount, 0)

  return {
    basis,
    lines,
    subtotal,
    discounts,
    total: Math.max(0, subtotal - discounted),
    deposit: units.reduce((sum, unit) => sum + unit.deposit, 0),
    minStayMet: nights >= minStayNights,
    nights,
  }
}
