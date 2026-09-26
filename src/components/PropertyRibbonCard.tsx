import { MapPinIcon, StarIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { PropertyCardData } from "./PropertyCard"

/**
 * The property card, rebuilt for the rotating ribbon.
 *
 * A clone of `PropertyCard` rather than a variant of it, on purpose: the grid
 * card is load-bearing on two pages and its design is settled, and what the
 * ribbon needs is not a tweak but a different set of rules.
 *
 * Redesigned again once the ribbon was actually turning in 3D: a full metadata
 * card reads as a form when it is tilted and moving, and the four-way strip of
 * icons was fighting the perspective rather than riding it. What survives here
 * is closer to a photograph than a listing — the picture fills the whole card,
 * and the only copy is a gradient-anchored caption naming the place and its
 * price, the two facts worth knowing before you have even stopped to look.
 * Everything else — beds, availability, "view" — lives one click away, at
 * `to`, once the card belongs to the visitor's attention rather than to a
 * slow-turning ribbon.
 *
 * `backface-visibility: hidden` stays: the card is rotated in 3D, and without
 * it a card past ±90° mirrors instead of disappearing.
 *
 * The data contract is unchanged — it still takes `PropertyCardData`, so the
 * ribbon, the grid card and this one are all fed from one list.
 */

/** The ribbon reads these to lay out its track. Exported so they cannot drift. */
export const RIBBON_CARD_WIDTH = 300
export const RIBBON_CARD_HEIGHT = 420

export const PropertyRibbonCard = ({
  property,
  to,
  className,
}: {
  property?: PropertyCardData
  /** When set, the whole card becomes a link to the property page. */
  to?: string
  className?: string
}) => {
  const {
    src,
    area = "Property Title",
    location = "Location",
    bedType = "1BHK",
    price = "₹ 30,000",
    rating,
  } = property ?? {}

  const card = (
    <div
      className={cn(
        "group/ribbon relative h-full w-full overflow-hidden rounded-[1.75rem]",
        "border border-black/10 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]",
        "[backface-visibility:hidden]",
        className
      )}
    >
      <img
        src={src || "/3.jpg"}
        alt={`${area} — ${bedType}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/ribbon:scale-[1.06]"
      />

      {/* One gradient, doing two jobs: it is the only thing that makes white
          text on an arbitrary photo reliably readable, and it is what turns a
          plain photo into something that reads as a card. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      {rating && (
        <span className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-black backdrop-blur-sm">
          <StarIcon size={11} className="fill-black" /> {rating}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-white">
        <span className="flex items-center gap-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-white/75 uppercase">
          <MapPinIcon size={11} /> {location}
        </span>
        <p className="text-xl leading-tight font-bold text-balance">{area}</p>
        <p className="flex items-baseline gap-1 text-sm font-semibold">
          {price}
          <span className="text-xs font-normal text-white/70">/ month</span>
        </p>
      </div>
    </div>
  )

  return to ? (
    <Link to={to} className="block h-full w-full">
      {card}
    </Link>
  ) : (
    card
  )
}
