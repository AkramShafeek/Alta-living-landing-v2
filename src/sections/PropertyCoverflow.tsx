import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRightIcon, BedIcon, DiamondIcon, DoorOpenIcon, MapPinIcon } from "lucide-react"
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel"
import { Button } from "@/components/ui/button"
import { properties } from "@/content/site"
// import { cn } from "@/lib/utils" // unused — only referenced in commented-out markup

// const monoLabel = "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]" // unused — only referenced in commented-out markup

/**
 * The "pinboard" property display, on `CoverflowCarousel`.
 *
 * Was a `PropertyMarquee` of `PropertyRibbonCard`s — a strip that never stops
 * moving and never asks for a decision. A coverflow is the opposite kind of
 * browsing: one card is deliberately in front, everything else recedes, and
 * the whole point is picking one to look at. That fits "here is our catalog,
 * look through it" better than a marquee does, so this is a replacement for
 * that block rather than an addition next to it — the page had one property
 * display before and still has one now.
 *
 * `CoverflowCarousel` ships its own optional caption panel (`showCaption`),
 * but it renders in shadcn's generic `bg-muted`/`text-foreground` — this site
 * has never used those tokens; every other card here is a white panel with a
 * black border and an offset shadow, an amber accent, and a mono uppercase
 * label. So `showCaption` stays off, and the component's one addition over
 * the original — an `onSelect` callback firing whenever the centred card
 * changes, by drag, arrow key, or dot — drives a "dedicated space" built in
 * that same language instead, immediately below the carousel.
 */

const slides: CoverflowSlide[] = properties.map((property) => ({
  src: property.src,
  alt: `${property.area} — ${property.bedType}, ${property.location}`,
}))

export const PropertyCoverflow = () => {
  const [selected, setSelected] = useState(0)
  const property = properties[selected]

  return (
    <section className="m-8 mt-30 flex flex-col gap-8 rounded-t-[60px] border border-neutral-400 py-16 pb-12">
      <div className="flex items-center justify-center">
        <div>
          <p className="cedarville-cursive-regular mb-1 text-2xl text-center text-black/70">
            the pinboard
          </p>
          <p className="w-full text-left text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Every home, right now
          </p>
        </div>
      </div>

      <CoverflowCarousel
        slides={slides}
        onSelect={setSelected}
        showNavigation
        showPagination
        label="Every home, right now"
        // Bigger than the component's own default (clamp(160px, 22vw, 260px))
        // — six real homes read as a browsable catalogue at this size; at the
        // default they read as thumbnails.
        cardWidth="clamp(180px, 28vw, 380px)"
        cardClassName="rounded-t-4xl"
      />

      {/* The dedicated space: whichever card is centred, described. Keyed on
          `selected` so it re-mounts and re-runs its entrance animation on
          every change rather than only on the first render. */}
      <div
        key={selected}
        className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 text-center duration-300 animate-in fade-in"
      >
        {/* <span className={cn(monoLabel, "text-black/55")}>{property.location}</span> */}
        <h3 className="text-3xl leading-tight font-bold tracking-tight">
          {property.area}
        </h3>
        <p className="text-black/70">{property.hook}</p>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
          <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-blue-50 shadow-sm"><MapPinIcon size={12} /> {property.location}</p>
          <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-blue-50 shadow-sm"><DiamondIcon size={16} /> 1200 sq ft</p>
          <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-amber-50 shadow-sm"><BedIcon size={16} /> {property.bedType}</p>
          <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-emerald-50 shadow-sm"><DoorOpenIcon size={16} /> {property.availability}</p>
          {/* <span className="font-mono text-lg font-bold">
            {property.price}
            <span className="text-xs font-normal text-black/60"> {property.priceUnit}</span>
          </span>
          <span className={cn(monoLabel, "border-2 border-black px-2.5 py-1")}>
            {property.bedType}
          </span>
          <span
            className={cn(
              monoLabel,
              "border-2 border-black bg-green-100 px-2.5 py-1"
            )}
          >
            {property.availability}
          </span> */}
        </div>

        <Button
          asChild
          className="mt-2 h-12 rounded-full border-2 border-black px-6 bg-white text-black shadow-[4px_5px_0px_#000] transition-shadow hover:bg-amber-400 active:shadow-none"
        >
          <Link to={`/listings/${property.slug}`} className="flex items-center gap-2">
            View this home <ArrowRightIcon size={18} />
          </Link>
        </Button>
      </div>

      <div className="flex justify-center">
        <Button
          asChild
          variant="link"
          className="text-foreground"
        >
          <Link to="/listings" className="flex items-center gap-2">
            Browse all properties
          </Link>
        </Button>
      </div>
    </section>
  )
}
