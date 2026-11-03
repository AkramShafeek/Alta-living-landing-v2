// ─────────────────────────────────────────────────────────────────────────
// Cart → a WhatsApp message.
//
// The enquiry does not post anywhere. It opens WhatsApp with the message
// already written, and the visitor presses send themselves — which means the
// conversation starts in their own thread, on their own number, with a record
// they keep. For a product whose promise is "a local human answers", that is
// closer to the promise than a form that returns "thanks, we'll be in touch".
//
// The text is plain and short on purpose. It is the first line of a real
// conversation, not a receipt, and whoever reads it is a person with a phone.
// ─────────────────────────────────────────────────────────────────────────

import type { CartItem } from "@/store/cartStore"
import { itemsByProperty } from "@/store/cartStore"

/** wa.me wants digits only — no +, no spaces, no dashes. */
const digitsOnly = (value: string): string => value.replace(/\D/g, "")

const formatINR = (value: number): string => `₹${value.toLocaleString("en-IN")}`

/**
 * The message body.
 *
 * Grouped by home, because a cart spanning two homes reads as nonsense flat.
 * The rate is named as monthly explicitly: every line in the cart is a monthly
 * figure, and an unlabelled number next to a room is the kind of thing that
 * gets read as a nightly one.
 */
export function enquiryMessage(items: CartItem[], name: string): string {
  const lines: string[] = []
  const who = name.trim()

  lines.push(
    who ? `Hi Alta — this is ${who}.` : "Hi Alta —",
    "",
    items.length === 1
      ? "I'd like to enquire about this:"
      : `I'd like to enquire about these ${items.length}:`,
    ""
  )

  for (const group of itemsByProperty(items)) {
    lines.push(`*${group.propertyName}* — ${group.area}`)

    for (const item of group.items) {
      const what = item.kind === "entire" ? "Entire home" : item.unitName
      lines.push(`• ${what} — ${formatINR(item.monthlyRate)}/month`)
    }
    lines.push("")
  }

  lines.push("Could you tell me what's still open, and from when?")

  return lines.join("\n")
}

/**
 * The link that opens WhatsApp with the message ready.
 *
 * `wa.me` rather than `api.whatsapp.com`: it is the short form Meta documents
 * for exactly this, and it resolves to the app on a phone and to WhatsApp Web
 * on a desktop without us having to detect which.
 */
export function whatsappLink(
  phone: string,
  items: CartItem[],
  name: string
): string {
  return whatsappTextLink(phone, enquiryMessage(items, name))
}

/** The same link, for any ready-written message — every WhatsApp button. */
export function whatsappTextLink(phone: string, text: string): string {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(text)}`
}

// ─────────────────────────────────────────────────────────────────────────
// Contact form → a WhatsApp message.
//
// Same idea as the cart: nothing is posted anywhere. The form writes the
// first message of a real conversation and the visitor sends it from their
// own WhatsApp, so the reply lands in a thread they already have.
// ─────────────────────────────────────────────────────────────────────────

export type ContactEnquiry = {
  name: string
  phone: string
  email: string
  /** Which home the enquiry is about, when sent from a property page. */
  subject?: string
  area: string
  moveIn: string
  stay: string
  who: string
  message: string
}

/**
 * The message body. Only filled-in fields appear, one per line, so a short
 * enquiry reads as a short message rather than a form with blanks.
 */
export function contactMessage(enquiry: ContactEnquiry): string {
  const who = enquiry.name.trim()
  const lines = [who ? `Hi Alta — this is ${who}.` : "Hi Alta —", ""]

  const fields: [string, string | undefined][] = [
    ["About", enquiry.subject],
    ["Area", enquiry.area],
    ["Move-in", enquiry.moveIn],
    ["How long", enquiry.stay],
    ["Who's moving in", enquiry.who],
    ["Phone", enquiry.phone],
    ["Email", enquiry.email],
  ]
  const filled = fields.filter(([, value]) => value && value.trim() !== "")
  if (filled.length > 0) {
    lines.push("I'm looking for a home:")
    for (const [label, value] of filled) lines.push(`• ${label}: ${value!.trim()}`)
  }

  const message = enquiry.message.trim()
  if (message) lines.push("", message)

  return lines.join("\n")
}
