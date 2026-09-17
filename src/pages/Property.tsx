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
  UNIT_FEATURE_ICONS,
  type UnitFeature,
} from "@/lib/catalogIcons"
import type { AmenityKey, IncludedKey } from "@/models/common"
import { Tag } from "@/components/Tag"
import { ContactCard } from "@/components/ContactCard"
import { Footer } from "@/sections/Footer"
import { cn } from "@/lib/utils"
import { useCatalogStore } from "@/store/catalogStore"
import type { UnitDetail } from "@/store/types"
import type { Photo } from "@/models/Photo"
import { Separator } from "@/components/ui/separator"

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
const present = (facts: Fact[]) =>
  facts.filter((f): f is Required<Fact> => Boolean(f.value))

/** Only `available` can be taken. `on_notice` is leaving, but not tonight. */
const isBookable = (unit: UnitDetail | undefined) =>
  unit?.status === "available"

/** A titled block that renders nothing when it has nothing to say. */
const Block = ({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) => (
  <div>
    <p className="mb-3.5 font-mono font-semibold tracking-[0.18em] uppercase">
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
  <div className="grid grid-cols-1 border-t-2 border-l-2 border-black sm:grid-cols-2">
    {amenities.map((amenity) => {
      const Icon = AMENITY_ICONS[amenity]
      return (
        <div
          key={amenity}
          className="flex items-center gap-2.5 border-r-2 border-b-2 border-black px-4 py-3.5 font-mono text-[13px] tracking-[0.08em] uppercase"
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
  <div className="grid grid-cols-1 border-t-2 border-l-2 border-black sm:grid-cols-2">
    {included.map((key) => {
      const Icon = INCLUDED_ICONS[key]
      return (
        <div
          key={key}
          className="flex items-center gap-2.5 border-r-2 border-b-2 border-black px-4 py-3.5 font-mono text-[13px] tracking-[0.08em] uppercase"
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
        className="flex items-start gap-2.5 border-r-2 border-b-2 border-black px-4 py-3.5 font-mono text-[13px] text-black/65"
      >
        <XIcon
          size={CATALOG_ICON_SIZE}
          aria-hidden
          className="mt-0.5 shrink-0"
        />
        <span>
          <span className="tracking-[0.08em] uppercase">{entry.item}</span>
          {entry.note && (
            <span className="mt-1 block normal-case">{entry.note}</span>
          )}
        </span>
      </div>
    ))}
  </div>
)

const FactGrid = ({ facts }: { facts: Required<Fact>[] }) => (
  <div className="grid grid-cols-1 border-t-2 border-l-2 border-black sm:grid-cols-2">
    {facts.map((fact) => (
      <div
        key={fact.label}
        className="border-r-2 border-b-2 border-black px-4 py-3.5"
      >
        <p className={monoLabel}>{fact.label}</p>
        <p className="mt-1 font-mono text-[13px]">{fact.value}</p>
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
      className="grid overflow-hidden border-2 border-black bg-white shadow-[8px_10px_0_#000] md:min-h-56 md:grid-cols-[minmax(0,16rem)_1fr]"
    >
      <Tabs.List
        aria-label={`More details about ${name}`}
        className="flex flex-col border-b-2 border-black bg-amber-50 md:border-r-2 md:border-b-0"
      >
        {panels.map((panel) => (
          <Tabs.Trigger
            key={panel.id}
            value={panel.id}
            className={cn(
              "group border-b-2 border-black/15 px-5 py-4.5 text-left last:border-b-0",
              "font-mono text-[11px] font-semibold tracking-[0.16em] uppercase",
              "transition-colors hover:bg-amber-200",
              "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black",
              "data-[state=active]:bg-amber-400 data-[state=active]:shadow-[inset_6px_0_0_#000]"
            )}
          >
            <span className="flex items-baseline justify-between gap-3">
              {panel.label}
              <span className="text-[10px] text-black/60 tabular-nums group-data-[state=active]:text-black/75">
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
          className="p-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black md:p-8"
        >
          <p className="mb-5 font-mono text-[11px] leading-loose tracking-[0.16em] text-muted-foreground uppercase">
            {panel.blurb}
          </p>
          {panel.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

/** Which of a home's two offers is on screen. */
type UnitMode = "rooms" | "whole"

/** How many tiles the photo block always shows. */
const QUAD = 4

/** The two offers, in the order they are priced: cheapest entry first. */
const UNIT_TABS = [
  ["rooms", "Rooms"],
  ["whole", "Entire home"],
] as const satisfies readonly (readonly [UnitMode, string])[]

/**
 * Exactly four tiles, always.
 *
 * A room with two photos renders two photos and two placeholders rather than a
 * two-tile grid. Two reasons, and the second is the real one: the block keeps
 * its shape as you click from room to room, so nothing below it jumps; and a
 * half-empty grid reads as a gallery we know is thin, where a neatly-filled
 * two-tile grid would read as the whole of what there is to see.
 */
/** One tile. A missing photo keeps the slot rather than collapsing it. */
const PhotoTile = ({
  photo,
  ratio,
}: {
  photo: Photo | undefined
  ratio: string
}) => (
  <div className={cn("relative overflow-hidden bg-[#f0f0f0]", ratio)}>
    {photo ? (
      <img
        src={photo.url}
        alt={photo.alt}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center px-3 text-center">
        <span className="font-mono text-[10px] tracking-[0.18em] text-foreground/60 uppercase">
          Photo coming soon
        </span>
      </div>
    )}
  </div>
)

/**
 * A cover and three beneath it — the shape the main gallery already uses.
 *
 * Still exactly four slots, and a room with one photo still renders four, so
 * the block keeps its height as you read down the page. Four equal tiles gave
 * every photo the same weight, which is wrong: the first one is the one that
 * decides whether anybody reads the rest.
 *
 * The 2px gaps over a black ground draw the dividing lines, so the tiles sit
 * flush inside whatever frames them instead of floating in padding.
 */
const PhotoQuad = ({
  photos,
  caption,
}: {
  photos: Photo[]
  caption?: string
}) => {
  const [cover, ...rest] = Array.from(
    { length: QUAD },
    (_, index) => photos[index]
  )

  return (
    <div role="group" aria-label={caption}>
      <div className="grid gap-0.5 overflow-hidden">
        <PhotoTile photo={cover} ratio="aspect-[16/8]" />

        <div className="grid grid-cols-3 gap-0.5">
          {rest.map((photo, index) => (
            <PhotoTile
              key={photo?.id ?? `blank-${index}`}
              photo={photo}
              ratio="aspect-[4/3]"
            />
          ))}
        </div>
      </div>
      {caption && <p className={cn(monoLabel, "mt-3.5")}>{caption}</p>}
    </div>
  )
}

/**
 * One room, whole.
 *
 * Every room gets its own card rather than a row in a table, because a room is
 * something you look at before you price it — and a table row has nowhere to
 * put a photograph. Photos left, what it is in the middle, what it costs and
 * the way to take it on the right, which is the order the decision is made in.
 *
 * Selection still exists: the enquiry form at the foot of the page names the
 * room being asked about, and it has to learn it from somewhere.
 */
const RoomCard = ({
  room,
  active,
  onSelect,
}: {
  room: UnitDetail
  active: boolean
  onSelect: () => void
}) => {
  const bookable = isBookable(room)

  const features: { key: UnitFeature; label: string }[] = [
    room.bedType
      ? { key: "bed" as const, label: `${humanise(room.bedType)} bed` }
      : undefined,
    room.bathroom === "ensuite"
      ? { key: "ensuite" as const, label: "Ensuite bathroom" }
      : room.bathroom === "shared"
        ? { key: "sharedBath" as const, label: "Shared bathroom" }
        : undefined,
    { key: "sleeps" as const, label: plural(room.maxOccupancy, "guest") },
    room.hasDesk ? { key: "desk" as const, label: "Work desk" } : undefined,
    room.hasAc
      ? { key: "airConditioning" as const, label: "Air conditioning" }
      : undefined,
    room.hasBalcony ? { key: "balcony" as const, label: "Balcony" } : undefined,
  ].filter((entry): entry is { key: UnitFeature; label: string } =>
    Boolean(entry)
  )

  const meta = [
    room.areaSqft ? `${room.areaSqft} sq ft` : undefined,
    room.note || undefined,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <article
      className={cn(
        "grid  bg-white  lg:grid-cols-[1fr_1fr] border-2 border-black/15 p-4",
        !bookable && "opacity-70"
      )}
    >
      {/* The larger share, and flush to the frame. A room is chosen by looking
          at it; the prose beside it only confirms what the photographs said. */}
      <div className="">
        <PhotoQuad photos={room.photos} />
      </div>

      <div className={cn("flex flex-col justify-center pl-7", active && "")}>
        <div className="flex flex-wrap items-start justify-between gap-4 px-7 pt-7 pb-5">
          <div className="min-w-0">
            <h3 className="bricolage-grotesque-500 text-3xl leading-tight tracking-tight">
              {room.name}
            </h3>
            {meta && <p className={cn(monoLabel, "mt-1.5")}>{meta}</p>}
          </div>

          <div className="text-right">
            <p className="font-mono text-3xl font-bold whitespace-nowrap">
              {formatINR(room.monthlyRate)}
            </p>
            <p className={cn(monoLabel, "mt-0.5")}>per month</p>
          </div>
        </div>

        {features.length > 0 && (
          <ul className="flex flex-col gap-x-6 gap-y-3 px-7 pb-7">
            {features.map((feature) => {
              const Icon = UNIT_FEATURE_ICONS[feature.key]
              return (
                <li
                  key={feature.label}
                  className="flex items-center gap-2 font-mono text-[13px] text-black/75"
                >
                  <Icon
                    size={CATALOG_ICON_SIZE}
                    aria-hidden
                    className="shrink-0"
                  />
                  {feature.label}
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-7 py-5">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "border-2 border-black px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase",
                bookable ? "bg-green-100" : "bg-black text-background"
              )}
            >
              {humanise(room.status)}
            </span>
            {room.deposit > 0 && (
              <span className={monoLabel}>
                {formatINR(room.deposit)} deposit
              </span>
            )}
          </span>

          <span className="flex items-center gap-2.5">
            {bookable && (
              <button
                type="button"
                aria-pressed={active}
                onClick={onSelect}
                className={cn(
                  "border-2 border-black px-4 py-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                  active
                    ? "bg-black text-amber-300"
                    : "bg-white hover:bg-amber-200"
                )}
              >
                {active ? "Selected" : "Select room"}
              </button>
            )}
            <a
              href="#enquire"
              onClick={bookable ? onSelect : undefined}
              className="border-2 border-black bg-amber-400 px-4 py-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-black hover:text-amber-300"
            >
              {bookable ? "Enquire" : "Join waitlist"}
            </a>
          </span>
        </div>
      </div>
    </article>
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
  <div
    className="flex min-h-dvh flex-col bg-background"
    style={{ paddingTop: NAV_OFFSET }}
  >
    <div className="flex flex-1 items-center justify-center px-8 py-24">
      <div className="flex max-w-140 flex-col items-center gap-4 border-2 border-black bg-white p-14 text-center shadow-[8px_10px_0_#000]">
        <p className="cedarville-cursive-regular text-3xl text-black/70">
          {eyebrow}
        </p>
        <h1 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight">
          {title}
        </h1>
        <p className="text-base text-balance text-black/70">{body}</p>
        {children}
      </div>
    </div>
    <Footer />
  </div>
)

const allHomesLink = (
  <Link
    to="/listings"
    className="mt-2 inline-flex items-center gap-2.5 border-2 border-black bg-amber-400 px-7 py-4 font-mono text-[13px] font-semibold tracking-[0.14em] uppercase shadow-[6px_6px_0_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
  >
    See every home <ArrowRightIcon size={16} />
  </Link>
)

const Property = () => {
  const { slug } = useParams()

  const loadProperty = useCatalogStore((state) => state.loadProperty)
  const status = useCatalogStore((state) => state.status)
  const error = useCatalogStore((state) => state.error)
  const notFound = useCatalogStore((state) =>
    slug ? state.notFound.includes(slug) : false
  )

  // Two subscriptions rather than one derived object: each returns a stable
  // reference, so zustand's Object.is comparison does not re-render every tick.
  const id = useCatalogStore((state) =>
    slug ? state.slugIndex[slug] : undefined
  )
  const detail = useCatalogStore((state) =>
    id ? state.properties[id] : undefined
  )

  // The store dedupes, skips what it already has, and remembers a bad slug, so
  // this can fire on every mount without coordinating with the listings page.
  useEffect(() => {
    if (slug) void loadProperty(slug)
  }, [slug, loadProperty])

  // Which of the two offers is on screen, and which room within the first.
  //
  // Two pieces of state rather than one signed index. Encoding "the whole home"
  // as -1 in the room list is what forced the whole home to BE a row in that
  // list: two different things to buy, listed as one kind of thing, with the
  // expensive one always sitting on top of the cheap ones. The tab separates
  // them, so the state has to separate first.
  const [mode, setMode] = useState<UnitMode>("rooms")
  const [roomIndex, setRoomIndex] = useState(0)
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

  // A home with no separate rooms has only one thing to offer, so the tab it
  // would land on does not exist. Derived rather than corrected in an effect,
  // which would render the empty tab for a frame first.
  const unitMode: UnitMode = rooms.length === 0 ? "whole" : mode
  const selectedRoom = unitMode === "rooms" ? rooms[roomIndex] : undefined

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
  const beds =
    property.propertyType === "studio" ? "Studio" : `${property.bedrooms} BHK`
  const size = `${property.carpetAreaSqft.toLocaleString("en-IN")} sq ft`

  // Every value below comes from a column. Enum values render through
  // `humanise` rather than a label map, so adding a member to an enum in
  // models/common.ts displays correctly without touching this file.
  const essentials = present([
    {
      label: "Wi-Fi",
      value: `${property.wifiDownMbps} Mbps${property.wifiWired ? " · wired" : ""}${property.wifiProvider ? ` · ${property.wifiProvider}` : ""
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
            property.parkingCar > 0
              ? plural(property.parkingCar, "car")
              : undefined,
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
          ? `${plural(property.deskCount, "desk")}${property.taskChairCount > 0
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
          : `${property.floor === 0 ? "Ground" : property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""
          }${property.hasLift ? " · lift" : " · no lift"}`,
    },
    {
      label: "Balconies",
      value: property.balconies > 0 ? String(property.balconies) : undefined,
    },
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
      value:
        property.noticePeriodDays > 0
          ? plural(property.noticePeriodDays, "day")
          : undefined,
    },
    {
      label: "Lock-in",
      value:
        property.lockInMonths > 0
          ? plural(property.lockInMonths, "month")
          : undefined,
    },
    { label: "Agreement", value: humanise(property.agreementType) },
    { label: "KYC", value: property.kycRequired ? "Required" : "Not required" },
    {
      label: "GST invoice",
      value: property.gstInvoice ? "Available" : undefined,
    },
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
      content: (
        <PriceGrid included={includedInPrice} notIncluded={notIncluded} />
      ),
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
                className="flex items-center justify-between gap-4 border-r-2 border-b-2 border-black px-4 py-3.5"
              >
                <span className="flex items-center gap-2.5 font-mono text-[13px]">
                  <Icon
                    size={CATALOG_ICON_SIZE}
                    aria-hidden
                    className="shrink-0"
                  />
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

  // Shown beside the whole-home price. Deliberately the few things that differ
  // from taking a single room — everything else about the home is above.
  const wholeFacts = present([
    { label: "Sleeps", value: plural(property.maxOccupancy, "guest") },
    {
      label: "Bedrooms",
      value: property.bedrooms > 0 ? String(property.bedrooms) : undefined,
    },
    {
      label: "Bathrooms",
      value: property.bathrooms > 0 ? String(property.bathrooms) : undefined,
    },
    { label: "Carpet area", value: size },
    {
      label: "Deposit",
      value: whole && whole.deposit > 0 ? formatINR(whole.deposit) : undefined,
    },
    { label: "Minimum stay", value: plural(property.minStayNights, "night") },
  ])

  const monthly = selectedRoom?.monthlyRate ?? whole?.monthlyRate ?? 0
  const nightly = whole?.nightlyRate ?? 0

  // Guarded so an empty gallery cannot produce `n % 0` → NaN.
  const photoCount = photos.length
  const activePhoto = photoCount > 0 ? photo % photoCount : 0
  const currentPhoto = photos[activePhoto]

  return (
    <div className="bg-background" style={{ paddingTop: NAV_OFFSET }}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 border-b border-b-transparent font-mono text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-b-black"
        >
          <ArrowLeftIcon size={14} /> All properties
        </Link>
        <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {area}
        </span>
      </div>

      <div className="grid items-start border-t-2 border-t-black lg:grid-cols-[2fr_3fr]">
        {/* ── details ── */}
        <div className="flex flex-col justify-center h-full gap-8 border-b-2 bg-amber-50 p-8 pb-18 md:p-11 lg:border-b-0">
          <div className="flex flex-col gap-3.5">
            {/* <p className={monoLabel}>
              {beds} · {size} · {property.furnishing === "fully" ? "Fully furnished" : "Semi furnished"}
            </p> */}
            <h1 className="bricolage-grotesque-500 text-5xl leading-[0.92] tracking-tight md:text-6xl">
              {property.name}
            </h1>
            {/* {property.hook && (
              <p className="text-[17px] leading-relaxed text-black/80 text-pretty">
                {property.hook}
              </p>
            )} */}
            {/* {property.founderNote && (
              <p className="cedarville-cursive-regular text-2xl text-black/70">
                {property.founderNote}
              </p>
            )} */}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Tag tone="solid">{area}</Tag>
            <Tag>{beds}</Tag>
            <Tag>{size}</Tag>
            <Tag className="bg-blue-50">{availability}</Tag>
          </div>

          <p className="text-[17px] leading-relaxed text-pretty text-black/70">
            {property.body}
          </p>

          <div className="flex rounded-4xl p-6 gap-6 justify-between">
            <div className="">
              <p className={"mb-2 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase"}>Per night</p>
              <p className="font-mono text-3xl font-bold">
                {formatINR(nightly)}
              </p>
            </div>
            <Separator orientation="vertical" />
            <div className="">
              <p className="mb-2 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
                Monthly
                {includedInPrice.length > 0 &&
                  ` · ${includedInPrice.length} included`}
              </p>
              <p className="font-mono text-3xl font-bold">
                {formatINR(whole?.monthlyRate ?? 0)}
              </p>
            </div>
          </div>


          {/* {amenities.length > 0 && (
            <Block title="Amenities">
              <AmenityGrid amenities={amenities} />
            </Block>
          )} */}

          {/* {highlights.length > 0 && (
            <div className="grid grid-cols-3 border-2 border-black">
              {highlights.map((fact, i) => (
                <div
                  key={fact.label}
                  className={cn(
                    "flex flex-col gap-2 p-4",
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
          )} */}

          <div className="flex flex-wrap gap-4">
            <a
              href="#enquire"
              className="inline-flex items-center gap-2.5 border-2 border-black bg-amber-400 px-7 py-4.5 font-mono text-[13px] font-semibold tracking-[0.14em] uppercase w-full transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
            >
              Enquire about this home{" "}
              <span className="text-lg leading-none">→</span>
            </a>
            <a
              href="#enquire"
              className="inline-flex items-center border-2 border-black px-7 py-4.5 font-mono text-[13px] font-semibold tracking-[0.14em] uppercase w-full transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
            >
              Book a viewing
            </a>
          </div>
        </div>

        {/* ── gallery, held in place while the details scroll ── */}
        <div
          className="flex flex-col gap-3 bg-white lg:sticky"
          style={{ top: 0, height: `calc(100dvh)` }}
        >
          {currentPhoto ? (
            <>
              <div className="relative h-[70%] overflow-hidden pb-0">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.alt}
                  className="h-full w-full object-cover"
                />
                {/* <div className="absolute left-5 top-5 flex gap-2">
                  <span className="px-3 py-1.5 bg-black/55 backdrop-blur-xs text-background border-2 border-background font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                    {availability}
                  </span>
                  <span className="px-3 py-1.5 bg-amber-400 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                    {activePhoto + 1} / {photoCount}
                  </span>
                </div> */}
                {/* {photoCount > 1 && (
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
                )} */}
                {/* {currentPhoto.caption && (
                  <p className="absolute right-5 bottom-5 px-3 py-1.5 bg-black/55 backdrop-blur-xs text-background font-mono text-[10px] uppercase tracking-[0.18em]">
                    {currentPhoto.caption}
                  </p>
                )} */}
              </div>
              <div className="flex h-[30%] gap-3">
                {photos.map((item, i) => (
                  <div
                    key={item.id}
                    aria-label={`Show photo ${i + 1}`}
                    onClick={() => setPhoto(i)}
                    className={cn(
                      "h-full flex-1 overflow-hidden object-cover transition-opacity"
                    )}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-100 flex-1 items-center justify-center">
              <p className="font-mono text-[11px] tracking-[0.18em] text-background/60 uppercase">
                Photos coming shortly
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── rooms and the whole home, as two separate offers ── */}
      <section className="border-t-2 border-black px-8 py-18">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="cedarville-cursive-regular mb-1 text-2xl text-black/70">
              room by room
            </p>
            <h2 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight md:text-5xl">
              {rooms.length > 0
                ? "Take one room, or take the whole home"
                : "Take the whole home"}
            </h2>
          </div>
          <p className="max-w-70 font-mono text-[11px] leading-loose tracking-[0.16em] text-muted-foreground uppercase">
            {unitMode === "rooms"
              ? "Pick a room to see it and price your stay"
              : "The whole place, priced directly"}
            {property.kitchenType !== "none" &&
              rooms.length > 0 &&
              ` · rooms share the ${humanise(property.kitchenType).toLowerCase()} kitchen`}
          </p>
        </div>

        <Tabs.Root
          value={unitMode}
          onValueChange={(next) => setMode(next as UnitMode)}
          className="flex flex-col gap-8"
        >
          {rooms.length > 0 && (
            <Tabs.List
              aria-label="What to book"
              className="inline-flex w-fit border-2 border-black bg-white shadow-[4px_4px_0_#000]"
            >
              {UNIT_TABS.map(([value, label]) => (
                <Tabs.Trigger
                  key={value}
                  value={value}
                  className={cn(
                    "border-r-2 border-black px-6 py-3.5 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase last:border-r-0",
                    "transition-colors hover:bg-amber-200",
                    "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black",
                    "data-[state=active]:bg-amber-400"
                  )}
                >
                  {value === "rooms" ? `${label} · ${rooms.length}` : label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          )}

          <Tabs.Content
            value="rooms"
            className="flex flex-col gap-14 focus-visible:outline-none"
          >
            {rooms.map((room, index) => (
              <RoomCard
                key={room.id}
                room={room}
                active={index === roomIndex}
                onSelect={() => setRoomIndex(index)}
              />
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-black bg-amber-100 px-5 py-4">
              <span className="font-mono text-[11px] leading-relaxed tracking-[0.14em] uppercase">
                {selectedRoom
                  ? `Enquiring about ${selectedRoom.name} · single room`
                  : "No room selected"}
              </span>
              <span className="font-mono text-2xl font-bold">
                {formatINR(selectedRoom?.monthlyRate ?? 0)}
                <span className="font-mono text-[11px] font-normal tracking-[0.14em]">
                  {" "}
                  / month
                </span>
              </span>
            </div>
          </Tabs.Content>

          <Tabs.Content
            value="whole"
            className="grid items-start gap-8 focus-visible:outline-none lg:grid-cols-2"
          >
            <div>
              <div className="border-2 border-black">
                <PhotoQuad photos={photos} />
              </div>
              <p className={cn(monoLabel, "mt-3.5")}>
                {property.name} — the whole home
              </p>
            </div>

            <div className="border-2 border-black bg-white shadow-[8px_10px_0_#000]">
              <div className="border-b-2 border-black bg-amber-400 px-5 py-4">
                <p className="bricolage-grotesque-500 text-xl leading-tight tracking-tight">
                  Entire property — {property.name}
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-black/70 uppercase">
                  {beds} · {size} · {plural(property.maxOccupancy, "guest")}
                </p>
              </div>

              <div className="grid grid-cols-2 border-b-2 border-black">
                <div className="border-r-2 border-black px-5 py-4">
                  <p className={cn(monoLabel, "mb-1.5")}>Monthly</p>
                  <p className="font-mono text-2xl font-bold">
                    {formatINR(whole?.monthlyRate ?? 0)}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className={cn(monoLabel, "mb-1.5")}>Per night</p>
                  <p className="font-mono text-2xl font-bold">
                    {formatINR(whole?.nightlyRate ?? 0)}
                  </p>
                </div>
              </div>

              {wholeFacts.length > 0 && (
                <div className="px-5 py-5">
                  <FactGrid facts={wholeFacts} />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-black bg-amber-100 px-5 py-4">
                <span
                  className={cn(
                    "border-2 border-black px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase",
                    isBookable(whole)
                      ? "bg-green-100"
                      : "bg-black text-background"
                  )}
                >
                  {whole ? humanise(whole.status) : "—"}
                </span>
                <a
                  href="#enquire"
                  className="inline-flex items-center gap-2 border-2 border-black bg-black px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-300 uppercase transition-colors hover:bg-white hover:text-black"
                >
                  {isBookable(whole)
                    ? "Book the whole home"
                    : "Join the waitlist"}
                </a>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </section>

      {/* ── the reference detail, one group at a time ── */}
      {panels.length > 0 && (
        <section className="px-8 pb-18">
          <div className="mb-9">
            <p className="cedarville-cursive-regular mb-1 text-2xl text-black/70">
              the fine print
            </p>
            <h2 className="bricolage-grotesque-500 max-w-220 text-4xl leading-none tracking-tight text-balance md:text-5xl">
              More details about {property.name}
            </h2>
          </div>

          <MoreDetails key={property.id} name={property.name} panels={panels} />
        </section>
      )}

      {/* ── reviews, rendered only when there are real ones ── */}
      {reviews.length > 0 && (
        <section className="px-8 pb-18">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="cedarville-cursive-regular mb-1 text-2xl text-black/70">
                from people who stayed
              </p>
              <h2 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight md:text-5xl">
                {plural(reviews.length, "review")}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col gap-3.5 border-2 border-black bg-white p-6 shadow-[6px_6px_0_#000]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-sm font-bold">
                    {"★".repeat(review.rating)}
                    <span className="text-black/30">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </span>
                  {review.verified && (
                    <span className="border-2 border-black bg-green-100 px-2 py-1 font-mono text-[9px] font-semibold tracking-[0.16em] uppercase">
                      Verified stay
                    </span>
                  )}
                </div>

                <p className="text-[15px] leading-relaxed text-pretty text-black/80">
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
          subject={{
            label: "Home you're asking about",
            value: `${property.name} · ${area}`,
          }}
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
              ? [
                {
                  k: "Last vetted",
                  v: property.vettedOn.toLocaleDateString("en-IN"),
                },
              ]
              : []),
          ]}
        />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-8 border-y-2 border-black bg-amber-400 px-8 py-14">
        <h2 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight md:text-5xl">
          Still comparing? Send us your dates.
        </h2>
        <Link
          to="/listings"
          className="border-2 border-black bg-black px-7 py-4.5 font-mono text-[13px] font-semibold tracking-[0.14em] text-amber-300 uppercase shadow-[6px_6px_0_#000] transition-colors hover:bg-white hover:text-black"
        >
          See every home
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default Property
