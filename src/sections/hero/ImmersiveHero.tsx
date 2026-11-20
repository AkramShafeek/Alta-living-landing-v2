import { useRef, type CSSProperties } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { immersiveHero } from "@/content/site"
import { HERO_MOTION } from "./motion"
import { IntroScene } from "./IntroScene"
import { introAnim } from "./IntroScene.anim"
import { PromiseScene } from "./PromiseScene"
import { promiseAnim } from "./PromiseScene.anim"
import { AreasScene } from "./AreasScene"
import { areasAnim } from "./AreasScene.anim"
import { HowItWorksScene } from "./HowItWorksScene"
import { howItWorksAnim } from "./HowItWorksScene.anim"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * The immersive hero: one bone-white panel that stays fixed while a single
 * scrubbed timeline plays four scenes in turn, then the page carries on.
 *
 *   1. IntroScene       — copy + button on load; headline waves up, splits
 *   2. PromiseScene     — promise, popping squares, photo strip, pulled off right
 *   3. AreasScene       — right-aligned text + pinwheel dial of neighbourhoods
 *   4. HowItWorksScene  — four calm, readable steps, then up and out
 *
 * To reorder, add or remove a scene, edit SCENES. Each scene is a pair of
 * files: `XScene.tsx` is its layout, `XScene.anim.ts` its scroll steps.
 * Timings are in motion.ts; copy is in content/site.ts.
 *
 * How the panel stays fixed: the <section> is tall and the inner panel is
 * `sticky top-0 h-dvh`, so the browser holds it while you scroll through.
 * The section's height is set from the timeline's length (× vhPerUnit), so
 * longer animations automatically get more scrolling. ScrollTrigger reads
 * progress through the section and scrubs the timeline.
 */
const SCENES = [
  { View: IntroScene, build: introAnim.build },
  { View: PromiseScene, build: promiseAnim.build },
  { View: AreasScene, build: areasAnim.build },
  { View: HowItWorksScene, build: howItWorksAnim.build },
]

export const ImmersiveHero = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = sectionRef.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          ok: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          // Reduced motion: skip the self-playing intro. The scroll story
          // stays, because it only moves when the visitor scrolls.
          if (!context.conditions?.reduce) introAnim.playOnLoad(root)

          const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true })
          SCENES.forEach((scene) => scene.build(tl, root))
          tl.to({}, { duration: HERO_MOTION.hold })

          root.style.height = `calc(${tl.duration() * HERO_MOTION.vhPerUnit}vh + 100dvh)`
          ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: HERO_MOTION.scrub,
            animation: tl,
            invalidateOnRefresh: true, // re-measure on resize
          })
        }
      )

      return () => mm.revert()
    },
    { scope: sectionRef }
  )

  const { background, ink, rails } = immersiveHero

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh"
      // Colours come from two CSS variables so a scene can repaint the whole
      // panel by tweening them (the areas scene does, per area).
      style={
        {
          "--hero-bg": background,
          "--hero-ink": ink,
          background: "var(--hero-bg)",
          color: "var(--hero-ink)",
        } as CSSProperties
      }
    >
      <div
        data-hero-panel
        className="sticky top-0 h-dvh w-full overflow-hidden"
        style={{ background: "var(--hero-bg)", color: "var(--hero-ink)" }}
      >
        {/* Thin rails down both edges, each with a vertical label. Present
            through every scene. */}
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            data-hero-rail-wrap
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 z-10 hidden w-px md:block ${
              side === "left" ? "left-6" : "right-6"
            }`}
          >
            <div
              data-hero-rail
              className="h-full w-full origin-top bg-current opacity-15"
            />
            <span
              data-hero-rail-label
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 py-3 font-mono text-[10px] tracking-[0.3em] whitespace-nowrap uppercase opacity-60 [writing-mode:vertical-rl]"
              style={{ background: "var(--hero-bg)" }}
            >
              {rails[side]}
            </span>
          </div>
        ))}

        {SCENES.map((Scene, i) => (
          <Scene.View key={i} />
        ))}
      </div>
    </section>
  )
}
