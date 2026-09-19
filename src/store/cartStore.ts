// ─────────────────────────────────────────────────────────────────────────
// The enquiry cart.
//
// Separate from `catalogStore` on purpose. The catalog is server state — read
// only, replaced wholesale on every load, owned by the sheet. This is the one
// piece of state on the site the *visitor* owns: it survives reloads, it must
// never be overwritten by a catalog refresh, and it outlives the page it was
// filled on.
//
// ── Why every item carries a copy of its data ───────────────────────────
//
// An item stores the unit's name, rate and photo rather than only its id. That
// is denormalisation, and it is deliberate: the floating bar renders on the
// listings page, on the home page, and on the first paint after a reload — none
// of which have that unit's property loaded. Keeping only ids would mean
// fetching the whole catalog before a cart of one room could draw itself.
//
// The cost is that a stored rate is a snapshot and the sheet may have moved
// since. `syncFromProperty` closes that: whenever a property page renders real
// units, it refreshes any cart line belonging to it. Quoting yesterday's price
// over WhatsApp is the one failure here that reaches a person.
//
// `propertyId` and `propertySlug` are both kept. The id is the relation; the
// slug is what the router addresses, and after a reload the cart is the only
// thing that knows which home a stray room belongs to.
// ─────────────────────────────────────────────────────────────────────────

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { UnitDetail } from "./types"

export type CartItem = {
  /** Unique across the catalog — unit ids are global, not per property. */
  unitId: string
  unitName: string
  kind: "room" | "entire"
  monthlyRate: number
  nightlyRate: number

  /** The unit's first photo, or the property's hero when it has none. */
  photoUrl?: string
  photoAlt: string

  propertyId: string
  propertySlug: string
  propertyName: string
  /** "Indiranagar, Bangalore" — for the message, so it reads without a lookup. */
  area: string

  addedAt: string
}

/** What a caller needs to know about a home to put one of its units in. */
export type PropertyRef = {
  id: string
  slug: string
  name: string
  area: string
  /** Fallback image for a unit with no photo of its own. */
  heroUrl?: string
  heroAlt?: string
}

type CartState = {
  items: CartItem[]

  add: (unit: UnitDetail, property: PropertyRef) => void
  remove: (unitId: string) => void
  toggle: (unit: UnitDetail, property: PropertyRef) => void
  clear: () => void

  /**
   * Refresh the lines belonging to one property from live data.
   *
   * Called by the property page once its units are on screen. A unit that has
   * disappeared from the catalog is dropped rather than kept at a price nobody
   * can honour.
   */
  syncFromProperty: (property: PropertyRef, units: UnitDetail[]) => void
}

const toItem = (unit: UnitDetail, property: PropertyRef): CartItem => {
  const photo = unit.photos[0]

  return {
    unitId: unit.id,
    unitName: unit.name,
    kind: unit.kind,
    monthlyRate: unit.monthlyRate,
    nightlyRate: unit.nightlyRate,
    photoUrl: photo?.url ?? property.heroUrl,
    photoAlt:
      photo?.alt ?? property.heroAlt ?? `${unit.name} at ${property.name}`,
    propertyId: property.id,
    propertySlug: property.slug,
    propertyName: property.name,
    area: property.area,
    addedAt: new Date().toISOString(),
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (unit, property) => {
        // Adding twice is a no-op rather than a duplicate line: the cart is a
        // set of units, and a unit cannot be enquired about two ways at once.
        if (get().items.some((item) => item.unitId === unit.id)) return
        set((state) => ({ items: [...state.items, toItem(unit, property)] }))
      },

      remove: (unitId) => {
        set((state) => ({
          items: state.items.filter((item) => item.unitId !== unitId),
        }))
      },

      toggle: (unit, property) => {
        const present = get().items.some((item) => item.unitId === unit.id)
        if (present) get().remove(unit.id)
        else get().add(unit, property)
      },

      clear: () => set({ items: [] }),

      syncFromProperty: (property, units) => {
        const live = new Map(units.map((unit) => [unit.id, unit]))

        set((state) => {
          let changed = false

          const next = state.items.flatMap((item) => {
            if (item.propertyId !== property.id) return [item]

            const unit = live.get(item.unitId)
            if (!unit) {
              changed = true
              return []
            }

            const fresh = { ...toItem(unit, property), addedAt: item.addedAt }

            // Compared field by field so an unchanged unit does not produce a
            // new object every render and restart the loop.
            const same =
              fresh.unitName === item.unitName &&
              fresh.monthlyRate === item.monthlyRate &&
              fresh.nightlyRate === item.nightlyRate &&
              fresh.photoUrl === item.photoUrl &&
              fresh.propertySlug === item.propertySlug &&
              fresh.propertyName === item.propertyName &&
              fresh.area === item.area

            if (same) return [item]

            changed = true
            return [fresh]
          })

          return changed ? { items: next } : state
        })
      },
    }),
    {
      name: "alta.cart.v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only the items are worth keeping; the actions are rebuilt on load.
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// ── derived reads ───────────────────────────────────────────────────────

export const isInCart = (items: CartItem[], unitId: string): boolean =>
  items.some((item) => item.unitId === unitId)

export const cartTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.monthlyRate, 0)

/**
 * Cart lines grouped by home, in the order the homes first appear.
 *
 * The usual cart is one room, but nothing stops someone collecting rooms from
 * two cities, and a flat list would read as if they were all the same place.
 */
export function itemsByProperty(items: CartItem[]): {
  propertyId: string
  propertyName: string
  propertySlug: string
  area: string
  items: CartItem[]
}[] {
  const groups = new Map<string, CartItem[]>()

  for (const item of items) {
    const bucket = groups.get(item.propertyId)
    if (bucket) bucket.push(item)
    else groups.set(item.propertyId, [item])
  }

  return [...groups.entries()].map(([propertyId, group]) => ({
    propertyId,
    propertyName: group[0].propertyName,
    propertySlug: group[0].propertySlug,
    area: group[0].area,
    items: group,
  }))
}
