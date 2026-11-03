import { describe, expect, it } from "vitest"
import { contactMessage, whatsappLink, whatsappTextLink } from "./whatsapp"
import { enquiryWhatsApp } from "@/content/site"

const blank = { name: "", phone: "", email: "", area: "", moveIn: "", stay: "", who: "", message: "" }

describe("whatsappTextLink", () => {
  it("opens the business line with the text encoded", () => {
    const href = whatsappTextLink(enquiryWhatsApp, "Hi Alta & co")
    expect(href).toBe("https://wa.me/917975253536?text=Hi%20Alta%20%26%20co")
  })
})

describe("contactMessage", () => {
  it("lists only the fields that were filled in", () => {
    const text = contactMessage({
      ...blank,
      name: "Priya",
      phone: "98450 12345",
      area: "JP Nagar",
      stay: "1–3 months",
      message: "Need parking for a scooter.",
    })
    expect(text).toBe(
      [
        "Hi Alta — this is Priya.",
        "",
        "I'm looking for a home:",
        "• Area: JP Nagar",
        "• How long: 1–3 months",
        "• Phone: 98450 12345",
        "",
        "Need parking for a scooter.",
      ].join("\n")
    )
  })

  it("names the home when sent from a property page", () => {
    expect(contactMessage({ ...blank, subject: "Alta Cedar Residences" })).toContain(
      "• About: Alta Cedar Residences"
    )
  })

  it("still reads as a greeting when nothing is filled in", () => {
    expect(contactMessage(blank)).toBe("Hi Alta —\n")
  })
})

describe("the cart", () => {
  it("sends enquiries to the business line", () => {
    const href = whatsappLink(enquiryWhatsApp, [], "Priya")
    expect(href.startsWith("https://wa.me/917975253536?text=")).toBe(true)
  })
})
