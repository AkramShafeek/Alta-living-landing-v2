// ─────────────────────────────────────────────────────────────────────────
// HERO_MOTION — every timing knob for the immersive hero, grouped by scene,
// in the order things happen. Copy, colours and photos live in
// src/content/site.ts (`immersiveHero`, `heroAreas`, `heroHowItWorks`).
//
// Two kinds of animation:
//   intro   — plays once on page load, in seconds.
//   scroll  — scrubbed: scroll position *is* the playhead, so durations are
//             not seconds but "units" of scrolling. Each unit is `vhPerUnit`
//             of scroll, and the section's height is worked out from the
//             total automatically — add or lengthen steps freely.
// ─────────────────────────────────────────────────────────────────────────
export const HERO_MOTION = {
  /** How much scrolling one unit of animation takes. Bigger = everything slower. */
  vhPerUnit: 55,
  /** Seconds the animation trails behind the scrollbar. 0 = locked to it. */
  scrub: 1,

  // ── Scene 1 · Intro ────────────────────────────────────────────────────
  /** ON LOAD — rails draw, body copy reveals word by word, button and headline follow. */
  intro: {
    delay: 0.3,
    railDuration: 1.8,
    wordDuration: 1.4,
    wordStagger: 0.07,
    ease: "expo.out",
    /** The button rises in this many seconds after the copy starts. */
    ctaDelay: 0.5,
    /** The headline at the bottom fades in this many seconds after the copy starts. */
    headlineDelay: 0.9,
    headlineDuration: 1.2,
  },
  /** Gap between the headline and the bottom of the screen at rest (px). */
  bottomGap: 32,
  /** The body copy shrinks and fades out. */
  bodyExit: { scale: 0.82, blur: 6, duration: 1.2 },
  /**
   * The "View homes" button is never hidden:
   *   leg 1 — lifts out of the headline's way while the headline rises;
   *   leg 2 — glides to its slot under the promise copy (scene 2);
   *   leg 3 — stays put while the promise is pulled away, then glides to its
   *           slot under the "50+ homes" line (scene 3);
   *   exit  — tips away to the right with the areas text (scene 3).
   */
  cta: {
    liftY: 0.22,
    liftDuration: 1.2,
    travelDuration: 1.4,
    /** Leg 3 starts this many units before the areas text begins arriving. */
    toAreasLead: 0.6,
    toAreasDuration: 1.8,
    ease: "power2.inOut",
  },
  /** The headline lifts from the bottom to the centre in a wave. */
  wave: { letterDuration: 1, staggerTotal: 2, ease: "back.out(1.7)" },
  /** The two halves split and leave, left and right. */
  split: { delay: 0.4, duration: 1.2, ease: "power2.in" },

  // ── Scene 2 · Promise ──────────────────────────────────────────────────
  /** The promise copy slides in from the top left. */
  promise: {
    /** How long after the split *starts* this begins (overlaps the exit). */
    delay: 0.7,
    fromX: 120,
    fromY: 80,
    duration: 1,
    stagger: 0.18,
    ease: "power3.out",
  },
  /** Square pop open / pop shut. When each one pops lives in PROMISE_SQUARES. */
  squares: { popDuration: 0.4, openEase: "expo.out", closeEase: "expo.in" },
  /** Photo strip: in from the right edge, all the way out past the left edge. */
  strip: { duration: 6 },
  /**
   * The promise copy is pulled off to the right: the headline letter by
   * letter (rightmost first), then the rest. "power4.in" starts slow and
   * accelerates hard — the inertia.
   */
  pull: {
    /** Starts this long before the strip finishes. */
    overlap: 1.2,
    letterDuration: 1.1,
    /** Scroll share spread across one line's letters. */
    staggerTotal: 0.9,
    /** Gap between eyebrow / line / body / button leaving. */
    blockStagger: 0.12,
    ease: "power4.in",
  },

  // ── Scene 3 · Areas ────────────────────────────────────────────────────
  areas: {
    /** Gap after the promise has gone. */
    gap: 0.2,
    enterDuration: 1.4,
    /** The wheel rolls this many words into place as it slides in. */
    enterRoll: 2,
    /** How much scrolling the wheel takes to turn past every area (smooth, no stops). */
    spinDuration: 3.5,
    /** How long the panel takes to change colour from one area to the next. */
    colorDuration: 0.5,
    /** Exit: the wheel rolls on this many more words as it leaves. */
    exitRoll: 3,
    exitDuration: 1.4,
    ease: "power3.out",
  },

  // ── Scene 4 · How it works ─────────────────────────────────────────────
  how: {
    gap: 0.3,
    /** Eyebrow + title fade up from this far below (px). */
    titleFromY: 24,
    titleDuration: 0.9,
    /** Each column rises from below the screen, one after another. */
    riseDuration: 1.1,
    riseStagger: 0.45,
    riseEase: "power3.out",
    /** The puzzle tab joining two columns pops in once the right one has landed. */
    tabDuration: 0.35,
    tabEase: "back.out(2.2)",
    /** The text slides in from the left inside each column after it lands. */
    textFromX: -48,
    textDuration: 0.7,
    textStagger: 0.1,
    /** Units where nothing moves, so the steps can be read. */
    read: 3,
    /** Columns sink back down, one after another, and the title lifts away. */
    exitDuration: 1.1,
    exitStagger: 0.15,
  },

  /** Units at the very end where nothing moves, before the next section. */
  hold: 0.4,
} as const
