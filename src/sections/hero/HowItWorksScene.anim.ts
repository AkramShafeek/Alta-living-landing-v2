import { HERO_MOTION } from "./motion"
import { $, staggered, type SceneBuild } from "./timeline"

/**
 * HowItWorksScene: scroll steps (the layout is in HowItWorksScene.tsx).
 * Timings live in motion.ts (`how`).
 */

const build: SceneBuild = (tl, root) => {
  const { how } = HERO_MOTION
  const columns = $(root, "[data-how-col]")

  tl.addLabel("how", `+=${how.gap}`)

  // ── Title fades up ────────────────────────────────────────────────────
  staggered(
    tl,
    $(root, "[data-how-title]"),
    { y: how.titleFromY, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: how.titleDuration, ease: "power2.out" },
    0.15,
    "how"
  )

  // ── Columns rise from below the screen, one after another ─────────────
  // yPercent: 100 = exactly its own height down, i.e. just out of sight.
  const riseAt = (i: number) => 0.2 + i * how.riseStagger // when column i starts rising
  const landAt = (i: number) => riseAt(i) + how.riseDuration // when it has landed
  columns.forEach((column, i) => {
    tl.fromTo(
      column,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: how.riseDuration,
        ease: how.riseEase,
        immediateRender: true,
      },
      `how+=${riseAt(i)}`
    )

    // Its text slides in from the left as it lands.
    staggered(
      tl,
      $(column, "[data-how-text]"),
      { x: how.textFromX, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: how.textDuration, ease: "power2.out" },
      how.textStagger,
      `how+=${landAt(i) - how.riseDuration * 0.35}`
    )

    // Its puzzle tab pops out once the next column has landed beside it.
    const tab = column.querySelector<HTMLElement>("[data-how-tab]")
    if (tab) {
      tl.fromTo(
        tab,
        { scale: 0 },
        {
          scale: 1,
          duration: how.tabDuration,
          ease: how.tabEase,
          immediateRender: true,
        },
        `how+=${landAt(i + 1) - how.riseDuration * 0.2}`
      )
    }
  })

  // ── Read: nothing moves ───────────────────────────────────────────────
  tl.addLabel("howOut", `how+=${landAt(columns.length - 1) + how.read}`)

  // ── Out: columns sink back down, the title lifts away ─────────────────
  columns.forEach((column, i) => {
    tl.to(
      column,
      { yPercent: 100, duration: how.exitDuration, ease: "power2.in" },
      `howOut+=${i * how.exitStagger}`
    )
  })
  tl.to(
    $(root, "[data-how-title]"),
    { y: -40, autoAlpha: 0, duration: how.exitDuration, ease: "power2.in" },
    "howOut"
  )

  // The thin edge rails would sit on top of the coloured columns (with a
  // bone patch behind each label), so they step aside while the columns are
  // up and come back as they sink.
  const rails = $(root, "[data-hero-rail-wrap]")
  tl.to(rails, { autoAlpha: 0, duration: 0.4 }, `how+=${riseAt(0)}`)
  tl.to(rails, { autoAlpha: 1, duration: 0.4 }, `howOut+=${how.exitDuration}`)
}

export const howItWorksAnim = { build }
