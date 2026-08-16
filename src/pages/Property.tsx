import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Tag } from "@/components/Tag"
import { ContactCard } from "@/components/ContactCard"
import { Footer } from "@/sections/Footer"
import { cn } from "@/lib/utils"
import { formatINR, getProperty } from "@/content/properties"

// Matches the listings page — the fixed navbar occupies the first 64px.
const NAV_OFFSET = 64

const monoLabel =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"

const Property = () => {
  const { slug } = useParams()
  const property = getProperty(slug)

  // `selected` is the room index, or -1 for the whole property.
  const [selected, setSelected] = useState(-1)
  const [photo, setPhoto] = useState(0)

  if (!property) {
    return (
      <div className="bg-background min-h-dvh flex flex-col" style={{ paddingTop: NAV_OFFSET }}>
        <div className="flex-1 flex items-center justify-center px-8 py-24">
          <div className="border-2 border-black bg-white shadow-[8px_10px_0_#000] p-14 text-center flex flex-col items-center gap-4 max-w-140">
            <p className="cedarville-cursive-regular text-3xl text-black/70">not on the board</p>
            <h1 className="bricolage-grotesque-500 text-4xl leading-none tracking-tight">
              We can't find that home
            </h1>
            <p className="text-base text-black/70 text-balance">
              It may have been taken off the board, or the link is off by a character.
            </p>
            <Link
              to="/listings"
              className="mt-2 inline-flex items-center gap-2.5 px-7 py-4 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#000] transition-all"
            >
              See every home <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const photoCount = property.photos.length
  const activePhoto = photo % photoCount
  const selectedRoom = selected >= 0 ? property.rooms[selected] : undefined

  return (
    <div className="bg-background" style={{ paddingTop: NAV_OFFSET }}>
      <div className="px-8 py-5 flex justify-between items-center gap-4 flex-wrap">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-black shadow-[3px_3px_0_#000] font-mono text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-black hover:text-white transition-colors"
        >
          <ArrowLeftIcon size={14} /> All properties
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {property.area} · hosted by {property.host}
        </span>
      </div>

      <div className="grid lg:grid-cols-[2fr_3fr] items-start">
        {/* ── details ── */}
        <div className="p-8 md:p-11 pb-18 border-b-2 lg:border-b-0 lg:border-r-2 border-t-2 border-black flex flex-col gap-8">
          <div className="flex flex-col gap-3.5">
            <p className={monoLabel}>{property.meta}</p>
            <h1 className="bricolage-grotesque-500 text-5xl md:text-6xl leading-[0.92] tracking-tight">
              {property.title}
            </h1>
            <p className="cedarville-cursive-regular text-2xl text-black/70">{property.note}</p>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <Tag tone="solid">{property.area}</Tag>
            <Tag>{property.beds}</Tag>
            <Tag>{property.size}</Tag>
            <Tag className="bg-blue-50">
              {property.rating.toFixed(1)} ★ ({property.reviews})
            </Tag>
          </div>

          <div className="grid grid-cols-2 border-2 border-black shadow-[6px_6px_0_#000] bg-white">
            <div className="p-6 border-r-2 border-black">
              <p className={cn(monoLabel, "mb-2")}>Per night</p>
              <p className="font-mono text-3xl font-bold">{formatINR(property.nightly)}</p>
            </div>
            <div className="p-6 bg-amber-400">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
                Monthly · all in
              </p>
              <p className="font-mono text-3xl font-bold">{formatINR(property.monthly)}</p>
            </div>
          </div>

          <p className="text-[17px] leading-relaxed text-black/70 text-pretty">{property.body}</p>

          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] mb-3.5">
              What's in the price
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-l-2 border-black">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="px-4 py-3.5 border-r-2 border-b-2 border-black font-mono text-[13px] uppercase tracking-[0.08em]"
                >
                  ✓ {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 border-2 border-black">
            {property.facts.map((fact, i) => (
              <div
                key={fact.label}
                className={cn(
                  "p-4 flex flex-col gap-2",
                  i < property.facts.length - 1 && "border-r border-black/25"
                )}
              >
                <span className="bricolage-grotesque-500 text-3xl leading-none">{fact.value}</span>
                <span className={monoLabel}>{fact.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 p-5 border-2 border-black bg-blue-50">
            <div className="size-13 flex-none border-2 border-black bg-white flex items-center justify-center bricolage-grotesque-500 text-xl">
              {property.host.charAt(0)}
            </div>
            <div>
              <p className="bricolage-grotesque-500 text-[17px]">
                {property.host} · your local contact
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-black/70 leading-relaxed">
                {property.hostBlurb}
              </p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="#enquire"
              className="inline-flex items-center gap-2.5 px-7 py-4.5 bg-amber-400 border-2 border-black shadow-[6px_6px_0_#000] font-mono text-[13px] font-semibold uppercase tracking-[0.14em] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#000] transition-all"
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
          <div className="relative flex-1 overflow-hidden min-h-100">
            <img
              src={property.photos[activePhoto]}
              alt={property.captions[activePhoto]}
              className="w-full h-full object-cover"
            />
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="px-3 py-1.5 bg-black/55 backdrop-blur-[4px] text-background border-2 border-background font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                {property.availability}
              </span>
              <span className="px-3 py-1.5 bg-amber-400 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                {activePhoto + 1} / {photoCount}
              </span>
            </div>
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
            <p className="absolute right-5 bottom-5 px-3 py-1.5 bg-black/55 backdrop-blur-[4px] text-background font-mono text-[10px] uppercase tracking-[0.18em]">
              {property.captions[activePhoto]}
            </p>
          </div>
          <div className="flex gap-3 p-3.5 border-t-2 border-background">
            {property.photos.map((src, i) => (
              <button
                key={i}
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
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── rooms ── */}
      <section className="px-8 py-18 border-t-2 border-black">
        <div className="flex justify-between items-end gap-6 flex-wrap mb-9">
          <div>
            <p className="cedarville-cursive-regular text-2xl text-black/70 mb-1">room by room</p>
            <h2 className="bricolage-grotesque-500 text-4xl md:text-5xl leading-none tracking-tight">
              Take one room, or take the whole flat
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground max-w-70 leading-loose">
            Select a row to price your stay · rooms share the kitchen and living room
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
              onClick={() => setSelected(-1)}
              className={cn(
                "w-full text-left grid grid-cols-[2.2fr_1fr_1fr_150px] gap-3 px-6 py-5 border-b-2 border-black transition-colors",
                selected === -1
                  ? "bg-amber-400 shadow-[inset_6px_0_0_#000]"
                  : "bg-amber-200 hover:bg-amber-300"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <span className="bricolage-grotesque-500 text-xl tracking-tight">
                  Entire property — {property.title}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-black/70">
                  {property.beds} · {property.size} · all rooms, exclusive use
                </span>
              </div>
              <span className="font-mono text-lg font-bold self-center">
                {formatINR(property.monthly)}
              </span>
              <span className="self-center justify-self-start px-2.5 py-1.5 border-2 border-black bg-black text-background font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                {property.availability}
              </span>
              <span className="self-center justify-self-end px-4 py-3 border-2 border-black bg-black text-amber-300 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                Book whole
              </span>
            </button>

            {property.rooms.map((room, i) => {
              const active = selected === i
              return (
                <button
                  key={room.name}
                  type="button"
                  disabled={!room.available}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full text-left grid grid-cols-[2.2fr_1fr_1fr_150px] gap-3 px-6 py-5 border-b-2 border-black/25 transition-colors",
                    active ? "bg-blue-50 shadow-[inset_6px_0_0_#000]" : "bg-white",
                    room.available ? "hover:bg-blue-50/60" : "opacity-55 cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="bricolage-grotesque-500 text-lg tracking-tight">
                      {room.name}
                    </span>
                    <span className={monoLabel}>{room.meta}</span>
                  </div>
                  <span className="font-mono text-[17px] font-bold self-center">
                    {formatINR(room.monthly)}
                  </span>
                  <span
                    className={cn(
                      "self-center justify-self-start px-2.5 py-1.5 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
                      room.available ? "bg-green-100" : "bg-black text-background"
                    )}
                  >
                    {room.available ? "Available" : "Booked"}
                  </span>
                  <span
                    className={cn(
                      "self-center justify-self-end px-4 py-3 border-2 border-black font-mono text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap",
                      active ? "bg-black text-amber-300" : "bg-white"
                    )}
                  >
                    {room.available ? (active ? "Selected ✓" : "Select") : "Waitlist"}
                  </span>
                </button>
              )
            })}

            <div className="flex justify-between items-center gap-5 flex-wrap px-6 py-5 border-t-2 border-black bg-amber-100">
              <span className="font-mono text-xs uppercase tracking-[0.14em] leading-relaxed">
                Selected ·{" "}
                {selectedRoom
                  ? `${selectedRoom.name} · single room`
                  : `entire property · ${property.beds}`}
              </span>
              <span className="font-mono text-2xl font-bold">
                {formatINR(selectedRoom ? selectedRoom.monthly : property.monthly)}
                <span className="font-mono text-[11px] font-normal tracking-[0.14em]"> / month</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── enquiry, scoped to this home ── */}
      <section id="enquire" className="px-8 pb-18">
        <ContactCard
          eyebrow={`talk to us`}
          title={`Enquire about ${property.title}`}
          body={`${property.host} looks after this home and answers these enquiries directly — not a shared inbox. Tell us your dates and we'll confirm what's still open.`}
          areas={[]}
          subject={{ label: "Home you're asking about", value: `${property.title} · ${property.area}` }}
          submitLabel="Send enquiry"
          messagePlaceholder={`Arriving mid-month — is the ${property.rooms[0].name.toLowerCase()} still free?`}
          footnote={() =>
            `${selectedRoom ? selectedRoom.name : "Entire property"} · ${formatINR(
              selectedRoom ? selectedRoom.monthly : property.monthly
            )} / month`
          }
          rows={[
            { k: "Home", v: property.title },
            { k: "Area", v: property.location },
            { k: "Host", v: property.host },
            { k: "Rating", v: `${property.rating.toFixed(1)} ★ (${property.reviews})` },
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
