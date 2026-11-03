// ─────────────────────────────────────────────────────────────────────────
// Alta Living — site content
// Single source of truth for copy/data so section components stay generic
// and presentational. Copy follows the developer content guide (Nov 2026):
// South Bengaluru, real numbers only.
//
// The rule for every figure in this file: publish only what can be backed
// up. Guests check. Where the guide left a number in [brackets] for the
// owner to supply — rating, review count, guests hosted, occupancy, fix
// times — it is absent here rather than guessed, and the section that would
// show it shows something true instead. Each one is marked "TO FILL".
//
// The home counts come from the client's portfolio sheet
// (Alta Living Data/Alta_Living_Properties - Properties.csv).
// ─────────────────────────────────────────────────────────────────────────

/** The business line: enquiries, the cart, every WhatsApp button. */
export const contact = {
  name: "Keerthan",
  role: "Co-founder & CEO, Alta Living",
  phone: "+91 79752 53536",
  email: "Keerthan@altaliving.in",
}

/**
 * The number the enquiry cart and every "WhatsApp us" button open.
 * Kept as its own export because the cart imports it by this name.
 */
export const enquiryWhatsApp = contact.phone

/**
 * Homes per area, from the portfolio sheet. Cedar (Bellandur) and the
 * resort are outside these four, so they are not counted in "South
 * Bengaluru".
 *
 *   JP Nagar             — Harbour (3)
 *   Bannerghatta Rd      — Skyline (1)
 *   Hulimavu & Arekere   — Meridian (32), Linden (8), Lantern (9)
 *   Kanakapura Rd        — Wren (2), Juniper (1)
 */
const homesIn = { jpNagar: 3, bannerghatta: 1, hulimavu: 49, kanakapura: 3 }
const southHomes = Object.values(homesIn).reduce((a, b) => a + b, 0) // 56

/** Rounded down to the nearest ten, so "50+" stays true as homes come and go. */
export const homesLabel = `${Math.floor(southHomes / 10) * 10}+`

export const tickerItems = [
  `${homesLabel} homes in south bengaluru`,
  "move in with just a suitcase",
  "no brokerage. ever.",
  "stay 3 nights or 11 months",
  "housekeeping included",
  "every home checked in person before it goes live",
]

export const heroContent = {
  eyebrow: "homes by alta living",
  headline: "Your next home is already set up.",
  body: "Fully furnished, professionally run homes in South Bengaluru, for a few nights or a few years. No brokers. No landlord drama. No surprises.",
  ctaLabel: "Find a home",
  whatsappLabel: "Talk to us on WhatsApp",
  /** The contact form's area picker. */
  areas: [
    "JP Nagar",
    "Bannerghatta Rd",
    "Hulimavu–Arekere",
    "Vasanthapura",
    "Not sure, suggest one",
  ],
}

/** The messy house-hunt pinned behind the hero. */
export const houseHuntNotes = [
  "JP Nagar\nbroker wants 1 month fee",
  "Bannerghatta Rd\n10-month deposit?!",
  "Hulimavu\nlandlord: no bachelors",
  "Arekere\n'furnished' = 1 fan",
  "Budget\n₹25–35k / month",
  "Kanakapura Rd\nvisited ✓ ★ actually nice",
]

/** The promise block — the scroll-triggered scatter reveal. */
export const scatterReveal = {
  eyebrow: "no surprises, ever",
  headline: "What you see is what you get. What we quote is what you pay.",
  body: "Every home is set up, checked and photographed by our own team. No stock photos, no “similar unit”. Short stays are all-inclusive. Long stays get one clear monthly bill: rent, maintenance, Wi-Fi and housekeeping, all listed upfront, with electricity at the actual meter reading. That's it. And when something breaks, a real person from our team picks up.",
  ctaLabel: "See all homes",
}

/** The pinboard of homes on the landing page. */
export const pinboard = {
  eyebrow: "the pinboard",
  headline: "Homes available now",
  ctaLabel: "See this home",
  allLabel: "See all homes",
}

export const statsBar = {
  title: "Alta Living — by the numbers",
  edition: "Bengaluru · est. 2022",
}

/**
 * By the numbers. TO FILL, from the guide, once there is data behind them:
 * average rating from N reviews (Airbnb, all three host accounts), guests
 * hosted since 2022, occupancy over the last 90 days. Until then these four
 * are the ones that are true today.
 */
export const numbers = [
  { value: homesLabel, label: "Homes across\nSouth Bengaluru" },
  { value: "4", label: "Neighbourhoods,\none team on call" },
  { value: "100%", label: "Homes checked in\nperson before going live" },
  { value: "0", label: "Brokerage,\never" },
]

export type Reason = {
  label: string
  title: string
  body: string
  /** A proof line under the body. Optional: only where there is proof. */
  figure?: string
}

export const reasons: Reason[] = [
  {
    label: "Serviced",
    title: "Someone's already looking after the place",
    body: "Housekeeping, fresh linen, plumbing, electrical and the gas cylinder are all handled by a team that knows the home. You live there. We run it.",
  },
  {
    label: "One bill",
    title: "You'll know the full cost on day one",
    body: "Rent, maintenance, Wi-Fi and housekeeping go on one monthly bill, with electricity at actuals. Deposit and exit terms are on page one of the agreement, not buried on page nine.",
    figure: "0 — hidden charges on your bill",
  },
  {
    label: "No broker",
    title: "You deal with us, start to finish",
    body: "No brokerage, no middlemen, no landlord who disappears after you've paid. One team, one number, from your first message to your move-out.",
  },
]

export const checks = [
  "Water pressure on every tap, hot and cold",
  "Power backup checked, and clearly marked on the listing if a home doesn't have it",
  "Wi-Fi speed tested from the bed and the desk",
  "Every appliance run once: geyser, fridge, washing machine, cooktop",
  "Locks, door security and CCTV checked",
  "Deep cleaned, with three fresh linen sets per bedroom",
]

/**
 * The proof strip. TO FILL from the guide when measured: average hours to
 * fix a reported issue, average days from first message to move-in, share
 * of long stays that renew. Only the provable ones are here.
 */
export const whoWeAreStats = [
  { value: "100%", label: "Homes checked in person before going live" },
  { value: "0", label: "Hidden charges on your bill" },
  { value: homesLabel, label: "Homes we run ourselves, not just list" },
  { value: "1", label: "Team, one number, first message to move-out" },
]

export const whoWeAre = {
  eyebrow: "who we are",
  title: "We run the homes. We don't just list them.",
}

export const founder = {
  quote: `I started Alta with one furnished flat on Airbnb and a lot of stubbornness. Now we look after ${homesLabel} homes, and the rule hasn't changed: if I wouldn't live in it, it doesn't go live. Our team visits every home, fixes it, cleans it and stays on call for it. Renting in Bengaluru shouldn't feel like a fight with a landlord. With us, it doesn't.`,
  name: contact.name,
  role: contact.role,
}

export type Testimonial = {
  quote: string
  name: string
  location: string
  rating: number
  tone: "blue" | "peach" | "sage" | "lilac" | "butter"
}

/**
 * Real reviews only — the template's eight were filler and have gone.
 * TO FILL: 6–8 from the Airbnb accounts (first name + city, as shown
 * publicly), one per claim: exactly like the photos, a quick late fix, a long
 * stay that never thought about bills, a work-from-home setup, a couple, a
 * company booking. The reviews section stays hidden while both rows are
 * empty.
 */
export const testimonialsRowA: Testimonial[] = []
export const testimonialsRowB: Testimonial[] = []

export const reviewsSection = {
  eyebrow: "from our guests",
  title: "Don't take our word for it.",
}

export type Cluster = {
  name: string
  count: string
  /** Map position in %, or absent for a place off this map. */
  x?: number
  y?: number
}

export const areas = {
  eyebrow: "where we are",
  title: "South Bengaluru, done properly.",
  body: "We stay close on purpose. Every home sits within a short ride of our team, so a broken geyser gets fixed today, not “this week”. It's also a short commute to the offices on Bannerghatta Road, JP Nagar and Electronic City.",
  footer: `${homesLabel} homes · 4 neighbourhoods · 1 team`,
}

export const clusters: Cluster[] = [
  { name: "JP Nagar", count: `${homesIn.jpNagar} homes`, x: 34, y: 30 },
  { name: "Bannerghatta Rd / Bilekahalli", count: `${homesIn.bannerghatta} home`, x: 62, y: 26 },
  { name: "Hulimavu & Arekere", count: `${homesIn.hulimavu} homes`, x: 64, y: 66 },
  { name: "Kanakapura Rd (Vasanthapura)", count: `${homesIn.kanakapura} homes`, x: 24, y: 74 },
  // Out of town, so listed but not pinned on the city map.
  { name: "Ambara Resort", count: "weekend escape" },
]

export const contactSection = {
  eyebrow: "talk to a person",
  title: "Tell us what you need. We'll find the home.",
  submitLabel: "Find my home",
  footnote: "We reply the same day, usually within the hour.",
  stayLengths: ["A few nights", "1–3 months", "6–11 months", "1 year+"],
  whoOptions: ["Just me", "Couple", "Our company's team"],
  messagePlaceholder: "Budget, pets, parking, work-from-home needs…",
}

export const closingCta = {
  title: "The house hunt ends here.",
  body: "Send us your dates and your area. We'll send you homes that are ready to move into.",
  ctaLabel: "Find a home",
}

export const forCompanies = {
  eyebrow: "for companies",
  title: "Moving people to Bengaluru? We'll have homes ready.",
  body: "Furnished homes for new joiners, interns and project teams, ready from day one. One point of contact, one monthly invoice, and someone on call if anything breaks. Your people settle in. Your HR team doesn't have to deal with it.",
  ctaLabel: "Talk to our corporate team",
  whatsappText: "Hi Alta, I'm looking for furnished homes for our team in Bengaluru.",
}

export const listYourHome = {
  eyebrow: "for owners",
  title: "Own a home in South Bengaluru? Let us run it.",
  body: "We furnish it, list it, fill it and look after it: guests, housekeeping, repairs, rent collection, all of it. You get a well-kept property and a payout every month, without the calls at midnight.",
  bullets: [
    "Professional setup and photography",
    "Vetted guests and tenants",
    "Housekeeping and maintenance by our own team",
    "Monthly statement, no chasing",
  ],
  ctaLabel: "Get a free estimate for your property",
  whatsappText: "Hi Alta, I own a home in South Bengaluru and would like a free estimate.",
}

/**
 * FAQ. Answers are the guide's own words. Where it left a number in
 * brackets (deposit months, minimum nights, pet policy), the answer says
 * only what is certain. TO FILL those three when decided.
 */
export const faqs = [
  { q: "Is there a brokerage fee?", a: "No. You deal directly with Alta Living." },
  {
    q: "What's included in the rent?",
    a: "Short stays: everything. Long stays: rent, maintenance (water included), Wi-Fi and housekeeping, with electricity at the actual meter reading.",
  },
  {
    q: "How much is the deposit?",
    a: "Long stays carry a refundable deposit, returned within 14 days of moving out. A one-month exit charge covers repainting and restoration. We tell you both upfront, before you sign.",
  },
  {
    q: "What's the minimum stay?",
    a: "It depends on the home, and we'll tell you when you enquire. Long-stay agreements run 11 months.",
  },
  {
    q: "Can couples, friends or pets stay?",
    a: "Extra occupants and pets need written approval first. Ask us about the home you have in mind.",
  },
  { q: "Check-in and check-out?", a: "Check-in from 2 PM, check-out by 11 AM." },
  { q: "What if something breaks?", a: "Message us. Our team is on it the same day." },
]

export type FooterLink = { label: string; href: string }

export const footer = {
  tagline: "Serviced homes · South Bengaluru",
  copyright: "© 2026 Alta Living · Bengaluru",
}

export const footerLinks: Record<"homes" | "company" | "guests", FooterLink[]> = {
  homes: [
    { label: "JP Nagar", href: "/listings" },
    { label: "Bannerghatta Rd", href: "/listings" },
    { label: "Hulimavu & Arekere", href: "/listings" },
    { label: "Vasanthapura", href: "/listings" },
    { label: "Ambara Resort", href: "/listings" },
  ],
  company: [
    { label: "About us", href: "/#who-we-are" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "For companies", href: "/#for-companies" },
    { label: "List your home", href: "/#list-your-home" },
    { label: "Careers", href: `mailto:${contact.email}?subject=Careers%20at%20Alta%20Living` },
  ],
  guests: [
    { label: "House rules", href: "/#faq" },
    { label: "Cancellations", href: "/#faq" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" },
  ],
}

/** Kept for the contact card's (currently hidden) left column. */
export const contactRows = [
  { k: "Email", v: contact.email },
  { k: "WhatsApp", v: contact.phone },
  { k: "Hours", v: "8am – 10pm, all week" },
]

/** Two links beside the "Find a home" button, which covers Homes. The other
 *  sections are a footer link away. */
export const navItems = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
  { label: "Find a home", href: "/listings" },
]

// ─────────────────────────────────────────────────────────────────────────
// Pricing tiers — PricingSection is not on the page (commented out in
// Home.tsx). Left as it was; its figures are template filler and must be
// rewritten before that section is ever shown again.
// ─────────────────────────────────────────────────────────────────────────

export const pricingTiers = [
  {
    name: "Short Stay",
    price: "₹ 3,200",
    unit: "/ night",
    tone: "blue" as const,
    description: "1–13 nights. Hotel replacement for a work trip.",
    features: [
      "Cleaning + linen change on arrival",
      "Utilities and 200 Mbps Wi-Fi",
      "Local host on call, 8am–10pm",
    ],
    cta: "Enquire",
    featured: false,
  },
  {
    name: "Extended Stay",
    price: "₹ 30,000",
    unit: "/ month",
    tone: "accent" as const,
    description:
      "14 nights and up. Furnished, serviced, no lock-in beyond 30 days.",
    features: [
      "Fortnightly deep clean",
      "Utilities, Wi-Fi and maintenance included",
      "Move-in within 3 days of enquiry",
      "Switch homes once, free",
    ],
    cta: "Enquire",
    featured: true,
    badge: "Most booked",
  },
  {
    name: "Corporate",
    price: "On request",
    unit: "",
    tone: "sage" as const,
    description: "Three or more units, invoiced monthly to your company.",
    features: [
      "GST invoicing and single point of contact",
      "Rolling inventory across all 47 homes",
      "Relocation support for new joiners",
    ],
    cta: "Talk to us",
    featured: false,
  },
]
