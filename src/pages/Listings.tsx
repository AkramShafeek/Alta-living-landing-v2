import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { PropertyCard } from "@/components/PropertyCard"
import { PillTabs, PillToggles } from "@/components/PillTabs"
import { Slider } from "@/components/ui/slider"
import { Footer } from "@/sections/Footer"
import {
  formatINR,
  selectLocations,
  selectPriceBounds,
  toCardView,
  useAllProperties,
  useCatalogStatus,
  useLoadAllProperties,
} from "@/store/selectors"

// The navbar is fixed and sits flush at the top on every route except home,
// so pages own the offset that keeps their first row clear of it:
// 16px top padding + the 48px logo = 64px of chrome.
const NAV_OFFSET = 64

const RATING_STEPS = [
  { label: "Any", value: "0" },
  { label: "4.7★+", value: "4.7" },
  { label: "4.8★+", value: "4.8" },
  { label: "4.9★+", value: "4.9" },
]

const SORTS = [
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Rating", value: "rating" },
]

const labelClasses =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60"

const Listings = () => {
  const loadAllProperties = useLoadAllProperties()
  const properties = useAllProperties()
  const { status, allLoaded } = useCatalogStatus()

  // The store dedupes and skips when already loaded, so this can fire on every
  // mount without the page coordinating with anything else.
  useEffect(() => {
    void loadAllProperties()
  }, [loadAllProperties])

  // Derived from what is actually loaded rather than a hardcoded list, so a
  // filter can never offer a neighbourhood with nothing behind it.
  const cards = useMemo(() => properties.map(toCardView), [properties])
  const locationOptions = useMemo(() => selectLocations(properties), [properties])
  const bounds = useMemo(() => selectPriceBounds(properties), [properties])

  const [locations, setLocations] = useState<string[]>([])
  const [price, setPrice] = useState<number[] | null>(null)
  const [minRating, setMinRating] = useState("0")
  const [sort, setSort] = useState("price-asc")

  // `price` stays null until the user actually moves the slider, so the range
  // is derived during render rather than synced into state by an effect. That
  // way the slider picks up real bounds the moment the catalog lands, without
  // a cascading render, and without clobbering a range the user has set.
  const range = useMemo(
    () => price ?? [bounds.min, bounds.max],
    [price, bounds.min, bounds.max]
  )

  const filtered = useMemo(() => {
    const [low, high] = range
    return cards
      .filter(
        (card) =>
          (locations.length === 0 || locations.includes(card.location)) &&
          card.nightly >= low &&
          card.nightly <= high &&
          // An unrated home is hidden by a rating filter rather than treated as
          // a zero — too few reviews is not the same as a bad stay.
          (minRating === "0" || (card.rawRating ?? 0) >= Number(minRating))
      )
      .sort((a, b) => {
        if (sort === "price-asc") return a.nightly - b.nightly
        if (sort === "price-desc") return b.nightly - a.nightly
        return (b.rawRating ?? 0) - (a.rawRating ?? 0)
      })
  }, [cards, locations, range, minRating, sort])

  const isFiltered =
    locations.length > 0 || minRating !== "0" || price !== null

  const reset = () => {
    setLocations([])
    setPrice(null)
    setMinRating("0")
  }

  const isLoading = status === "loading" && !allLoaded
  const hasFailed = status === "error" && properties.length === 0

  return (
    <div className="bg-background" style={{ paddingTop: NAV_OFFSET }}>
      <header className="px-8 pt-14">
        <p className="cedarville-cursive-regular text-center text-2xl text-black/70 mb-1">the pinboard</p>
        <div className="flex flex-col justify-center items-center gap-6 flex-wrap">
          <h1 className="bricolage-grotesque-500 text-6xl md:text-7xl leading-none tracking-tight">
            Every home, right now
          </h1>
          <p className="font-mono text-[11px] uppercase text-center tracking-[0.16em] text-muted-foreground max-w-100">
            {allLoaded ? `All ${properties.length} ` : "Our "}homes are visited, measured and
            photographed by us before they go live.
          </p>
        </div>
      </header>

      {/* Filter rail — sticks under the navbar as the grid scrolls past it. */}
      <div
        className="z-30 bg-background border-b-2 border-black px-8 py-6 hidden"
        style={{ top: NAV_OFFSET }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          <div className="flex flex-col gap-2.5">
            <span className={labelClasses}>Neighbourhood</span>
            <PillToggles
              options={locationOptions.map((l) => ({ label: l, value: l }))}
              values={locations}
              onChange={setLocations}
            />
          </div>

          <div className="flex flex-col gap-2.5 min-w-64 flex-1 max-w-90">
            <div className="flex justify-between items-baseline gap-4">
              <span className={labelClasses}>Price per night</span>
              <span className="font-mono text-[11px] font-semibold tracking-widest">
                {formatINR(range[0])} — {formatINR(range[1])}
              </span>
            </div>
            <Slider
              value={range}
              onValueChange={setPrice}
              min={bounds.min}
              max={bounds.max}
              disabled={bounds.max === 0}
              step={100}
              minStepsBetweenThumbs={1}
              aria-label="Price per night"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <span className={labelClasses}>Rating</span>
            <PillTabs options={RATING_STEPS} value={minRating} onChange={setMinRating} />
          </div>

          <div className="flex flex-col gap-2.5">
            <span className={labelClasses}>Sort by</span>
            <PillTabs options={SORTS} value={sort} onChange={setSort} />
          </div>

          <div className="flex items-center gap-4 pb-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {filtered.length} of {cards.length} homes
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2.5 bg-white border-2 border-black shadow-[3px_3px_0_#000] font-mono text-[10px] font-semibold uppercase tracking-[0.16em] hover:bg-black hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-10">
        {isLoading ? (
          // Skeletons rather than a spinner: the grid keeps its shape, so the
          // page does not jump when the real cards land.
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className="h-110 border-2 border-black bg-white shadow-[8px_10px_0_#000] animate-pulse"
              />
            ))}
          </div>
        ) : hasFailed ? (
          <div className="border-2 border-black bg-white shadow-[8px_10px_0_#000] p-14 text-center flex flex-col items-center gap-4">
            <p className="cedarville-cursive-regular text-3xl text-black/70">the board is down</p>
            <h2 className="bricolage-grotesque-500 text-3xl leading-none tracking-tight">
              We could not load the homes
            </h2>
            <p className="text-base text-black/70 max-w-100 text-balance">
              Something went wrong on our side, not yours. Try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => void loadAllProperties({ force: true })}
              className="mt-2 inline-flex items-center gap-2.5 px-7 py-4 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all"
            >
              Try again <span className="text-lg leading-none">→</span>
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {filtered.map((card, i) => (
              <motion.div
                key={card.slug}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(i, 5) * 0.05 }}
                className="flex"
              >
                <PropertyCard to={`/listings/${card.slug}`} property={card} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-black bg-white shadow-[8px_10px_0_#000] p-14 text-center flex flex-col items-center gap-4">
            <p className="cedarville-cursive-regular text-3xl text-black/70">nothing on the board</p>
            <h2 className="bricolage-grotesque-500 text-3xl leading-none tracking-tight">
              No homes match those filters
            </h2>
            <p className="text-base text-black/70 max-w-100 text-balance">
              We only keep homes we can reach in twenty minutes, so the portfolio is deliberately
              small. Widen the price range or clear a neighbourhood and try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 inline-flex items-center gap-2.5 px-7 py-4 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all"
            >
              Clear filters <span className="text-lg leading-none">→</span>
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Listings
