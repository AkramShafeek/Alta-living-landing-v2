import { ArrowRightIcon, BedIcon, DoorOpenIcon, MapPinIcon, StarIcon } from "lucide-react";
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
  availability?: string
  price?: string
  priceUnit?: string
  rating?: string
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
    availability = "Available 1/3",
    price = "₹ 30,000",
    priceUnit = "per night",
    rating,
  } = property ?? {}

  const card = <div className="bg-blue-50 flex flex-1 flex-col border border-black min-w-100 gap-2 overflow-hidden group/card">
    <div className="h-72 flex relative border-b border-black overflow-hidden">
      <img src={src || propertySrc || "/1.jpg"} className="bg-cover w-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.03]" />
      {rating && (
        <span className="absolute top-3 right-3 bg-white border border-black px-2 py-1 flex items-center gap-1 font-mono text-[11px] font-semibold tracking-[0.1em] shadow-[3px_3px_0px_#000]">
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
          <div className="text-xs flex justify-between gap-2">
            <div className="bg-black text-white text-xs h-fit px-2 py-1 flex gap-2 items-center"> <MapPinIcon size={12} /> {location}</div>
            <p className="flex items-center gap-1"><BedIcon size={16} /> {bedType}</p>
            <p className="flex items-center gap-1"><DoorOpenIcon size={16} /> {availability}</p>
          </div>
          <Separator />
        </div>
        <div className="flex gap-2 px-6 pb-2">
          <p className="flex flex-1 items-baseline gap-2 text-3xl font-bold">{price} <span className="text-sm font-normal">{priceUnit}</span></p>
        </div>
        <div className="p-4 pt-0 w-full mb-1">
          <Button variant="default" asChild={!!to} className="w-full h-10 flex justify-between rounded-none bg-white text-black hover:bg-black hover:text-white border-t shadow-[5px_6px_0px_#000] border-black">
            {to ? <span>View <ArrowRightIcon /></span> : <>View <ArrowRightIcon /></>}
          </Button>
        </div>
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
