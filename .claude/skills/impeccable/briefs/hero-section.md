# Hero Section — Shape Brief

**Surface:** Landing page hero (first viewport after entrance animation)
**Mode:** Persuade
**Status:** Ready for implementation

---

## 1. Job and Audience

- **Who arrives:** Professionals seeking serviced rentals for work/remote exploration (remote workers + business travelers blend)
- **Context:** They've just passed the entrance animation (white screen → "ALTA" fade → hero). They're evaluating: *Is this for me? Can I trust it?*
- **Need:** Immediate clarity on what Alta Living is, proof it's not a generic rental site, and a clear path to browse homes.
- **Visitor mode:** Persuade — design must earn attention and action.

---

## 2. Outcome and Proof

- **Primary action:** Click **"Explore Homes"** → navigate to listings/browse experience
- **Secondary action:** Click **"How It Works"** (ghost) → scroll to process section
- **Success metric:** Click-through rate on "Explore Homes" from hero
- **Product-specific truth carried:**
  - Eyebrow: "Not a hotel. Not a rental. A home, waiting."
  - Headline: "Live somewhere that feels lived-in."
  - Subheadline: "Fully furnished homes in Bangalore, Goa, and Coorg — designed for people who want to stay a while, not just check in."
  - Trust micro-line: "240+ stays hosted · 4.9★ average rating" (placeholder — swap for real data)

---

## 3. Selected Direction

| Aspect | Decision |
|--------|----------|
| **Visual authority** | Refinement of existing system — keep asymmetric floating cards, replace draggable with passive ambient motion, upgrade texture, unify typography with content.md copy |
| **Structural thesis** | Centered content column (max-w-2xl) anchored by headline; floating cards orbit asymmetrically around it as atmospheric depth, not distraction |
| **Interaction thesis** | Cards respond to **mouse parallax** (subtle 3D tilt/translate) and **scroll drift** (slow vertical parallax) — no dragging. Creates "lived-in" atmosphere without demanding interaction. |
| **Focal moment** | Headline + eyebrow lockup — the "Not a hotel. Not a rental." line is the brand hook. CTA sits directly below with trust micro-line as quiet reinforcement. |
| **Entrance sequence** | 1. White screen → 2. "ALTA" fades in (center, large, Inter SemiBold) → 3. "ALTA" fades out → 4. Hero content fades up + cards drift into place (staggered) |

---

## 4. Scope and Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Hero section component (replaces current Home.tsx hero) | Property listings page, property detail pages |
| Entrance animation (white → ALTA → hero) | Full scroll-driven animations beyond hero |
| Passive card parallax (mouse + scroll) | Draggable card interactions |
| Geometric/architectural texture background | Real property photography (placeholder images OK) |
| Content.md copy (exact) | Testimonials, FAQ, About, Footer sections |
| WCAG 2.1 AA compliance (focus, contrast, reduced-motion) | Dark mode hero variants (defer to global theme) |

**Anti-goals:**
- No carousel/slider — single centered message
- No auto-playing video — static but atmospheric
- Cards never obscure headline or CTA
- No "hero image" — the cards *are* the visual atmosphere

---

## 5. States and Ranges

| State | Behavior |
|-------|----------|
| **Entrance** | White screen (500ms) → "ALTA" fade in (600ms) → hold (300ms) → fade out (500ms) → hero fade up (700ms, staggered: eyebrow → headline → subhead → CTA → micro-line → cards drift in) |
| **Idle** | Cards drift slowly (vertical ±20px, 20s cycle); subtle geometric texture visible |
| **Mouse move** | Cards tilt/translate ±8px based on cursor position (inverse parallax — cards move opposite cursor) |
| **Scroll start** | Cards begin slow vertical parallax (translateY up to 100px over full hero height) |
| **Reduced motion** | Entrance: instant hero. Idle: static cards. No parallax. Texture remains. |
| **Focus (CTA)** | Visible focus ring (WCAG AA), button scale 1.02 on hover, 0.98 on active |
| **Mobile (< 640px)** | Cards reduced count (4–5), smaller, tighter orbit; headline 32px; CTA full-width; texture scale adjusted |

**Content ranges:**
- Headline: 1 line (desktop) / 2 lines (mobile)
- Subheadline: 2 lines max
- Cards: 7 desktop / 4–5 mobile (from existing `cards` array)

---

## 6. Interaction and Layout

**Hierarchy (top to bottom):**
1. Eyebrow tag — uppercase, tracking-wide, text-neutral-500, 14px
2. Headline — Inter SemiBold, 56px/64px desktop, 36px/44px mobile, text-neutral-900, centered
3. Subheadline — Inter Regular, 18px/28px, text-neutral-500, centered, max-w-md
4. CTA row — Primary (solid, rounded-full, px-8 py-3, text-sm font-medium) + Ghost (border, same sizing) — gap 4, centered
5. Trust micro-line — text-xs, text-neutral-400, centered, mt-6
6. Floating cards — absolute, asymmetric positions (from existing array), z-depth layers

**Layout topology:**
- Single centered column (flex-col, items-center, text-center)
- Cards in absolute layer behind content (z-0), content at z-10
- Full viewport height (min-h-screen), white background
- Texture layer: fixed, full-bleed, opacity ~0.03–0.05, geometric line pattern

**Responsive breakpoints:**
- ≥1024px: Full 7 cards, 56px headline, side-by-side CTAs
- 768–1023px: 6 cards, 48px headline, stacked CTAs
- <768px: 4–5 cards, 36px headline, full-width CTAs, reduced card orbit radius

---

## 7. Constraints and Open Decisions

| Constraint | Detail |
|------------|--------|
| **Framework** | React 19 + TypeScript + motion/react (framer-motion) |
| **Styling** | Tailwind CSS 4 + shadcn/ui primitives |
| **Fonts** | Inter (variable, @fontsource-variable/inter) — already loaded |
| **Accessibility** | WCAG 2.1 AA — focus visible, contrast ≥4.5:1, prefers-reduced-motion respected, semantic HTML (header > h1), alt="" on decorative cards |
| **Performance** | Hero must be <100KB JS (gzipped); cards use CSS transform only (no layout thrash); texture is CSS/SVG, not image |
| **Reusable components** | Use existing `DotPattern` as base for geometric texture; `CardTransformed` pattern for scroll parallax; `Navbar` stays fixed top |
| **Open decisions** | Exact geometric pattern (crosshatch vs. diagonal lines vs. grid); card image content (placeholder vs. abstract shapes); whether "ALTA" uses logo mark or wordmark |

---

## Confirmation

This brief reflects your requirements:
- ✅ Centered text with content.md copy + CTA
- ✅ Textured background (geometric/architectural)
- ✅ Asymmetric floating cards retained, now passive ambient motion
- ✅ All-white entrance with "ALTA" fade in/out → hero

**Ready to implement?** Reply "yes" to proceed, or note any adjustments.