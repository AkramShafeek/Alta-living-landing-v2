import { gsap } from "gsap"
import { HERO_MOTION } from "./motion"
import { $, $1, staggered, type SceneBuild } from "./timeline"

/**
 * IntroScene: scroll steps (the layout is in IntroScene.tsx).
 * Timings live in motion.ts.
 */

/** ON LOAD (time-based, not scroll). Also draws the edge rails. */
const playOnLoad = (root: HTMLElement) => {
  const { intro } = HERO_MOTION
  gsap
    .timeline({ delay: intro.delay })
    .from(
      $(root, "[data-hero-rail]"),
      { scaleY: 0, duration: intro.railDuration, ease: "expo.inOut" },
      0
    )
    .from(
      $(root, "[data-hero-rail-label]"),
      { autoAlpha: 0, duration: 1 },
      intro.railDuration * 0.6
    )
    .from(
      $(root, "[data-hero-word]"),
      {
        yPercent: 110,
        duration: intro.wordDuration,
        stagger: intro.wordStagger,
        ease: intro.ease,
      },
      0
    )
    .from(
      $(root, "[data-hero-cta]"),
      { autoAlpha: 0, y: 16, duration: 1, ease: "power3.out" },
      intro.ctaDelay
    )
    .from(
      $(root, "[data-hero-headline-intro]"),
      {
        autoAlpha: 0,
        y: 24,
        duration: intro.headlineDuration,
        ease: "power3.out",
      },
      intro.headlineDelay
    )
}

const build: SceneBuild = (tl, root) => {
  const { bodyExit, cta, wave, split } = HERO_MOTION
  const headline = $1(root, "[data-hero-headline]")

  // The headline is laid out in the centre (flexbox). This is how far down
  // it has to be pushed to rest at the bottom of the screen. Worked out from
  // its height alone, not offsetTop: the intro's transform on the wrapper
  // makes offsetTop read 0.
  const restOffset = () =>
    (window.innerHeight - headline.offsetHeight) / 2 - HERO_MOTION.bottomGap

  tl.addLabel("start", 0)

  // 1a. Body copy shrinks and fades out.
  tl.to(
    $1(root, "[data-hero-body]"),
    {
      scale: bodyExit.scale,
      autoAlpha: 0,
      filter: `blur(${bodyExit.blur}px)`,
      duration: bodyExit.duration,
    },
    "start"
  )

  // 1b. Button, leg 1: lifts up out of the rising headline's way.
  tl.to(
    $1(root, "[data-hero-cta-mover]"),
    {
      y: () => -window.innerHeight * cta.liftY,
      duration: cta.liftDuration,
      ease: cta.ease,
    },
    "start"
  )

  // 1c. The wave: one continuous ripple, left to right, across the line.
  const chars = $(headline, "[data-wave-char]")
  staggered(
    tl,
    chars,
    { y: restOffset },
    { y: 0, duration: wave.letterDuration, ease: wave.ease },
    chars.length > 1 ? wave.staggerTotal / (chars.length - 1) : 0,
    "start"
  )

  // 2. Split: first half out to the left, second out to the right.
  tl.addLabel("split", `+=${split.delay}`)
  $(root, "[data-hero-half]").forEach((half, i) => {
    tl.to(
      half,
      {
        x: i === 0 ? "-100vw" : "100vw",
        duration: split.duration,
        ease: split.ease,
      },
      "split"
    )
  })
}

export const introAnim = { playOnLoad, build }
