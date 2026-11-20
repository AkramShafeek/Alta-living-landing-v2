import type { ComponentProps } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRightIcon } from "lucide-react"
import { immersiveHero } from "@/content/site"

/**
 * The "View homes" pill. Rendered twice: the real, moving button (scene 1)
 * and an invisible copy under the promise copy that marks where it lands
 * (scene 2). Change its look here; the label and link live in
 * `immersiveHero.cta`.
 */
export const CtaButton = (
  props: Omit<ComponentProps<typeof Link>, "to" | "children">
) => {
  const { cta, ink, background } = immersiveHero
  return (
    <Link
      {...props}
      to={cta.to}
      className="group inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-sm font-medium tracking-wide whitespace-nowrap transition-transform hover:scale-[1.03]"
      style={{ background: ink, color: background }}
    >
      {cta.label}
      <span
        className="grid size-8 place-items-center rounded-full transition-transform group-hover:rotate-45"
        style={{ background, color: ink }}
      >
        <ArrowUpRightIcon className="size-4" />
      </span>
    </Link>
  )
}
