import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Tabs } from "radix-ui"
import { XIcon } from "lucide-react"
import {
  AMENITY_ICONS,
  CATALOG_ICON_SIZE,
  INCLUDED_ICONS,
  NEARBY_ICONS,
} from "@/lib/catalogIcons"
import type { AmenityKey, IncludedKey } from "@/models/common"
import { Tag } from "@/components/Tag"
import { ContactCard } from "@/components/ContactCard"
import { Footer } from "@/sections/Footer"
import { cn } from "@/lib/utils"
import { useCatalogStore } from "@/store/catalogStore"
import type { UnitDetail } from "@/store/types"

// Matches the listings page — the fixed navbar occupies the first 64px.
const NAV_OFFSET = 64

const monoLabel =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"

// Read straight off `PropertyDetail` for now — no selector layer. These are the
// few formatting bits the page cannot do without, kept local so there is one
// obvious place to lift them from when selectors come back.
const formatINR = (value: number) => `₹ ${value.toLocaleString("en-IN")}`

/** "fully_furnished" → "Fully furnished". */
const humanise = (key: string) =>
  key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`

/** A label/value pair the page renders only when the value is present. */
type Fact = { label: string; value: string | undefined }
const present = (facts: Fact[]) => facts.filter((f): f is Required<Fact> => Boolean(f.value))

/** Only `available` can be taken. `on_notice` is leaving, but not tonight. */
const isBookable = (unit: UnitDetail | undefined) => unit?.status === "available"

/** A titled block that renders nothing when it has nothing to say. */
const Block = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div>
    <p className="font-mono font-semibold uppercase tracking-[0.18em] mb-3.5">
      {title}
    </p>
    {children}
  </div>
)

/**
 * The amenity tick list.
 *
 * Rendered twice on purpose — once in the summary column, once in the
 * reference panel below — so the panel reads as a complete account of the home
 * rather than as the leftovers of the column above it.
 */
const AmenityGrid = ({ amenities }: { amenities: readonly AmenityKey[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-l-2 border-black">
    {amenities.map((amenity) => {
      const Icon = AMENITY_ICONS[amenity]
      return (
        <div
          key={amenity}
          className="flex items-center gap-2.5 px-4 py-3.5 border-r-2 border-b-2 border-black font-mono text-[13px] uppercase tracking-[0.08em]"
        >
          <Icon size={CATALOG_ICON_SIZE} aria-hidden className="shrink-0" />
          {humanise(amenity)}
        </div>
      )
    })}
  </div>
)

/** Included and excluded, side by side — the exclusions carry a note. */
const PriceGrid = ({
  included,
  notIncluded,
}: {
  included: readonly IncludedKey[]
  notIncluded: readonly { item: string; note: string }[]
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-l-2 border-black">
    {included.map((key) => {
      const Icon = INCLUDED_ICONS[key]
      return (
        <div
          key={key}
          className="flex items-center gap-2.5 px-4 py-3.5 border-r-2 border-b-2 border-black font-mono text-[13px] uppercase tracking-[0.08em]"
        >
          <Icon size={CATALOG_ICON_SIZE} aria-hidden className="shrink-0" />
          {humanise(key)}
        </div>
      )
    })}
    {/* `item` is free text, not an enum, so there is nothing to map it to. */}
    {notIncluded.map((entry) => (
      <div
        key={entry.item}
        className="flex items-start gap-2.5 px-4 py-3.5 border-r-2 border-b-2 border-black font-mono text-[13px] text-black/65"
      >
        <XIcon size={CATALOG_ICON_SIZE} aria-hidden className="shrink-0 mt-0.5" />
        <span>
          <span className="uppercase tracking-[0.08em]">{entry.item}</span>
          {entry.note && <span className="block normal-case mt-1">{entry.note}</span>}
        </span>
      </div>
    ))}
  </div>
)

const FactGrid = ({ facts }: { facts: Required<Fact>[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-l-2 border-black">
    {facts.map((fact) => (
      <div key={fact.label} className="px-4 py-3.5 border-r-2 border-b-2 border-black">
        <p className={monoLabel}>{fact.label}</p>
        <p className="font-mono text-[13px] mt-1">{fact.value}</p>
      </div>
    ))}
  </div>
)

/**
 * The reference detail, folded away.
 *
 * Housekeeping, nearby, rules and terms are what someone checks once they are
 * already interested, not what decides them. Stacked inline they pushed the
 * rooms table — the one thing on this page that takes a decision — below three
 * screens of near-identical grids, and the reader had to scroll past all four
 * whether or not any of them mattered.
 *
 * Tabs rather than accordions because these are alternatives, not a sequence:
 * nobody reads the deposit terms and the walk to the metro in the same breath.
 * Vertical, so the labels read as a list of questions you can scan and answer
 * one at a time.
 */
type Panel = {
  id: string
  label: string
  /** Shown beside the label, so the size of a section is visible before opening it. */
  count: number
  /** One line of orientation, in the product's voice. */
  blurb: string
  content: React.ReactNode
}

const MoreDetails = ({ name, panels }: { name: string; panels: Panel[] }) => {
  const [active, setActive] = useState(panels[0].id)

  return (
    <Tabs.Root
      value={active}
      onValueChange={setActive}
      orientation="vertical"
      className="border-2 overflow-hidden border-black shadow-[8px_10px_0_#000] bg-white grid md:grid-cols-[minmax(0,16rem)_1fr] md:min-h-56"
    >
      <Tabs.List
        aria-label={`More details about ${name}`}
        className="flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-black bg-amber-50"
      >
        {panels.map((panel) => (
          <Tabs.Trigger
            key={panel.id}
            value={panel.id}
            className={cn(
              "group text-left px-5 py-4.5 border-b-2 border-black/15 last:border-b-0",
              "font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
              "transition-colors hover:bg-amber-200",
              "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black",
              "data-[state=active]:bg-amber-400 data-[state=active]:shadow-[inset_6px_0_0_#000]"
            )}
          >
            <span className="flex items-baseline justify-between gap-3">
              {panel.label}
              <span className="text-[10px] tabular-nums text-black/60 group-data-[state=active]:text-black/75">
                {panel.count}
              </span>
            </span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {panels.map((panel) => (
        <Tabs.Content
          key={panel.id}
          value={panel.id}
          className="p-6 md:p-8 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-5 leading-loose">
            {panel.blurb}
          </p>
          {panel.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

/** Shared shell for the loading, error and not-found states. */
const Notice = ({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children?: React.ReactNode
}) => (
  <div className="bg-background min-h-dvh flex flex-col" style={{ paddingTop: NAV_OFFSET }}>
    <div className="flex-1 flex items-center justify-center px-8 py-24">
      <div className="border-2 border-black bg-white shadow-[8px_10px_0_#000] p-14 text-center flex flex-col items-center gap-4 max-w-140">
        <p className="cedarville-cursive-regular text-3xl text-black/70">{eyebrow}</p>
        <h1 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight">{title}</h1>
        <p className="text-base text-black/70 text-balance">{body}</p>
        {children}
      </div>
    </div>
    <Footer />
  </div>
)

const allHomesLink = (
  <Link
    to="/listings"
    className="mt-2 inline-flex items-center gap-2.5 px-7 py-4 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all"
  >
    See every home <ArrowRightIcon size={16} />
  </Link>
)

const Property = () => {
  const { slug } = useParams()

  const loadProperty = useCatalogStore((state) => state.loadProperty)
  const status = useCatalogStore((state) => state.status)
  const error = useCatalogStore((state) => state.error)
  const notFound = useCatalogStore((state) => (slug ? state.notFound.includes(slug) : false))

  // Two subscriptions rather than one derived object: each returns a stable
  // reference, so zustand's Object.is comparison does not re-render every tick.
  const id = useCatalogStore((state) => (slug ? state.slugIndex[slug] : undefined))
  const detail = useCatalogStore((state) => (id ? state.properties[id] : undefined))

  // The store dedupes, skips what it already has, and remembers a bad slug, so
  // this can fire on every mount without coordinating with the listings page.
  useEffect(() => {
    if (slug) void loadProperty(slug)
  }, [slug, loadProperty])

  // `selected` is the room index, or -1 for the whole property.
  const [selected, setSelected] = useState(-1)
  const [photo, setPhoto] = useState(0)

  if (notFound) {
    return (
      <Notice
        eyebrow="not on the board"
        title="We can't find that home"
        body="It may have been taken off the board, or the link is off by a character."
      >
        {allHomesLink}
      </Notice>
    )
  }

  if (status === "error" && !detail) {
    return (
      <Notice
        eyebrow="something broke"
        title="We couldn't load this home"
        body={error ?? "Please try again in a moment."}
      >
        {allHomesLink}
      </Notice>
    )
  }

  if (!detail) {
    return (
      <Notice
        eyebrow="one moment"
        title="Fetching the board"
        body="Pulling the latest availability for this home."
      />
    )
  }

  const { property, photos, units, amenities, highlights, reviews } = detail
  const { nearby, housekeeping, notIncluded, includedInPrice } = detail

  const rooms = units.filter((unit) => unit.kind === "room")
  const whole = units.find((unit) => unit.kind === "entire")
  const selectedRoom = selected >= 0 ? rooms[selected] : undefined

  const openRooms = rooms.filter(isBookable).length
  const availability =
    rooms.length === 0
      ? isBookable(whole)
        ? "Available now"
        : "Fully booked"
      : openRooms === 0
        ? "Fully booked"
        : `${openRooms} of ${rooms.length} available`

  const area = `${property.neighbourhood}, ${property.city}`
  const beds = property.propertyType === "studio" ? "Studio" : `${property.bedrooms} BHK`
  const size = `${property.carpetAreaSqft.toLocaleString("en-IN")} sq ft`

  // Every value below comes from a column. Enum values render through
  // `humanise` rather than a label map, so adding a member to an enum in
  // models/common.ts displays correctly without touching this file.
  const essentials = present([
    {
      label: "Wi-Fi",
      value: `${property.wifiDownMbps} Mbps${property.wifiWired ? " · wired" : ""}${
        property.wifiProvider ? ` · ${property.wifiProvider}` : ""
      }`,
    },
    { label: "Power backup", value: humanise(property.powerBackup) },
    { label: "Air conditioning", value: humanise(property.acRooms) },
    { label: "Kitchen", value: humanise(property.kitchenType) },
    { label: "Laundry", value: humanise(property.laundry) },
    {
      label: "Water",
      value: `${humanise(property.waterSource)} · ${humanise(
        property.waterHotWater
      )} · ${humanise(property.waterDrinking)} drinking`,
    },
    {
      label: "Parking",
      value:
        property.parkingCar + property.parkingTwoWheeler > 0
          ? [
              property.parkingCar > 0 ? plural(property.parkingCar, "car") : undefined,
              property.parkingTwoWheeler > 0
                ? plural(property.parkingTwoWheeler, "two-wheeler")
                : undefined,
              property.parkingCovered ? "covered" : undefined,
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined,
    },
    { label: "Sleeps", value: plural(property.maxOccupancy, "guest") },
    {
      label: "Desks",
      value:
        property.deskCount > 0
          ? `${plural(property.deskCount, "desk")}${
              property.taskChairCount > 0
                ? ` · ${plural(property.taskChairCount, "task chair")}`
                : ""
            }`
          : undefined,
    },
    {
      label: "Floor",
      value:
        property.floor === undefined
          ? undefined
          : `${property.floor === 0 ? "Ground" : property.floor}${
              property.totalFloors ? ` of ${property.totalFloors}` : ""
            }${property.hasLift ? " · lift" : " · no lift"}`,
    },
    { label: "Balconies", value: property.balconies > 0 ? String(property.balconies) : undefined },
  ])

  const rules = present([
    { label: "Suited to", value: humanise(property.tenantFit) },
    { label: "Smoking", value: humanise(property.smoking) },
    { label: "Alcohol", value: humanise(property.alcohol) },
    { label: "Pets", value: humanise(property.pets) },
    { label: "Overnight guests", value: humanise(property.overnightGuests) },
    { label: "Parties", value: humanise(property.partyPolicy) },
    { label: "Sharing with", value: property.sharedWith },
  ])

  const terms = present([
    { label: "Minimum stay", value: plural(property.minStayNights, "night") },
    {
      label: "Deposit",
      value: whole && whole.deposit > 0 ? formatINR(whole.deposit) : undefined,
    },
    {
      label: "Notice period",
      value: property.noticePeriodDays > 0 ? plural(property.noticePeriodDays, "day") : undefined,
    },
    {
      label: "Lock-in",
      value: property.lockInMonths > 0 ? plural(property.lockInMonths, "month") : undefined,
    },
    { label: "Agreement", value: humanise(property.agreementType) },
    { label: "KYC", value: property.kycRequired ? "Required" : "Not required" },
    { label: "GST invoice", value: property.gstInvoice ? "Available" : undefined },
    { label: "Linen change", value: humanise(property.linenChange) },
  ])

  // Built here rather than inside the component so an empty group simply is not
  // offered — a tab that opens onto nothing is worse than a missing tab.
  const panels: Panel[] = [
    (includedInPrice.length > 0 || notIncluded.length > 0) && {
      id: "price",
      label: "What's in the price",
      count: includedInPrice.length + notIncluded.length,
      blurb: "What the rent covers, and what it doesn't.",
      content: <PriceGrid included={includedInPrice} notIncluded={notIncluded} />,
    },
    essentials.length > 0 && {
      id: "essentials",
      label: "The essentials",
      count: essentials.length,
      blurb: "Wi-Fi, power, water, kitchen — what a month here runs on.",
      content: <FactGrid facts={essentials} />,
    },
    amenities.length > 0 && {
      id: "amenities",
      label: "Amenities",
      count: amenities.length,
      blurb: "Everything the home comes with.",
      content: <AmenityGrid amenities={amenities} />,
    },
    housekeeping.length > 0 && {
      id: "housekeeping",
      label: "Housekeeping",
      count: housekeeping.length,
      blurb: "What gets cleaned, and how often.",
      content: (
        <FactGrid
          facts={housekeeping.map((task) => ({
            label: humanise(task.cover),
            value: humanise(task.frequency),
          }))}
        />
      ),
    },
    nearby.length > 0 && {
      id: "nearby",
      label: "Nearby",
      count: nearby.length,
      blurb: "How long it takes to reach the places you'll actually go.",
      content: (
        <div className="border-t-2 border-l-2 border-black">
          {nearby.map((place) => {
            const Icon = NEARBY_ICONS[place.kind]
            return (
              <div
                key={`${place.kind}-${place.name}`}
                className="flex justify-between items-center gap-4 px-4 py-3.5 border-r-2 border-b-2 border-black"
              >
                <span className="flex items-center gap-2.5 font-mono text-[13px]">
                  <Icon size={CATALOG_ICON_SIZE} aria-hidden className="shrink-0" />
                  {place.name}
                  <span className={monoLabel}>{humanise(place.kind)}</span>
                </span>
                <span className="font-mono text-[13px] font-bold whitespace-nowrap">
                  {plural(place.minutes, "min")} {place.mode}
                </span>
              </div>
            )
          })}
        </div>
      ),
    },
    rules.length > 0 && {
      id: "rules",
      label: "House rules",
      count: rules.length,
      blurb: "What's allowed, so nothing is a surprise on arrival.",
      content: <FactGrid facts={rules} />,
    },
    terms.length > 0 && {
      id: "terms",
      label: "Stay terms",
      count: terms.length,
      blurb: "Deposit, notice and paperwork.",
      content: <FactGrid facts={terms} />,
    },
  ].filter(Boolean) as Panel[]

  const monthly = selectedRoom?.monthlyRate ?? whole?.monthlyRate ?? 0
  const nightly = whole?.nightlyRate ?? 0

  // Guarded so an empty gallery cannot produce `n % 0` → NaN.
  const photoCount = photos.length
  const activePhoto = photoCount > 0 ? photo % photoCount : 0
  const currentPhoto = photos[activePhoto]

  return (
    <div className="bg-background" style={{ paddingTop: NAV_OFFSET }}>
      <div className="px-8 py-5 flex justify-between items-center gap-4 flex-wrap">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 border-b border-b-transparent hover:border-b-black font-mono text-[11px] font-semibold uppercase tracking-[0.16em]  transition-colors"
        >
          <ArrowLeftIcon size={14} /> All properties
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {area}
        </span>
      </div>

      <div className="grid lg:grid-cols-[2fr_3fr] items-start">
        {/* ── details ── */}
        <div className="p-8 md:p-11 pb-18 border-b-2 lg:border-b-0 lg:border-r-2 border-t-2 border-black flex flex-col gap-8">
          <div className="flex flex-col gap-3.5">
            <p className={monoLabel}>
              {beds} · {size} · {property.furnishing === "fully" ? "Fully furnished" : "Semi furnished"}
            </p>
            <h1 className="bricolage-grotesque-500 text-5xl md:text-6xl leading-[0.92] tracking-tight">
              {property.name}
            </h1>
            {property.hook && (
              <p className="text-[17px] leading-relaxed text-black/80 text-pretty">
                {property.hook}
              </p>
            )}
            {property.founderNote && (
              <p className="cedarville-cursive-regular text-2xl text-black/70">
                {property.founderNote}
              </p>
            )}
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <Tag tone="solid">{area}</Tag>
            <Tag>{beds}</Tag>
            <Tag>{size}</Tag>
            <Tag className="bg-blue-50">{availability}</Tag>
          </div>

          <div className="grid grid-cols-2 border-2 border-black shadow-[6px_6px_0_#000] bg-white">
            <div className="p-6 border-r-2 border-black">
              <p className={cn(monoLabel, "mb-2")}>Per night</p>
              <p className="font-mono text-3xl font-bold">{formatINR(nightly)}</p>
            </div>
            <div className="p-6 bg-amber-400">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                Monthly
                {includedInPrice.length > 0 && ` · ${includedInPrice.length} included`}
              </p>
              <p className="font-mono text-3xl font-bold">
                {formatINR(whole?.monthlyRate ?? 0)}
              </p>
            </div>
          </div>

          <p className="text-[17px] leading-relaxed text-black/70 text-pretty">{property.body}</p>

          {amenities.length > 0 && (
            <Block title="Amenities">
              <AmenityGrid amenities={amenities} />
            </Block>
          )}

          {highlights.length > 0 && (
            <div className="grid grid-cols-3 border-2 border-black">
              {highlights.map((fact, i) => (
                <div
                  key={fact.label}
                  className={cn(
                    "p-4 flex flex-col gap-2",
                    i < highlights.length - 1 && "border-r border-black/25"
                  )}
                >
                  <span className="bricolage-grotesque-500 text-3xl leading-none">
                    {fact.value}
                  </span>
                  <span className={monoLabel}>{fact.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <a
              href="#enquire"
              className="inline-flex items-center gap-2.5 px-7 py-4.5 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all"
            >
              Enquire about this home <span className="text-lg leading-none">→</span>
            </a>
            <a
              href="#enquire"
              className="inline-flex items-center px-7 py-4.5 border-2 border-black font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:bg-black hover:text-white transition-colors"
            >
              Book a viewing
            </a>
          </div>
        </div>

        {/* ── gallery, held in place while the details scroll ── */}
        <div
          className="lg:sticky bg-[#141311] flex flex-col border-t-2 border-black"
          style={{ top: 0, height: `calc(100dvh)` }}
        >
          {currentPhoto ? (
            <>
              <div className="relative flex-1 overflow-hidden min-h-100">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute left-5 top-5 flex gap-2">
                  <span className="px-3 py-1.5 bg-black/55 backdrop-blur-xs text-background border-2 border-background font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                    {availability}
                  </span>
                  <span className="px-3 py-1.5 bg-amber-400 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                    {activePhoto + 1} / {photoCount}
                  </span>
                </div>
                {photoCount > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={() => setPhoto((p) => (p - 1 + photoCount) % photoCount)}
                      className="absolute left-5 top-1/2 -translate-y-1/2 size-13 bg-background border-2 border-black shadow-[4px_4px_0_#000] flex items-center justify-center hover:bg-amber-400 transition-colors"
                    >
                      <ArrowLeftIcon size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={() => setPhoto((p) => (p + 1) % photoCount)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 size-13 bg-background border-2 border-black shadow-[4px_4px_0_#000] flex items-center justify-center hover:bg-amber-400 transition-colors"
                    >
                      <ArrowRightIcon size={18} />
                    </button>
                  </>
                )}
                {currentPhoto.caption && (
                  <p className="absolute right-5 bottom-5 px-3 py-1.5 bg-black/55 backdrop-blur-xs text-background font-mono text-[10px] uppercase tracking-[0.18em]">
                    {currentPhoto.caption}
                  </p>
                )}
              </div>
              <div className="flex gap-3 p-3.5 border-t-2 border-background">
                {photos.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show photo ${i + 1}`}
                    onClick={() => setPhoto(i)}
                    className={cn(
                      "flex-1 h-23 overflow-hidden border-2 transition-opacity",
                      i === activePhoto
                        ? "border-amber-400 opacity-100"
                        : "border-background/45 opacity-65 hover:opacity-90"
                    )}
                  >
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-100 flex items-center justify-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
                Photos coming shortly
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── rooms ── */}
      <section className="px-8 py-18 border-t-2 border-black">
        <div className="flex justify-between items-end gap-6 flex-wrap mb-9">
          <div>
            <p className="cedarville-cursive-regular text-2xl text-black/70 mb-1">room by room</p>
            <h2 className="bricolage-grotesque-500 text-4xl md:text-5xl leading-none tracking-tight">
              {rooms.length > 0
                ? "Take one room, or take the whole home"
                : "Take the whole home"}
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground max-w-70 leading-loose">
            Select a row to price your stay
            {property.kitchenType !== "none" &&
              rooms.length > 0 &&
              ` · rooms share the ${humanise(property.kitchenType).toLowerCase()} kitchen`}
          </p>
        </div>

        <div className="border-2 border-black shadow-[8px_10px_0_#000] bg-white overflow-x-auto">
          <div className="min-w-160">
            <div className="grid grid-cols-[2.2fr_1fr_1fr_150px] gap-3 px-6 py-3 border-b-2 border-black bg-black text-background font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
              <span>Room</span>
              <span>Monthly</span>
              <span>Status</span>
              <span />
            </div>

            <button
              type="button"
              disabled={!isBookable(whole)}
              onClick={() => setSelected(-1)}
              className={cn(
                "w-full text-left grid grid-cols-[2.2fr_1fr_1fr_150px] gap-3 px-6 py-5 border-b-2 border-black transition-colors",
                selected === -1
                  ? "bg-amber-400 shadow-[inset_6px_0_0_#000]"
                  : "bg-amber-200 hover:bg-amber-300",
                !isBookable(whole) && "opacity-55 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <span className="bricolage-grotesque-500 text-xl tracking-tight">
                  Entire property — {property.name}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-black/70">
                  {beds} · {size} · {plural(property.maxOccupancy, "guest")}
                </span>
              </div>
              <span className="font-mono text-lg font-bold self-center">
                {formatINR(whole?.monthlyRate ?? 0)}
              </span>
              <span className="self-center justify-self-start px-2.5 py-1.5 border-2 border-black bg-black text-background font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                {whole ? humanise(whole.status) : "—"}
              </span>
              <span className="self-center justify-self-end px-4 py-3 border-2 border-black bg-black text-amber-300 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                {isBookable(whole) ? "Book whole" : "Waitlist"}
              </span>
            </button>

            {rooms.map((room, i) => {
              const active = selected === i
              const bookable = isBookable(room)
              const meta = [
                room.bedType,
                room.bathroom ? `${room.bathroom} bath` : undefined,
                room.areaSqft ? `${room.areaSqft} sq ft` : undefined,
                room.note || undefined,
              ]
                .filter(Boolean)
                .join(" · ")

              return (
                <button
                  key={room.id}
                  type="button"
                  disabled={!bookable}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full text-left grid grid-cols-[2.2fr_1fr_1fr_150px] gap-3 px-6 py-5 border-b-2 border-black/25 transition-colors",
                    active ? "bg-blue-50 shadow-[inset_6px_0_0_#000]" : "bg-white",
                    bookable ? "hover:bg-blue-50/60" : "opacity-55 cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="bricolage-grotesque-500 text-lg tracking-tight">
                      {room.name}
                    </span>
                    <span className={monoLabel}>{meta}</span>
                  </div>
                  <span className="font-mono text-[17px] font-bold self-center">
                    {formatINR(room.monthlyRate)}
                  </span>
                  <span
                    className={cn(
                      "self-center justify-self-start px-2.5 py-1.5 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
                      bookable ? "bg-green-100" : "bg-black text-background"
                    )}
                  >
                    {humanise(room.status)}
                  </span>
                  <span
                    className={cn(
                      "self-center justify-self-end px-4 py-3 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap",
                      active ? "bg-black text-amber-300" : "bg-white"
                    )}
                  >
                    {bookable ? (active ? "Selected ✓" : "Select") : "Waitlist"}
                  </span>
                </button>
              )
            })}

            <div className="flex justify-between items-center gap-5 flex-wrap px-6 py-5 border-t-2 border-black bg-amber-100">
              <span className="font-mono text-xs uppercase tracking-[0.14em] leading-relaxed">
                Selected ·{" "}
                {selectedRoom ? `${selectedRoom.name} · single room` : `entire property · ${beds}`}
              </span>
              <span className="font-mono text-2xl font-bold">
                {formatINR(monthly)}
                <span className="font-mono text-[11px] font-normal tracking-[0.14em]"> / month</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── the reference detail, one group at a time ── */}
      {panels.length > 0 && (
        <section className="px-8 pb-18">
          <div className="mb-9">
            <p className="cedarville-cursive-regular text-2xl text-black/70 mb-1">
              the fine print
            </p>
            <h2 className="bricolage-grotesque-500 text-4xl md:text-5xl leading-none tracking-tight text-balance max-w-220">
              More details about {property.name}
            </h2>
          </div>

          <MoreDetails key={property.id} name={property.name} panels={panels} />
        </section>
      )}

      {/* ── reviews, rendered only when there are real ones ── */}
      {reviews.length > 0 && (
        <section className="px-8 pb-18">
          <div className="flex justify-between items-end gap-6 flex-wrap mb-9">
            <div>
              <p className="cedarville-cursive-regular text-2xl text-black/70 mb-1">
                from people who stayed
              </p>
              <h2 className="bricolage-grotesque-500 text-4xl md:text-5xl leading-none tracking-tight">
                {plural(reviews.length, "review")}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="border-2 border-black bg-white shadow-[6px_6px_0_#000] p-6 flex flex-col gap-3.5"
              >
                <div className="flex justify-between items-baseline gap-3">
                  <span className="font-mono text-sm font-bold">
                    {"★".repeat(review.rating)}
                    <span className="text-black/30">{"★".repeat(5 - review.rating)}</span>
                  </span>
                  {review.verified && (
                    <span className="px-2 py-1 border-2 border-black bg-green-100 font-mono text-[9px] font-semibold uppercase tracking-[0.16em]">
                      Verified stay
                    </span>
                  )}
                </div>

                <p className="text-[15px] leading-relaxed text-black/80 text-pretty">
                  {review.text}
                </p>

                <p className={cn(monoLabel, "mt-auto")}>
                  {[
                    review.authorFirstName,
                    review.authorCity,
                    review.stayMonth,
                    review.stayDurationNights
                      ? plural(review.stayDurationNights, "night")
                      : undefined,
                    humanise(review.source),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── enquiry, scoped to this home ── */}
      <section id="enquire" className="px-8 pb-18">
        <ContactCard
          eyebrow="talk to us"
          title={`Enquire about ${property.name}`}
          body="Tell us your dates and we'll confirm what's still open."
          areas={[]}
          subject={{ label: "Home you're asking about", value: `${property.name} · ${area}` }}
          submitLabel="Send enquiry"
          messagePlaceholder={
            rooms.length > 0
              ? `Arriving mid-month — is the ${rooms[0].name.toLowerCase()} still free?`
              : "Arriving mid-month — is this home still free?"
          }
          footnote={() =>
            `${selectedRoom ? selectedRoom.name : "Entire property"} · ${formatINR(monthly)} / month`
          }
          rows={[
            { k: "Home", v: property.name },
            { k: "Area", v: area },
            { k: "Availability", v: availability },
            { k: "Minimum stay", v: plural(property.minStayNights, "night") },
            ...(property.vettedOn
              ? [{ k: "Last vetted", v: property.vettedOn.toLocaleDateString("en-IN") }]
              : []),
          ]}
        />
      </section>

      <section className="px-8 py-14 bg-amber-400 border-y-2 border-black flex justify-between items-center gap-8 flex-wrap">
        <h2 className="bricolage-grotesque-500 text-4xl md:text-5xl leading-none tracking-tight">
          Still comparing? Send us your dates.
        </h2>
        <Link
          to="/listings"
          className="px-7 py-4.5 bg-black text-amber-300 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors"
        >
          See every home
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default Property
