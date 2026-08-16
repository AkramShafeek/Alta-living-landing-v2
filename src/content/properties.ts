// ─────────────────────────────────────────────────────────────────────────
// Alta Living — property listings (mock data)
//
// Shape follows the `Alta Property.dc.html` reference in
// `Alta Living Landing Pages/`, with prices and ratings stored as numbers so
// the listings filters can compare them; the `₹ 3,200` strings the UI shows
// are derived through `formatINR` rather than duplicated as separate fields.
// ─────────────────────────────────────────────────────────────────────────

export type Room = {
  name: string
  meta: string
  monthly: number
  available: boolean
}

export type PropertyFact = {
  value: string
  label: string
}

export type PropertyDetail = {
  slug: string
  /** Short label used by the property page's area switcher. */
  label: string
  title: string
  /** Filterable neighbourhood, matching one of `LOCATIONS`. */
  location: string
  area: string
  meta: string
  /** Handwritten margin note, in the founder's voice. */
  note: string
  hook: string
  body: string
  beds: string
  bedrooms: number
  size: string
  rating: number
  reviews: number
  nightly: number
  monthly: number
  availability: string
  host: string
  hostBlurb: string
  photos: string[]
  captions: string[]
  amenities: string[]
  facts: PropertyFact[]
  rooms: Room[]
}

export const formatINR = (value: number) => `₹ ${value.toLocaleString("en-IN")}`

export const properties: PropertyDetail[] = [
  {
    slug: "indiranagar-garden-loft",
    label: "Indiranagar",
    title: "The Garden Loft",
    location: "Indiranagar",
    area: "Indiranagar, Bangalore",
    meta: "2BHK · 12th Main · 940 sq ft · listed 2021",
    note: "my favourite kitchen in the portfolio ★",
    hook: "A quiet 2BHK above a courtyard, five minutes from 100ft Road.",
    body: "A quiet 2BHK above a courtyard, five minutes walk from 100ft Road. The living room takes the morning sun and the back bedroom stays dark until eight. Teak windows, marble floors, a working gas hob and a desk that fits two monitors.",
    beds: "2 BHK",
    bedrooms: 2,
    size: "940 sq ft",
    rating: 4.9,
    reviews: 86,
    nightly: 3200,
    monthly: 30000,
    availability: "Available 1/3",
    host: "Meera",
    hostBlurb: "Replies in under an hour · 8am–10pm · lives 6 min away",
    photos: ["/homes/1.jpg", "/homes/2.jpg", "/homes/3.jpg"],
    captions: ["Living room, north light", "Kitchen with gas hob", "Courtyard bedroom"],
    amenities: [
      "Fortnightly deep clean",
      "Utilities + 200 Mbps Wi-Fi",
      "Fully furnished",
      "Washer + dryer",
      "Filtered drinking water",
      "Covered parking",
    ],
    facts: [
      { value: "3 days", label: "move-in from enquiry" },
      { value: "6 min", label: "walk to metro" },
      { value: "2", label: "work desks" },
    ],
    rooms: [
      { name: "Master bedroom", meta: "en-suite bath · queen bed · desk", monthly: 18000, available: true },
      { name: "Courtyard bedroom", meta: "shared bath · double bed · desk", monthly: 13500, available: true },
      { name: "Study room", meta: "convertible, single occupancy", monthly: 8000, available: false },
    ],
  },
  {
    slug: "koramangala-fifth-block-studio",
    label: "Koramangala",
    title: "The Fifth Block Studio",
    location: "Koramangala",
    area: "Koramangala, Bangalore",
    meta: "1BHK · 5th Block · 610 sq ft · listed 2022",
    note: "best morning light we have ★",
    hook: "Top-floor studio with the best morning light in 5th Block.",
    body: "A top-floor studio one lane behind the 5th Block strip. Small on paper, generous in practice: a full kitchen, a two-seat balcony and no shared wall with anyone. Cafés and a Metro feeder stop are both under four minutes.",
    beds: "1 BHK",
    bedrooms: 1,
    size: "610 sq ft",
    rating: 4.8,
    reviews: 64,
    nightly: 2800,
    monthly: 26000,
    availability: "Available 2/3",
    host: "Nikhil",
    hostBlurb: "Replies in under an hour · 8am–10pm · lives 4 min away",
    photos: ["/homes/2.jpg", "/homes/3.jpg", "/homes/1.jpg"],
    captions: ["Studio, morning", "Balcony for two", "Bath, marble"],
    amenities: [
      "Weekly clean",
      "Utilities + 200 Mbps Wi-Fi",
      "Fully furnished",
      "Washing machine",
      "Balcony seating",
      "Two-wheeler parking",
    ],
    facts: [
      { value: "4 min", label: "to 5th block strip" },
      { value: "Top", label: "floor, no neighbours" },
      { value: "1", label: "work desk" },
    ],
    rooms: [
      { name: "Studio room", meta: "en-suite · queen bed · balcony", monthly: 26000, available: true },
      { name: "Loft nook", meta: "mezzanine single, shared bath", monthly: 9500, available: false },
    ],
  },
  {
    slug: "hsr-corner-flat",
    label: "HSR Layout",
    title: "The Corner Flat",
    location: "HSR Layout",
    area: "HSR Layout, Bangalore",
    meta: "2BHK · Sector 2 · 1,020 sq ft · listed 2023",
    note: "a desk in every bedroom ✓",
    hook: "Corner flat off 27th Main with a desk in every bedroom.",
    body: "Corner flat off 27th Main with windows on two sides, taken almost entirely by people who work from home. Both bedrooms have a full desk and a task chair, and the building runs on a diesel backup that has never dropped a call.",
    beds: "2 BHK",
    bedrooms: 2,
    size: "1,020 sq ft",
    rating: 4.9,
    reviews: 41,
    nightly: 3000,
    monthly: 28500,
    availability: "Available 3/3",
    host: "Rithika",
    hostBlurb: "Replies in under an hour · 8am–10pm · lives 9 min away",
    photos: ["/homes/3.jpg", "/homes/1.jpg", "/homes/2.jpg"],
    captions: ["Corner living room", "Bedroom one, desk", "Kitchen, evening"],
    amenities: [
      "Fortnightly deep clean",
      "Utilities + 300 Mbps Wi-Fi",
      "Fully furnished",
      "Power backup",
      "Two task chairs",
      "Covered parking",
    ],
    facts: [
      { value: "300", label: "mbps wired" },
      { value: "2", label: "desks + chairs" },
      { value: "24/7", label: "power backup" },
    ],
    rooms: [
      { name: "Corner bedroom", meta: "en-suite · queen bed · two windows", monthly: 16500, available: true },
      { name: "Second bedroom", meta: "shared bath · double bed · desk", monthly: 13000, available: true },
      { name: "Balcony study", meta: "single occupancy, desk only", monthly: 7500, available: true },
    ],
  },
  {
    slug: "whitefield-itpl-house",
    label: "Whitefield",
    title: "The ITPL House",
    location: "Whitefield",
    area: "Whitefield, Bangalore",
    meta: "3BHK · ITPL Road · 1,480 sq ft · listed 2022",
    note: "we put two teams in here ✓",
    hook: "Three bedrooms built for long work stays, ten minutes from ITPL.",
    body: "Three bedrooms built for long work stays, ten minutes from ITPL gate 2. Big enough for a team of three with a shared living room that actually gets used, and a kitchen stocked for people who cook on Sundays.",
    beds: "3 BHK",
    bedrooms: 3,
    size: "1,480 sq ft",
    rating: 4.7,
    reviews: 58,
    nightly: 4100,
    monthly: 38000,
    availability: "Available 1/2",
    host: "Sandeep",
    hostBlurb: "Replies in under two hours · 8am–10pm · lives 12 min away",
    photos: ["/homes/1.jpg", "/homes/3.jpg", "/homes/2.jpg"],
    captions: ["Shared living room", "Bedroom three", "Kitchen, stocked"],
    amenities: [
      "Weekly clean",
      "Utilities + 300 Mbps Wi-Fi",
      "Fully furnished",
      "Washer + dryer",
      "GST invoicing",
      "Two parking bays",
    ],
    facts: [
      { value: "10 min", label: "to itpl gate 2" },
      { value: "3", label: "bedrooms, 3 baths" },
      { value: "5", label: "corporate stays" },
    ],
    rooms: [
      { name: "Bedroom one", meta: "en-suite · king bed · desk", monthly: 17000, available: true },
      { name: "Bedroom two", meta: "en-suite · queen bed · desk", monthly: 14500, available: false },
      { name: "Bedroom three", meta: "shared bath · double bed", monthly: 11000, available: true },
    ],
  },
  {
    slug: "jayanagar-courtyard-house",
    label: "Jayanagar",
    title: "Courtyard House",
    location: "Jayanagar",
    area: "Jayanagar, Bangalore",
    meta: "3BHK · 4th Block · 1,260 sq ft · listed 2021",
    note: "red-oxide floors, old bangalore ★",
    hook: "Old-Bangalore house around an open courtyard, red-oxide floors.",
    body: "An old-Bangalore house arranged around an open courtyard, with red-oxide floors that stay cool through April. Guests extend here more than anywhere else in the portfolio, usually because of that courtyard and the tamarind tree over it.",
    beds: "3 BHK",
    bedrooms: 3,
    size: "1,260 sq ft",
    rating: 5.0,
    reviews: 33,
    nightly: 3600,
    monthly: 34000,
    availability: "Available 1/2",
    host: "Meera",
    hostBlurb: "Replies in under an hour · 8am–10pm · lives 7 min away",
    photos: ["/homes/2.jpg", "/homes/1.jpg", "/homes/3.jpg"],
    captions: ["Courtyard, 4pm", "Red-oxide hall", "Back bedroom"],
    amenities: [
      "Fortnightly deep clean",
      "Utilities + 200 Mbps Wi-Fi",
      "Fully furnished",
      "Open courtyard",
      "Washing machine",
      "Street parking",
    ],
    facts: [
      { value: "2x", label: "average extension rate" },
      { value: "1926", label: "house, restored 2021" },
      { value: "12 min", label: "to lalbagh" },
    ],
    rooms: [
      { name: "Courtyard bedroom", meta: "en-suite · queen bed · red-oxide floors", monthly: 15500, available: true },
      { name: "Front bedroom", meta: "shared bath · double bed · desk", monthly: 12500, available: true },
      { name: "Back bedroom", meta: "shared bath · single bed", monthly: 9000, available: false },
    ],
  },
  {
    slug: "indiranagar-defence-colony-studio",
    label: "Defence Colony",
    title: "The Metro Studio",
    location: "Indiranagar",
    area: "Defence Colony, Indiranagar",
    meta: "Studio · Defence Colony · 480 sq ft · listed 2023",
    note: "one street from the metro, solo stays ★",
    hook: "A compact studio for solo stays, one street from the metro.",
    body: "A compact studio one street from the Indiranagar metro, built for people who are out most of the day. Everything is within reach of the desk: a two-burner hob, a full wardrobe and a window that opens onto a gulmohar rather than the road.",
    beds: "Studio",
    bedrooms: 1,
    size: "480 sq ft",
    rating: 4.6,
    reviews: 27,
    nightly: 2400,
    monthly: 22000,
    availability: "Available 2/2",
    host: "Nikhil",
    hostBlurb: "Replies in under an hour · 8am–10pm · lives 5 min away",
    photos: ["/homes/3.jpg", "/homes/2.jpg", "/homes/1.jpg"],
    captions: ["Studio, gulmohar window", "Desk and hob", "Wardrobe wall"],
    amenities: [
      "Weekly clean",
      "Utilities + 200 Mbps Wi-Fi",
      "Fully furnished",
      "Washing machine",
      "Two-wheeler parking",
      "Filtered drinking water",
    ],
    facts: [
      { value: "2 min", label: "walk to metro" },
      { value: "1", label: "work desk" },
      { value: "480", label: "sq ft, all usable" },
    ],
    rooms: [
      { name: "Studio room", meta: "en-suite · double bed · desk", monthly: 22000, available: true },
    ],
  },
]

export const LOCATIONS = [
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Jayanagar",
] as const

export const PRICE_BOUNDS = {
  min: Math.min(...properties.map((p) => p.nightly)),
  max: Math.max(...properties.map((p) => p.nightly)),
}

export const getProperty = (slug?: string) =>
  properties.find((property) => property.slug === slug)
