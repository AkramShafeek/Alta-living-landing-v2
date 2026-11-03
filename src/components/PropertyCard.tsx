import { ArrowRightIcon, BedIcon, DiamondIcon, DoorOpenIcon, MapPinIcon, StarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

// Structural rather than tied to one content module, so both the home page's
// `site.ts` properties and the listings page's richer `PropertyDetail` records
// can drive the same card.
export type PropertyCardData = {
  src?: string
  area?: string
  hook?: string
  location?: string
  bedType?: string
  size?: string
  availability?: string
  price?: string
  priceUnit?: string
  rating?: string
  /** No entire-unit rate yet — swaps the price block for a plain notice
   *  instead of "Starting from ₹ 0", which would read as free. */
  unpriced?: boolean
}

// Design is locked — only the data driving it changes. `property` is a single
// object so real listing data can be passed in without the component growing
// a prop per field; every field still falls back to the original placeholder
// copy when omitted.
export const PropertyCard = ({
  src,
  property,
  to,
}: {
  src?: string
  property?: PropertyCardData
  /** When set, the whole card becomes a link to the property page. */
  to?: string
}) => {
  const {
    src: propertySrc,
    area = "Property Title",
    hook = "Something nice about the property",
    location = "Location",
    bedType = "1BHK",
    size,
    availability = "Available 1/3",
    price = "₹ 30,000",
    // Data, not design: a home whose cheapest offer is the whole home is not
    // priced "per room".
    priceUnit = "month (per room)",
    rating,
    unpriced = false,
  } = property ?? {}

  const card = <div className="pb-6 flex-1 min-w-0 bg-[#fffef6] flex rounded-4xl flex-col border border-neutral-500 gap-2 overflow-hidden group/card">
    <div className="h-80 flex relative border-b border-neutral-500 overflow-hidden">
      {src || propertySrc ? (
        <img src={src || propertySrc} className="bg-cover w-full h-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.03]" />
      ) : (
        // No photo yet: say so, rather than borrowing another home's picture.
        <div className="flex h-full w-full items-center justify-center bg-[#f0f0f0]">
          <span className="font-mono text-[11px] tracking-[0.18em] text-foreground/60 uppercase">
            Photos coming soon
          </span>
        </div>
      )}
      {rating && (
        <span className="absolute top-3 right-3 bg-white rounded-full border border-neutral-500 px-2 py-1 flex items-center gap-1 font-mono text-[11px] font-semibold tracking-widest shadow-[3px_3px_0px_#000]">
          <StarIcon size={11} className="fill-black" /> {rating}
        </span>
      )}
    </div>
    <div className="flex flex-col w-full justify-between flex-1">
      <div className="flex flex-col p-4 w-full gap-2">
        <div className="flex w-full justify-between items-center">
          <p className="text-2xl font-bold">{area}</p>

        </div>
        <p className="text-muted-foreground text-sm">{hook}</p>
      </div>
      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-col px-4 gap-2 mb-3">
          <Separator />
          <div className="text-xs flex flex-wrap justify-between gap-x-2 gap-y-1.5">
            <div className="bg-black text-white text-xs h-fit px-2 py-1 flex gap-2 items-center rounded-full"> <MapPinIcon size={12} /> {location}</div>
            {size && <p className="flex items-center gap-1"><DiamondIcon size={16} /> {size}</p>}
            <p className="flex items-center gap-1"><BedIcon size={16} /> {bedType}</p>
            <p className="flex items-center gap-1"><DoorOpenIcon size={16} /> {availability}</p>
          </div>
          <Separator />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex px-6 flex-col">
            {unpriced ? (
              <p className="text-sm font-light text-muted-foreground">{price}</p>
            ) : (
              <>
                <p className="text-xs font-light">Starting from</p>
                <p className="flex flex-1 items-baseline gap-1 text-2xl font-bold">{price}
                  <p className="text-xs font-light">/ {priceUnit}</p>
                </p>
              </>
            )}
          </div>
          <div className="mx-6">
            <Button variant="link" size="icon-lg" className="text-black hover:bg-black hover:text-white transition-all rounded-full">
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
        {/* <div className="p-4 pt-0 mx-2">
          <Button variant="default" asChild={!!to} className="w-full h-10 flex justify-between rounded-full bg-white text-black hover:bg-yellow-400 hover:text-black border-t shadow-[3px_4px_0px_#000] active:shadow-none border-neutral-500">
            {to ? <span>View <ArrowRightIcon /></span> : <>View <ArrowRightIcon /></>}
          </Button>
        </div> */}
      </div>
    </div>
  </div>;

  return to ? (
    <Link to={to} className="flex flex-1">
      {card}
    </Link>
  ) : (
    card
  );
}
