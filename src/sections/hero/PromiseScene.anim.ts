import { HERO_MOTION } from "./motion"
import { $, $1, glideTo, staggered, type SceneBuild } from "./timeline"

/**
 * PromiseScene: scroll steps (the layout is in PromiseScene.tsx).
 * Timings live in motion.ts.
 */

/**
 * The dark squares behind the headline. All sizes/positions are in `em`
 * (multiples of the headline's font size), so they stay over the same letters
 * at every screen width. One headline line is 0.95em tall; line 1 is about
 * 7em wide, line 2 about 6em.
 *   x, y    — top-left corner, from the headline's top-left. Keep y
 *             above -0.1 or the square covers the eyebrow above.
 *   size    — side length
 *   popIn   — when it pops open, in scroll units after the headline lands
 *   popOut  — when it pops shut again
 */
export const PROMISE_SQUARES = [
  { x: 0.3, y: -0.08, size: 1.45, popIn: 0, popOut: 2.4 },
  { x: 4.55, y: 0.3, size: 1.35, popIn: 0.9, popOut: 3.6 },
  { x: 2.3, y: 0.0, size: 1.1, popIn: 2.1, popOut: 4.3 },
] as const

const build: SceneBuild = (tl, root) => {
  const { promise, squares, cta, strip, pull } = HERO_MOTION
  const ctaMover = $1(root, "[data-hero-cta-mover]")
  const ctaSlot = $1(root, "[data-cta-slot]")
  const track = $1(root, "[data-strip-track]")

  // ── In ────────────────────────────────────────────────────────────────
  tl.addLabel("promise", `split+=${promise.delay}`)

  // Eyebrow, headline, body slide in from the top left, one after another.
  staggered(
    tl,
    $(root, "[data-promise-item]"),
    { x: -promise.fromX, y: -promise.fromY, autoAlpha: 0 },
    {
      x: 0,
      y: 0,
      autoAlpha: 1,
      duration: promise.duration,
      ease: promise.ease,
    },
    promise.stagger,
    "promise"
  )
  // The rule under the headline draws left to right.
  tl.fromTo(
    $1(root, "[data-promise-line]"),
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: promise.duration * 1.5,
      ease: "power2.inOut",
      immediateRender: true,
    },
    `promise+=${promise.stagger * 2}`
  )

  // Button, leg 2: glides to the slot under the promise copy.
  tl.to(
    ctaMover,
    {
      ...glideTo(ctaMover, ctaSlot),
      duration: cta.travelDuration,
      ease: cta.ease,
    },
    `promise+=${promise.stagger * 2}`
  )

  // ── Squares: each pops open, then shut, at its own moment ─────────────
  // clip-path from the centre, not scale, so the text inside never stretches.
  tl.addLabel("squares", `promise+=${promise.stagger + promise.duration * 0.6}`)
  $(root, "[data-promise-square]").forEach((square, i) => {
    const { popIn, popOut } = PROMISE_SQUARES[i]
    tl.fromTo(
      square,
      { clipPath: "inset(50% 50% 50% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: squares.popDuration,
        ease: squares.openEase,
        immediateRender: true,
      },
      `squares+=${popIn}`
    )
    tl.to(
      square,
      {
        clipPath: "inset(50% 50% 50% 50%)",
        duration: squares.popDuration,
        ease: squares.closeEase,
      },
      `squares+=${popOut}`
    )
  })

  // ── Photo strip: caption and rule arrive, photos run right to left and
  //    keep going until the last one has left the screen. ───────────────
  tl.fromTo(
    $(root, "[data-strip-caption]"),
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: true },
    "promise"
  )
  tl.fromTo(
    $1(root, "[data-strip-line]"),
    { scaleX: 0 },
    { scaleX: 1, duration: 1.2, ease: "power2.inOut", immediateRender: true },
    "promise"
  )
  tl.fromTo(
    track,
    { x: () => window.innerWidth },
    {
      x: () => -track.scrollWidth,
      duration: strip.duration,
      immediateRender: true,
    },
    "promise"
  )

  // ── Out: pulled to the right ──────────────────────────────────────────
  tl.addLabel("pull", `promise+=${strip.duration - pull.overlap}`)
  const offRight = () => window.innerWidth

  // Headline, letter by letter: on each line the rightmost letter goes
  // first, then the next, each starting slow and accelerating away.
  $(root, "[data-promise-line-text]").forEach((line) => {
    const chars = $(line, "[data-wave-char]").reverse()
    const gap = chars.length > 1 ? pull.staggerTotal / (chars.length - 1) : 0
    chars.forEach((char, i) => {
      tl.to(
        char,
        { x: offRight, duration: pull.letterDuration, ease: pull.ease },
        `pull+=${i * gap}`
      )
    })
  })

  // Then the eyebrow, rule and body, as whole blocks. (The button stays: it
  // glides on to the areas scene — see AreasScene.anim.ts.)
  const blocks = [
    $(root, "[data-promise-item]")[0], // eyebrow
    $1(root, "[data-promise-line]"),
    $(root, "[data-promise-item]")[2], // body
  ]
  blocks.forEach((block, i) => {
    tl.to(
      block,
      { x: offRight, duration: pull.letterDuration, ease: pull.ease },
      `pull+=${0.25 + i * pull.blockStagger}`
    )
  })

  // The strip's caption and rule fade as the copy leaves.
  tl.to(
    [...$(root, "[data-strip-caption]"), $1(root, "[data-strip-line]")],
    { autoAlpha: 0, duration: 0.6 },
    "pull"
  )
}

export const promiseAnim = { build }
