// The cart's own logic: membership, totals, grouping, and the message that
// goes out over WhatsApp.
//
// The store persists to localStorage, which does not exist under vitest's node
// environment — zustand's persist middleware swallows that, so the store still
// works in memory and these run without a browser.

import { beforeEach, describe, expect, it } from "vitest"
import {
  cartTotal,
  isInCart,
  itemsByProperty,
  useCartStore,
  type CartItem,
  type PropertyRef,
} from "../cartStore"
import type { UnitDetail } from "../types"
import { enquiryMessage, whatsappLink } from "@/lib/whatsapp"

const loft: PropertyRef = {
  id: "prop_001",
  slug: "indiranagar-garden-loft",
  name: "The Garden Loft",
  area: "Indiranagar, Bangalore",
  heroUrl: "/homes/1.jpg",
  heroAlt: "Living room",
}

const goa: PropertyRef = {
  id: "prop_002",
  slug: "assagao-house",
  name: "Assagao House",
  area: "Assagao, Goa",
}

const unit = (over: Partial<UnitDetail> = {}): UnitDetail =>
  ({
    id: "unit_001a",
    kind: "room",
    name: "Master bedroom",
    monthlyRate: 18000,
    nightlyRate: 2000,
    deposit: 36000,
    maxOccupancy: 2,
    status: "available",
    note: "",
    hasDesk: true,
    hasAc: false,
    hasBalcony: false,
    photos: [],
    ...over,
  }) as UnitDetail

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe("add / remove / toggle", () => {
  it("keeps the property id and slug, so the room can be traced home", () => {
    // The whole reason both are stored: after a reload the cart is the only
    // thing that knows which home a stray room belongs to.
    useCartStore.getState().add(unit(), loft)

    const [item] = useCartStore.getState().items
    expect(item.propertyId).toBe("prop_001")
    expect(item.propertySlug).toBe("indiranagar-garden-loft")
    expect(item.propertyName).toBe("The Garden Loft")
    expect(item.area).toBe("Indiranagar, Bangalore")
  })

  it("falls back to the property hero when a unit has no photo of its own", () => {
    useCartStore.getState().add(unit(), loft)
    expect(useCartStore.getState().items[0].photoUrl).toBe("/homes/1.jpg")
  })

  it("prefers the unit's own first photo", () => {
    useCartStore
      .getState()
      .add(
        unit({
          photos: [
            { id: "ph_1", url: "/homes/9.jpg", alt: "Room" },
          ] as UnitDetail["photos"],
        }),
        loft
      )
    expect(useCartStore.getState().items[0].photoUrl).toBe("/homes/9.jpg")
  })

  it("adding the same unit twice does not duplicate the line", () => {
    const store = useCartStore.getState()
    store.add(unit(), loft)
    store.add(unit(), loft)
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it("toggle adds then removes", () => {
    const store = useCartStore.getState()
    store.toggle(unit(), loft)
    expect(useCartStore.getState().items).toHaveLength(1)

    store.toggle(unit(), loft)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it("removes by unit id", () => {
    const store = useCartStore.getState()
    store.add(unit(), loft)
    store.add(unit({ id: "unit_001b", name: "Courtyard bedroom" }), loft)

    store.remove("unit_001a")
    expect(useCartStore.getState().items.map((i) => i.unitId)).toEqual([
      "unit_001b",
    ])
  })
})

describe("syncFromProperty", () => {
  it("refreshes a rate that moved in the sheet", () => {
    // A stale rate is the one failure here that reaches a person — it goes out
    // over WhatsApp as a number we then cannot honour.
    const store = useCartStore.getState()
    store.add(unit(), loft)

    store.syncFromProperty(loft, [unit({ monthlyRate: 19500 })])
    expect(useCartStore.getState().items[0].monthlyRate).toBe(19500)
  })

  it("drops a unit that has left the catalog", () => {
    const store = useCartStore.getState()
    store.add(unit(), loft)

    store.syncFromProperty(loft, [])
    expect(useCartStore.getState().items).toEqual([])
  })

  it("leaves other properties' lines alone", () => {
    const store = useCartStore.getState()
    store.add(unit(), loft)
    store.add(unit({ id: "unit_002a", name: "Sea room" }), goa)

    store.syncFromProperty(loft, [])
    expect(useCartStore.getState().items.map((i) => i.unitId)).toEqual([
      "unit_002a",
    ])
  })

  it("keeps the same objects when nothing changed", () => {
    // Returning fresh objects every render would make the effect that calls
    // this re-run forever.
    const store = useCartStore.getState()
    store.add(unit(), loft)
    const before = useCartStore.getState().items

    store.syncFromProperty(loft, [unit()])
    expect(useCartStore.getState().items).toBe(before)
  })

  it("keeps the original addedAt", () => {
    const store = useCartStore.getState()
    store.add(unit(), loft)
    const added = useCartStore.getState().items[0].addedAt

    store.syncFromProperty(loft, [unit({ monthlyRate: 20000 })])
    expect(useCartStore.getState().items[0].addedAt).toBe(added)
  })
})

describe("derived reads", () => {
  const items: CartItem[] = [
    {
      unitId: "u1",
      unitName: "Master bedroom",
      kind: "room",
      monthlyRate: 18000,
      nightlyRate: 2000,
      photoAlt: "",
      propertyId: "prop_001",
      propertySlug: "garden-loft",
      propertyName: "The Garden Loft",
      area: "Indiranagar, Bangalore",
      addedAt: "2026-09-19T00:00:00.000Z",
    },
    {
      unitId: "u2",
      unitName: "Sea room",
      kind: "room",
      monthlyRate: 22000,
      nightlyRate: 2600,
      photoAlt: "",
      propertyId: "prop_002",
      propertySlug: "assagao-house",
      propertyName: "Assagao House",
      area: "Assagao, Goa",
      addedAt: "2026-09-19T00:00:00.000Z",
    },
  ]

  it("totals the monthly rates", () => {
    expect(cartTotal(items)).toBe(40000)
    expect(cartTotal([])).toBe(0)
  })

  it("reports membership", () => {
    expect(isInCart(items, "u1")).toBe(true)
    expect(isInCart(items, "u9")).toBe(false)
  })

  it("groups by home so two cities do not read as one place", () => {
    const groups = itemsByProperty(items)
    expect(groups).toHaveLength(2)
    expect(groups[0].propertyName).toBe("The Garden Loft")
    expect(groups[1].items[0].unitName).toBe("Sea room")
  })

  it("keeps one home's rooms together in a single group", () => {
    const together = [items[0], { ...items[1], propertyId: "prop_001" }]
    expect(itemsByProperty(together)).toHaveLength(1)
  })
})

describe("the WhatsApp message", () => {
  const one: CartItem[] = [
    {
      unitId: "u1",
      unitName: "Master bedroom",
      kind: "room",
      monthlyRate: 18000,
      nightlyRate: 2000,
      photoAlt: "",
      propertyId: "prop_001",
      propertySlug: "garden-loft",
      propertyName: "The Garden Loft",
      area: "Indiranagar, Bangalore",
      addedAt: "2026-09-19T00:00:00.000Z",
    },
  ]

  it("names the sender when they gave a name", () => {
    expect(enquiryMessage(one, "Anjali")).toMatch(/this is Anjali/)
  })

  it("still reads as a sentence with no name", () => {
    const text = enquiryMessage(one, "   ")
    expect(text).not.toMatch(/this is/)
    expect(text.startsWith("Hi Alta —")).toBe(true)
  })

  it("labels the rate as monthly, so it cannot be read as nightly", () => {
    expect(enquiryMessage(one, "A")).toMatch(/₹18,000\/month/)
  })

  it("calls the whole home what it is, not by its row name", () => {
    const whole = [
      { ...one[0], kind: "entire" as const, unitName: "Entire property" },
    ]
    expect(enquiryMessage(whole, "A")).toMatch(/Entire home/)
  })

  it("groups by home and names the area", () => {
    const text = enquiryMessage(one, "A")
    expect(text).toMatch(/\*The Garden Loft\* — Indiranagar, Bangalore/)
  })

  it("builds a wa.me link with digits only and an encoded body", () => {
    const link = whatsappLink("+91 90000 00001", one, "Anjali")
    expect(link.startsWith("https://wa.me/919000000001?text=")).toBe(true)
    expect(decodeURIComponent(link.split("text=")[1])).toMatch(/Master bedroom/)
  })
})
