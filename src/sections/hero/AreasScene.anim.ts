import { gsap } from "gsap"
import { heroAreas, immersiveHero } from "@/content/site"
import { HERO_MOTION } from "./motion"
import { $, $1, glideTo, staggered, type SceneBuild } from "./timeline"

/**
 * AreasScene: scroll steps (the layout is in AreasScene.tsx).
 * Timings live in motion.ts (`areas`).
 */

/**
 * The wheel of neighbourhoods. Every word is a spoke pointing out from a
 * pivot just off the left edge of the screen, so the list fans out to the
 * right and curves back towards the left. Scrolling turns the wheel; the
 * word pointing straight right (3 o'clock) is the active one, with a short
 * arrow in front of it.
 */
export const WHEEL = {
  /** Text size of every word. */
  font: "clamp(2.75rem, 9vh, 7rem)",
  /** Where the active word starts, from the left edge of the screen. */
  anchorX: "max(5rem, 11vw)",
  /** Distance from the pivot to where each word starts, as a share of the
   *  screen height. Smaller = tighter curve. */
  radius: 0.42,
  /** Degrees between neighbouring words. Smaller = words closer together. */
  step: 13,
  /** Arrow: its size (relative to the words) and its gap before the word. */
  arrowSize: "0.45em",
  arrowGap: "0.3em",
  /** Fade per word away from the active one, and a subtle blur (px per word
   *  away, up to blurMax). */
  fadePerWord: 0.22,
  blurPerWord: 0.8,
  blurMax: 2.4,
  /** The list repeats above and below so the wheel always looks full. */
  repeatsBefore: 8,
  repeatsAfter: 9,
}

const build: SceneBuild = (tl, root) => {
  const { areas, cta } = HERO_MOTION
  const ctaMover = $1(root, "[data-hero-cta-mover]")
  const ctaSlot = $1(root, "[data-areas-cta-slot]")
  const wheel = $1(root, "[data-areas-wheel]")
  const words = $(root, "[data-wheel-word]")
  const count = Number(wheel.dataset.count) // how many real areas
  const DEG = Math.PI / 180

  /**
   * Lays every word out for wheel position `p`: p = 0 puts the first area at
   * 3 o'clock, p = 1 the second, and so on (fractions are in between).
   * Each word is moved out along its spoke and turned to point along it.
   */
  const layout = (p: number) => {
    const radius = window.innerHeight * WHEEL.radius
    words.forEach((word) => {
      const away = Number(word.dataset.k) - p // words away from the active one
      const angle = away * WHEEL.step
      const distance = Math.abs(away)
      gsap.set(word, {
        x: radius * Math.cos(angle * DEG),
        y: radius * Math.sin(angle * DEG),
        yPercent: -50,
        rotation: angle,
        opacity: Math.max(0, 1 - distance * WHEEL.fadePerWord),
        filter: `blur(${Math.min(distance * WHEEL.blurPerWord, WHEEL.blurMax)}px)`,
      })
    })
  }

  const wheelPos = { p: -areas.enterRoll }
  const draw = () => layout(wheelPos.p)

  /**
   * Repaints the whole panel. The fixed panel takes its background and text
   * colour from the --hero-bg / --hero-ink variables (ImmersiveHero.tsx), so
   * tweening these recolours everything at once — text, lines, rails.
   *
   * They are tweened on the panel, never on the <section> that React gives
   * the base colours to: GSAP removes the variables it animated when it
   * cleans up, and the panel then simply inherits the base colours again.
   */
  const panel = $1(root, "[data-hero-panel]")
  const paintTo = (bg: string, ink: string, at: string) =>
    tl.to(
      panel,
      {
        "--hero-bg": bg,
        "--hero-ink": ink,
        duration: areas.colorDuration,
        ease: "power1.inOut",
      },
      at
    )

  // ── In: wheel rolls in from the left, text slides in, panel takes the
  //    first area's colours ─────────────────────────────────────────────
  tl.addLabel("areas", `+=${areas.gap}`)
  paintTo(heroAreas.wheel[0].bg, heroAreas.wheel[0].ink, "areas")
  tl.fromTo(
    wheel,
    { x: () => -window.innerWidth * 0.3, autoAlpha: 0 },
    {
      x: 0,
      autoAlpha: 1,
      duration: areas.enterDuration,
      ease: areas.ease,
      immediateRender: true,
    },
    "areas"
  )
  tl.fromTo(
    wheelPos,
    { p: -areas.enterRoll },
    {
      p: 0,
      duration: areas.enterDuration,
      ease: areas.ease,
      immediateRender: true,
      onUpdate: draw,
    },
    "areas"
  )
  staggered(
    tl,
    $(root, "[data-areas-item]"),
    { x: 160, autoAlpha: 0 },
    {
      x: 0,
      autoAlpha: 1,
      duration: areas.enterDuration * 0.8,
      ease: areas.ease,
    },
    0.15,
    "areas"
  )

  // Button, leg 3: it stayed behind when the promise was pulled away, and
  // now glides across to its slot under the "50+ homes" line, arriving with
  // the text.
  tl.to(
    ctaMover,
    {
      ...glideTo(ctaMover, ctaSlot),
      duration: cta.toAreasDuration,
      ease: cta.ease,
    },
    `areas-=${cta.toAreasLead}`
  )

  // ── Spin: the wheel turns smoothly past every area ────────────────────
  tl.addLabel("spin", `areas+=${areas.enterDuration}`)
  tl.to(
    wheelPos,
    {
      p: count - 1,
      duration: areas.spinDuration,
      ease: "none",
      onUpdate: draw,
    },
    "spin"
  )
  tl.addLabel("areasOut", `spin+=${areas.spinDuration}`)

  // ── Colours: the panel changes colour as each area reaches the arrow ──
  // Area i takes over half-way between it and the one before (wheel at
  // i - 0.5); the change is centred on that moment.
  const at = (p: number) =>
    `spin+=${(p / Math.max(1, count - 1)) * areas.spinDuration - areas.colorDuration / 2}`
  heroAreas.wheel.forEach((area, i) => {
    if (i > 0) paintTo(area.bg, area.ink, at(i - 0.5))
  })

  // ── Out: the wheel keeps rolling as it slides away left; the text and
  //    button tip away right; the panel goes back to bone ─────────────
  paintTo(immersiveHero.background, immersiveHero.ink, "areasOut")
  tl.to(
    wheelPos,
    {
      p: count - 1 + areas.exitRoll,
      duration: areas.exitDuration,
      ease: "power2.in",
      onUpdate: draw,
    },
    "areasOut"
  )
  tl.to(
    wheel,
    {
      x: () => -window.innerWidth * 0.6,
      autoAlpha: 0,
      duration: areas.exitDuration,
      ease: "power2.in",
    },
    "areasOut"
  )
  tl.to(
    $1(root, "[data-areas-text]"),
    {
      x: () => window.innerWidth * 0.6,
      rotation: 10,
      transformOrigin: "100% 50%",
      autoAlpha: 0,
      duration: areas.exitDuration,
      ease: "power2.in",
    },
    "areasOut"
  )
  // The button tips away with the text: its journey ends here.
  tl.to(
    ctaMover,
    {
      x: () => `+=${window.innerWidth * 0.6}`,
      rotation: 10,
      autoAlpha: 0,
      duration: areas.exitDuration,
      ease: "power2.in",
    },
    "areasOut"
  )

  draw()
}

export const areasAnim = { build }
