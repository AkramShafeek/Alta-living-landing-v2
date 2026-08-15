// ─────────────────────────────────────────────────────────────────────────
// Alta Living — site content
// Single source of truth for copy/data so section components stay generic
// and presentational. Sourced from the Alta Living design system (Bangalore
// only positioning) — see `Alta Living Landing Pages/_ds/.../readme.md`.
// ─────────────────────────────────────────────────────────────────────────

export type Property = {
  slug: string
  src: string
  area: string
  meta: string
  hook: string
  price: string
  priceUnit: string
  location: string
  bedType: string
  availability: string
  tilt: string
}

export const properties: Property[] = [
  {
    slug: "indiranagar-2bhk-courtyard",
    src: "/homes/1.jpg",
    area: "Indiranagar",
    meta: "2BHK · 12th Main",
    hook: "A quiet 2BHK above a courtyard, five minutes from 100ft Road.",
    price: "₹ 3,200",
    priceUnit: "per night",
    location: "Indiranagar",
    bedType: "2BHK",
    availability: "Available 1/3",
    tilt: "-2.5deg",
  },
  {
    slug: "koramangala-1bhk-studio",
    src: "/homes/2.jpg",
    area: "Koramangala",
    meta: "1BHK · 5th Block",
    hook: "Top-floor studio with the best morning light in 5th Block.",
    price: "₹ 2,800",
    priceUnit: "per night",
    location: "Koramangala",
    bedType: "1BHK",
    availability: "Available 2/3",
    tilt: "1.8deg",
  },
  {
    slug: "whitefield-3bhk-itpl",
    src: "/homes/3.jpg",
    area: "Whitefield",
    meta: "3BHK · ITPL Road",
    hook: "Three bedrooms built for long work stays, ten minutes from ITPL.",
    price: "₹ 4,100",
    priceUnit: "per night",
    location: "Whitefield",
    bedType: "3BHK",
    availability: "Available 1/2",
    tilt: "-1.4deg",
  },
  {
    slug: "hsr-2bhk-sector-2",
    src: "/homes/2.jpg",
    area: "HSR Layout",
    meta: "2BHK · Sector 2",
    hook: "Corner flat off 27th Main with a desk in every bedroom.",
    price: "₹ 3,000",
    priceUnit: "per night",
    location: "HSR Layout",
    bedType: "2BHK",
    availability: "Available 3/3",
    tilt: "2.4deg",
  },
  {
    slug: "jayanagar-3bhk-courtyard",
    src: "/homes/3.jpg",
    area: "Jayanagar",
    meta: "3BHK · 4th Block",
    hook: "Old-Bangalore house around an open courtyard, red-oxide floors.",
    price: "₹ 3,600",
    priceUnit: "per night",
    location: "Jayanagar",
    bedType: "3BHK",
    availability: "Available 1/2",
    tilt: "-2deg",
  },
  {
    slug: "indiranagar-studio-defence-colony",
    src: "/homes/1.jpg",
    area: "Indiranagar",
    meta: "Studio · Defence Colony",
    hook: "A compact studio for solo stays, one street from the metro.",
    price: "₹ 2,400",
    priceUnit: "per night",
    location: "Indiranagar",
    bedType: "Studio",
    availability: "Available 2/2",
    tilt: "1.2deg",
  },
]

export const tickerItems = [
  "47 homes live across bangalore",
  "new listing — indiranagar 2bhk",
  "average move-in time — 3 days",
  "92% occupancy this quarter",
  "fully furnished, fully photographed",
]

export const heroContent = {
  eyebrow: "curated stays from alta living",
  headline: "Looking for a house rental?",
  body: "Every Alta home is visited, measured and photographed by our team before it goes live. The price you see includes cleaning, utilities and Wi-Fi — and there is always a local human on call.",
  ctaLabel: "Browse Properties",
  areas: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"],
}

export const numbers = [
  { value: "47", label: "Properties across\nBangalore" },
  { value: "4.9★", label: "Average guest rating\nfrom 1,200+ reviews" },
  { value: "92%", label: "Occupancy rate\nacross the portfolio" },
  { value: "18,000+", label: "Guests hosted\nsince 2021" },
]

export const reasons = [
  {
    label: "Serviced",
    title: "Someone is already looking after the flat",
    body: "Cleaning, laundry pickup, plumbing, the gas cylinder — handled by the same four people who onboarded the home.",
    figure: "4 hrs — average time to fix a reported issue",
  },
  {
    label: "One price",
    title: "One number, everything already inside it",
    body: "Rent, cleaning, utilities and 200 Mbps Wi-Fi are quoted together. No deposit games, no invoice on checkout day.",
    figure: "0 — surprise charges billed in 2025",
  },
  {
    label: "One city",
    title: "Only homes we can reach in twenty minutes",
    body: "We stay inside five Bangalore clusters on purpose. It is why the portfolio is small and why a bulb gets changed the same day.",
    figure: "5 clusters — 47 homes, no other city",
  },
]

export const checks = [
  "Water pressure on every tap, hot and cold",
  "Mobile signal in each room, both major networks",
  "Backup power tested with the AC running",
  "Mattress age — nothing older than three years",
  "Street noise measured at 11pm, not at noon",
  "Desk height and a real task chair per bedroom",
]

export const whoWeAreStats = [
  { value: "100%", label: "Homes visited and measured by us before listing" },
  { value: "3 days", label: "Average move-in time from first enquiry" },
  { value: "96%", label: "Extended stays that renew at least once" },
  { value: "0", label: "Surprise invoices on checkout day" },
]

export const founder = {
  quote:
    "I hosted my first flat in Indiranagar in 2021 with one set of keys and a spreadsheet. We still run the portfolio the same way — I know which taps drip in which flat. We don't list anyone's home that hasn't been vetted in person by our team.",
  name: "Keerthan",
  role: "Founder · Alta Living",
}

export type Testimonial = {
  quote: string
  name: string
  location: string
  rating: number
  tone: "blue" | "peach" | "sage" | "lilac" | "butter"
}

export const testimonialsRowA: Testimonial[] = [
  { quote: "The Indiranagar flat was exactly the room in the photographs — same light, same plants. Nothing was staged.", name: "Priya", location: "Mumbai", rating: 5, tone: "blue" },
  { quote: "Geyser stopped working at 9pm. Someone was at the door by 9:40 with a replacement.", name: "Rohan", location: "Bangalore", rating: 5, tone: "peach" },
  { quote: "I stayed six weeks in Koramangala and never once thought about bills or cleaning. That is the whole product.", name: "Emma", location: "London", rating: 5, tone: "sage" },
]

export const testimonialsRowB: Testimonial[] = [
  { quote: "Moved in three days after the first call. The HSR flat had a real desk, not a dining chair pushed to a wall.", name: "Arjun", location: "Chennai", rating: 5, tone: "lilac" },
  { quote: "The Jayanagar house has red-oxide floors and a courtyard — I extended twice because of that courtyard.", name: "Sneha", location: "Pune", rating: 5, tone: "butter" },
  { quote: "Our team took two units in Whitefield. One invoice, one contact, zero follow-up needed from me.", name: "David", location: "Singapore", rating: 4, tone: "blue" },
]

export const clusters = [
  { name: "Indiranagar", count: "14 homes", x: 34, y: 38 },
  { name: "Koramangala", count: "11 homes", x: 52, y: 62 },
  { name: "HSR Layout", count: "9 homes", x: 66, y: 78 },
  { name: "Whitefield", count: "8 homes", x: 84, y: 34 },
  { name: "Jayanagar", count: "5 homes", x: 30, y: 76 },
]

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
    description: "14 nights and up. Furnished, serviced, no lock-in beyond 30 days.",
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

export const contactRows = [
  { k: "Email", v: "hello@altaliving.in" },
  { k: "Phone", v: "+91 80 4000 1212" },
  { k: "Office", v: "12th Main, Indiranagar" },
  { k: "Hours", v: "8am – 10pm, all week" },
]

export const footerLinks = {
  stays: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar"],
  company: ["About us", "How it works", "List your home", "Careers"],
  guests: ["House rules", "Cancellations", "FAQ", "Contact"],
}

export const socials = ["IG", "X", "IN", "✉"]

export const navItems = ["Listings", "About Us", "Contact"]
