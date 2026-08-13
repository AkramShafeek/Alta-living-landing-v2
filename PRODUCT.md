# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui + motion (framer-motion)

## Users

**Primary:** Professionals seeking fully serviced rental units in the city where they work or want to explore while working remotely. This blends remote workers/digital nomads and business travelers on project assignments — both need reliable Wi-Fi, real desks, invoicing, consistent quality, and low-friction booking for stays of 2 weeks to several months.

**Secondary:** Couples/solo travelers on extended getaways (1–4 weeks) who want a "home" feel over hotels; families relocating or between homes (1–6 months) needing kitchens, multiple bedrooms, safe neighborhoods.

## Product Purpose

Alta Living provides fully furnished, personally vetted homes in Bangalore, Goa, and Coorg for professionals who want to *live* somewhere, not just stay there. The landing page converts visitors into inquiries: **Explore Homes → find a home → submit an inquiry via contact form**.

Success = qualified inquiries from professionals ready to book.

## Positioning

**Not a marketplace.** Alta Living personally manages and vets every home — no open listings, no stock photos, no host roulette. Every property is visited and photographed by the Alta team. The price shown includes cleaning, utilities, and Wi-Fi (no hidden fees). Every guest gets a local human contact, not a chatbot. This is the mechanism a neighboring product (Airbnb, generic rental platforms) cannot truthfully copy.

## Operating Context

- **Markets:** Bangalore (Indiranagar, Whitefield, etc.), Goa (Assagao, North Goa), Coorg (Madikeri/coffee estates)
- **Booking flow:** Browse verified homes by city/dates/vibe → Reserve in clicks (no back-and-forth, no host approval wait) → Get keys, Wi-Fi password, local contact on arrival
- **Stay lengths:** Single night to 6+ months; most guests stay a week or more
- **Trust signals:** 240+ stays hosted, 4.9★ average rating, founded 2023, personally vetted portfolio
- **Voice:** Warm, specific, slightly editorial — not corporate hospitality, not budget-Airbnb. Concrete sensory detail over clichés ("unforgettable experience," "home away from home").

## Capabilities and Constraints

**Confirmed functionality:**
- Property browsing with real photos, location tags, pricing, feature badges
- Inquiry/contact form (not instant booking — human follow-up)
- City/location filtering
- Testimonials with photos, names, locations, star ratings
- FAQ accordion
- Newsletter signup for new city launches

**Technical constraints:**
- React 19 + Vite SPA (no SSR)
- Tailwind CSS 4 + shadcn/ui component library
- motion/react for animations (scroll-driven, 3D card transforms)
- No backend in this repo — form submissions go to external endpoint
- Images served from `/public` or external CDN

**Explicitly undecided:**
- Exact inquiry form fields (beyond name, email, dates, property interest)
- Whether property detail pages live in this repo or separate app
- Analytics/tracking implementation

## Brand Commitments

- **Name:** Alta Living
- **Tagline/Eyebrow:** "Not a hotel. Not a rental. A home, waiting."
- **Headline:** "Live somewhere that feels lived-in."
- **Font:** Inter (via @fontsource-variable/inter) — confirmed as the starting point
- **Palette:** Neutral Tailwind base (stone/neutral grays) — no locked brand colors yet
- **Tone:** Warm, specific, slightly editorial. Avoid generic hospitality clichés. Lean on concrete sensory detail (the coffee estate, the courtyard, the plunge pool).
- **All numbers/testimonials in content.md are placeholders** — must swap in actual stats, reviews, and property names before shipping.

## Evidence on Hand

- **content.md** — complete scroll-order content draft with all 9 sections (Hero, Property Teaser, Why Alta, About Us, How It Works, Testimonials, FAQ, CTA, Footer), including specific property cards, testimonials, FAQs, and footer structure. Path: `content.md`
- **Existing visual implementation** — Hero with draggable card collage, 3D testimonial carousel, scroll-driven animated card stack, PropertyCard component, Navbar, dot-pattern background. Paths: `src/pages/Home.tsx`, `src/components/*.tsx`
- **Placeholder images** — `/public/1.jpg`, `/public/2.jpg`, `/public/3.jpg` (need real property photography)
- **No real testimonials, property photos, or verified stats yet** — future work must not fabricate these.

## Product Principles

1. **Trust over breadth** — Personally vetted, real photos, human contact beat infinite listings every time.
2. **Specificity sells** — A half-finished coffee cup on a windowsill persuades more than "luxury amenities."
3. **No surprises** — Price includes everything. The home matches the photos. A human answers.
4. **Built for staying, not visiting** — Real desks, real kitchens, real Wi-Fi, real neighborhoods.
5. **Editorial restraint** — Warm, specific voice. No corporate fluff. Every word earns its keep.

## Accessibility & Inclusion

WCAG 2.1 AA required. Must test with screen readers, keyboard navigation, and color contrast. Semantic HTML, focus management for modals/carousels, alt text for all property images, sufficient contrast on all text (especially over hero imagery), reduced-motion respect for scroll animations.