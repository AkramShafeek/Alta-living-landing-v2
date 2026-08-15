# Alta Living — Design System

Alta Living is a hospitality company operating **only in Bangalore** providing **fully serviced, furnished rental
units** for tenants and professionals. Built on 5+ years of Airbnb hosting experience, the pitch is
operational reliability rather than marketplace breadth: every home is visited, measured and
photographed by the Alta team; the price shown includes cleaning, utilities and Wi-Fi; every guest
gets a local human contact.

**Positioning:** not a marketplace, not a hotel. A managed portfolio of homes you actually live in.
**Real figures used across the product:** 12+ properties · 5+ years of hosting · 100+ happy customers.

The visual language is **semi-brutalist editorial**: paper-and-ink grounds, 1px black hairlines on
everything, zero-blur offset shadows, oversized condensed display type, mono labels — softened by
one warm human device, the **house-hunt pinboard** (tilted photos, pushpins, red string, handwritten
notes). It reads like a working wall of a person searching for a home, not like a real-estate portal.

## Sources this system was built from

- **GitHub — landing page (primary source):** https://github.com/AkramShafeek/Alta-living-landing-v2 (branch `master`)
  Read in full: `PRODUCT.md`, `content.md`, `src/index.css`, `src/pages/Home.tsx`,
  `src/components/{HouseHuntBoard,Marquee,PropertyCard,AnimatedCardsStack,dot-pattern}.tsx`,
  `src/components/ui/button.tsx`, `src/layout/Layout.tsx`, `src/sections/HeroSection.tsx`.
  Stack there: React 19 + Vite + Tailwind 4 + shadcn/ui + framer-motion + lucide-react.
  **Worth exploring further** — reading that repo directly will always give a sharper recreation than
  this system's summaries, especially for animation timings and unfinished pages.
- **Uploaded brand assets:** `alta-logo.png`, `pattern.jpg` (furniture doodle tile),
  `1.jpg / 2.jpg / 3.jpg` (real property photography), `image-4.png` (collage backdrop).
- Also copied from the repo's `public/`: `map.png`, `pinboard-bg.jpg`.

Nothing was invented from memory. Where the repo has no design (property detail, about, contact,
FAQ, admin), this system says so instead of filling the gap.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | Global entry — `@import` list only. Consumers link this one file. |
| `tokens/` | `fonts, colors, typography, spacing, borders, shadows, motion, base` |
| `components/core/` | `Button`, `Tag`, `Rule`, `Icon`, `Accordion` |
| `components/board/` | `Pinboard`, `PinnedPhoto`, `StickyNote`, `Marquee` |
| `components/property/` | `PropertyCard`, `TestimonialCard`, `StatBlock`, `FeatureCell`, `StepCell` |
| `components/layout/` | `Wordmark`, `NavCapsule`, `ArchPanel`, `PatternField`, `CTABand` |
| `ui_kits/marketing-site/` | Click-through recreation of the landing page + listings |
| `templates/landing-page/` | Starting template for a new Alta page |
| `guidelines/` | Foundation specimen cards (Colors, Type, Spacing, Brand) |
| `assets/` | Logo, furniture pattern, property photography, collage + pinboard backdrops, map |
| `SKILL.md` | Agent-Skills entry point |
| `github.md` | Upstream repo association for one-click sync |

### Components (19)

`Button`, `Tag`, `Rule`, `Icon`, `Accordion`, `Pinboard`, `PinnedPhoto`, `StickyNote`, `Marquee`,
`PropertyCard`, `TestimonialCard`, `StatBlock`, `FeatureCell`, `StepCell`, `Wordmark`,
`NavCapsule`, `ArchPanel`, `PatternField`, `CTABand`.

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (when to use + example).

**Intentional additions** — families not literally named in the repo, added because the repo's
inline markup repeats them verbatim: `Tag` and `Rule` (the repo's inline location chips and
`Separator` usages), `StatBlock` (the `12+ / 5+ / 100+` rail), `ArchPanel` (the repeated
`rounded-t-[60px]` bordered section), `Wordmark`, `NavCapsule`, `PatternField` (the hero's
pattern layer), and `Icon` (a wrapper over the repo's `lucide-react` icon set).
The repo's `3DTestimonials`, `AnimatedCardsStack` and `ParallaxFloating` experiments are **not**
included — they are unused in the shipped page.

---

## CONTENT FUNDAMENTALS

**Voice:** warm, specific, slightly editorial. Concrete detail over adjectives. Never corporate
hospitality, never budget-listing hype.

- **Person:** mostly first-person plural for the company ("we don't list anyone's home who hasn't
  been vetted in person by our team"), second person for the reader ("your next home"). Never "one".
- **Casing** carries meaning:
  - Display headings — **sentence case**: "Top Picks", "What people love about us", "Every home, right now".
  - Mono labels, tickers, tags — **lowercase or UPPERCASE with wide tracking**: "14 homes live across bangalore", "AVAILABLE 1/3".
  - The wordmark — always **ALTA LIVING**, uppercase, League Gothic.
- **Ticker copy** is a fact, not a slogan: `new listing — indiranagar 2bhk`, `average move-in time — 3 days`.
- **Property hooks** are one sentence with a real detail in it: *"A quiet 2BHK above a courtyard,
  five minutes from 100ft Road."* Not *"a beautiful home in a prime location."*
- **Numbers** are always concrete and rendered in mono or display: `₹ 30,000 per month`, `12+`,
  `Available 1/3`. Rupee symbol, space, comma grouping (Indian: 1,50,000).
- **Headline device:** an unfinished line completed by the wordmark — "House Hunt ends today at /
  **Alta Living**". Mono line above, display line below.
- **Banned:** "unforgettable experience", "home away from home", "luxury amenities", "dream stay",
  exclamation marks in body copy.
- **Emoji:** never in product UI. (`content.md` uses them as table markers in the draft only — do
  not carry that into a design.) Unicode is allowed for two marks the brand actually uses: **★** in
  handwritten notes and ratings, **✓** on visited notes, **—** as the ticker separator, **→** implied
  by the Lucide arrow icon.
- **Buttons** are verb-first and short: "Browse Properties", "View", "Enquire about this home".

## VISUAL FOUNDATIONS

**Palette.** The interactive accent is **near-black** — `--ink #141311`, never pure #000. Every
button, border and piece of type is ink; nothing else competes for the click. Grounds are
`--paper #f7f3ea` with two deeper sands (`--paper-2 #e8dcc6`, `--paper-3 #d3bfa1`) for panels and
grid lines. **Cards sit on pastels** — `--pastel-blue #dfeaf7` is the default, with
`sage #e0e9dd`, `peach #f7e5d8`, `lilac #e7e2f2` and `butter #f6eecd` alternating across a grid
(one tone per card, never two inside a card). The **rust family is complementary only** —
`--rust #7a1f1f` for pinboard string and pushpins, `--rust-band #9a3412` at 60% for the ticker,
`--clay #c2653a` for ticker dashes. Rust is never a button. No decorative gradients; the only
gradient in the system is the functional protection mask over the collage backdrop.

**Type.** Four faces, each with one job. `League Gothic` — the ALTA LIVING wordmark, uppercase,
nothing else. `Bricolage Grotesque` 800 — display headings and stats, `-0.02em` tracking,
`0.92` line-height, deliberately oversized (64–128px). `Instrument Sans` — all running copy, 16/1.55; a grotesk with enough character to sit next to
Bricolage without going generic (this replaces the repo's Inter — see caveats).
`IBM Plex Mono` — labels, ticker, prices, availability; uppercase with `0.18em` tracking when used
as a label. `Cedarville Cursive` — pinboard notes and photo captions only, at 70% ink. Stat labels
are extra-light and right-aligned under a very heavy figure: that weight contrast is the signature.

**Layout.** Full-bleed by default: sections are `100vh` blocks with an 8–16px page frame, not a
centred max-width column. Structure is expressed with **hairline grids** — `1fr 4fr 1fr` rails,
`repeat(3,1fr)` stat stacks, 1px ink borders between cells, and empty bordered cells left
deliberately empty. Content bands below the hero are `ArchPanel`s: 60px radius on the **top two
corners only**, sand hairline border, no bottom edge, stacked 88px apart so they read like tabs.
Nothing is fixed/sticky — the header scrolls away with the hero.

**Borders & radii.** 1px solid ink is the default border for every card, tag, image and button.
2px at 20% ink for testimonial cards (softer on purpose). Radii: **0px** almost everywhere;
6/12px for the boxed logo; **999px** only for the nav capsule and the hero CTA; **60px** for the
arch panels. Never a uniformly rounded card.

**Shadows.** Zero-blur offset ink: `3px 3px`, `5px 6px`, `8px 10px`. No blur, no colour tint,
no ambient shadow on UI. The one exception is `PinnedPhoto`, which uses a real layered photographic
shadow (`--shadow-pinned`) because it represents a physical object on a board. There are no inner
shadows in the system.

**Hover.** Hard-shadow controls **invert** — white face with ink text becomes ink face with paper
text — in 150ms; nothing scales, nothing lightens. Links go ink → rust with an underline. Pinned
photos straighten (tilt × 0.4) and their shadow lifts. Property card photos do not zoom.
**Press.** The control translates 3px on both axes *into* its own shadow, which shrinks to
`2px 2px` — a physical key-press, 100ms, no colour change.

**Transparency & blur.** Used almost never. Two sanctioned cases: `Tag tone="glass"`
(`rgba(0,0,0,.5)` + 4px blur) for tags sitting over photography, and the ticker band's rust at 60%
so the pattern shows through. No frosted panels, no glassmorphism.

**Backgrounds & texture.** One texture: the hand-drawn furniture doodle tile
(`assets/pattern-furniture.jpg`), repeated at 300×300 and washed to **10% opacity**, fading in over
4.4s behind the hero. `assets/pinboard-bg.jpg` is the cork ground for board treatments;
`assets/collage-bg.png` backs the photo collage behind a white protection gradient
(`white 0% → transparent 40% → transparent 75% → white 95%`). Full-bleed photography is used only
inside cards and the collage — never behind text.

**Imagery.** Real interiors of real Alta homes, shot by the team: warm daylight, deep teal and
timber, marble floors, natural shadows, slightly warm white balance. No grain, no filters, no
black-and-white, no staged emptiness — a lived-in room beats a styled one. Never stock photography.

**Motion.** Elegant and restrained; every motion is either a **reveal** or a **physical response**.
Reveals: content slides up 32px with fade over 600ms on `cubic-bezier(.16,1,.3,1)`, staggered
150ms; the wordmark scales 0.96→1 over 900ms ahead of everything else; the background pattern
washes in over 4.4s. The pinboard is the set piece — notes drop in scaled 1.2→1 at 250ms intervals,
then the red strings draw along their path over 900ms once the last note lands. The ticker loops
linearly for 26s, forever. Presses are 100ms. No bounce, no elastic, no parallax on scroll, no
looping decorative animation apart from the ticker. `prefers-reduced-motion` disables all of it.

## ICONOGRAPHY

The product uses **Lucide** exclusively (`lucide-react` upstream). There is no custom icon font,
no sprite sheet, and no icon SVGs committed in the repo — so this system does **not** ship icon
files. Instead `components/core/Icon.jsx` renders Lucide's official static SVGs from CDN
(`lucide-static@0.544.0`) as a CSS mask, so glyphs inherit `currentColor`.

**⚠️ Substitution flag:** CDN-linked Lucide stands in for the repo's bundled `lucide-react`. Same
icon set, same geometry, same 2px stroke — but the version is pinned by this system, not by the app.

- Sizes in use: **12px** inside tags, **16px** inline in metadata rows and buttons, **20px** in nav.
- Glyphs actually used upstream: `bed`, `door-open`, `map-pin`, `star`, `home`, `arrow-right`.
- Stroke icons only, default weight; `star` is the one glyph shown filled (ratings).
- **Never** emoji in UI. **Never** hand-drawn or approximated SVG icons.
- Unicode marks the brand does use: **★ ✓ —** inside handwritten notes and tickers.

## Logo

`assets/alta-logo.png` — the supplied four-glyph ALTA square (A L / T A). It is the only mark;
there is no wordmark lockup file, so the "ALTA LIVING" wordmark is **set in League Gothic type**.
Header treatment: 48px mark in a white box, 1px ink border, 12px radius, `3px 3px 0` ink shadow.
On ink grounds, invert the mark. Never redraw, recolour or reconstruct it.
