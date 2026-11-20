import { gsap } from "gsap"

/**
 * Every scene is a pair: XScene.tsx (layout) and XScene.anim.ts (steps):
 *   View  — its layout (an absolutely positioned layer in the fixed panel);
 *   build — adds its scroll steps to the shared, scrubbed timeline.
 * Scenes find their elements by data-* attribute inside `root` (the hero
 * <section>), so no refs need passing between files.
 */
export type SceneBuild = (tl: gsap.core.Timeline, root: HTMLElement) => void

/** All elements matching `selector` inside the hero. */
export const $ = (root: HTMLElement, selector: string) =>
  gsap.utils.toArray<HTMLElement>(selector, root)

/** The first element matching `selector` inside the hero (throws if missing). */
export const $1 = (root: HTMLElement, selector: string) => {
  const el = root.querySelector<HTMLElement>(selector)
  if (!el) throw new Error(`ImmersiveHero: nothing matches ${selector}`)
  return el
}

/**
 * Tween values that glide `mover` onto `slot` (an invisible stand-in of the
 * same size). Measured live — and again on resize — subtracting the mover's
 * own current offset to get its resting layout position, so it lands exactly
 * on the slot wherever the mover is coming from. Used for the "View homes"
 * button's trip from scene to scene.
 */
export const glideTo = (mover: HTMLElement, slot: HTMLElement) => {
  const axis = (a: "x" | "y") => () => {
    const from = mover.getBoundingClientRect()
    const to = slot.getBoundingClientRect()
    const current = Number(gsap.getProperty(mover, a))
    return a === "x"
      ? to.left - (from.left - current)
      : to.top - (from.top - current)
  }
  return { x: axis("x"), y: axis("y") }
}

/**
 * One fromTo per element, `gap` apart, starting at `at`.
 *
 * Why not GSAP's own `stagger`: inside a scrubbed timeline a staggered tween
 * only applies the start state to elements whose turn has already begun, so
 * the rest show up in the wrong place on page load. Separate tweens with
 * immediateRender each apply their start state straight away.
 */
export const staggered = (
  tl: gsap.core.Timeline,
  targets: HTMLElement[],
  from: gsap.TweenVars,
  to: gsap.TweenVars,
  gap: number,
  at: string | number
) => {
  targets.forEach((el, i) => {
    const position = typeof at === "number" ? at + i * gap : `${at}+=${i * gap}`
    tl.fromTo(el, from, { ...to, immediateRender: true }, position)
  })
}
