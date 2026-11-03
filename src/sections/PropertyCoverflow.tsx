import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRightIcon, BedIcon, DiamondIcon, DoorOpenIcon, MapPinIcon } from "lucide-react"
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel"
import { Button } from "@/components/ui/button"
import { pinboard } from "@/content/site"
import {
  selectHomePageProperties,
  toCardView,
  useAllProperties,
  useCatalogStatus,
  useLoadAllProperties,
} from "@/store/selectors"

/**
 * The "pinboard" property display, on `CoverflowCarousel`.
 *
 * One card is deliberately in front, everything else recedes, and the point
 * is picking one to look at. The homes are the catalog's own — the same
 * rows, photos, prices and availability the listings page shows — so the
 * landing page cannot advertise a home, a price or an area that is not
 * real. Which homes appear is `selectHomePageProperties`.
 *
 * `CoverflowCarousel` ships its own caption panel (`showCaption`) in shadcn's
 * generic tokens; this site's cards are white panels with a black border and
 * an offset shadow. So the caption stays off and `onSelect` drives a panel
 * built in the site's own language, below the carousel.
 */
export const PropertyCoverflow = () => {
  const loadAllProperties = useLoadAllProperties()
  const { status, allLoaded } = useCatalogStatus()
  const properties = useAllProperties()

  // The store dedupes, so this is free if the listings page already loaded.
  useEffect(() => {
    void loadAllProperties()
  }, [loadAllProperties])

  const homes = useMemo(
    () => selectHomePageProperties(properties).map(toCardView),
    [properties]
  )
  const slides: CoverflowSlide[] = useMemo(
    () => homes.map((home) => ({ src: home.src!, alt: `${home.area}, ${home.location}` })),
    [homes]
  )

  const [selected, setSelected] = useState(0)
  const home = homes[Math.min(selected, Math.max(homes.length - 1, 0))]

  return (
    <section
      id="homes"
      className="m-8 mt-30 flex flex-col gap-8 rounded-t-[60px] border border-neutral-400 py-16 pb-12"
    >
      <div className="flex items-center justify-center">
        <div>
          <p className="cedarville-cursive-regular mb-1 text-2xl text-center text-black/70">
            {pinboard.eyebrow}
          </p>
          <p className="w-full text-center text-4xl leading-[0.95] tracking-tight md:text-6xl">
            {pinboard.headline}
          </p>
        </div>
      </div>

      {home ? (
        <>
          <CoverflowCarousel
            slides={slides}
            onSelect={setSelected}
            showNavigation
            showPagination
            label={pinboard.headline}
            // Bigger than the component's own default — real homes read as a
            // browsable catalogue at this size; at the default, as thumbnails.
            cardWidth="clamp(180px, 28vw, 380px)"
            cardClassName="rounded-t-4xl"
          />

          {/* Whichever card is centred, described. Keyed on the home so it
              re-runs its entrance animation on every change. */}
          <div
            key={home.slug}
            className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 text-center duration-300 animate-in fade-in"
          >
            <h3 className="text-3xl leading-tight font-bold tracking-tight">{home.area}</h3>
            <p className="text-black/70">{home.hook}</p>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
              <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-blue-50 shadow-sm"><MapPinIcon size={12} /> {home.location}</p>
              <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-blue-50 shadow-sm"><DiamondIcon size={16} /> {home.size}</p>
              <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-amber-50 shadow-sm"><BedIcon size={16} /> {home.bedType}</p>
              <p className="flex text-xs items-center gap-1 rounded-full px-2 py-1 bg-emerald-50 shadow-sm"><DoorOpenIcon size={16} /> {home.availability}</p>
            </div>

            <p className="text-sm">
              {home.unpriced ? (
                <span className="text-black/60">{home.price}</span>
              ) : (
                <>
                  From <span className="font-mono text-lg font-bold">{home.price}</span>
                  <span className="text-black/60"> / {home.priceUnit}</span>
                </>
              )}
            </p>

            <Button
              asChild
              className="mt-2 h-12 rounded-full border-2 border-black px-6 bg-white text-black shadow-[4px_5px_0px_#000] transition-shadow hover:bg-amber-400 active:shadow-none"
            >
              <Link to={`/listings/${home.slug}`} className="flex items-center gap-2">
                {pinboard.ctaLabel} <ArrowRightIcon size={18} />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <p className="py-16 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-black/60">
          {status === "error" && !allLoaded
            ? "Couldn't load the homes just now."
            : allLoaded
              ? "New homes going up soon."
              : "Pinning up the homes…"}
        </p>
      )}

      <div className="flex justify-center">
        <Button asChild variant="link" className="text-foreground">
          <Link to="/listings" className="flex items-center gap-2">
            {pinboard.allLabel}
          </Link>
        </Button>
      </div>
    </section>
  )
}
