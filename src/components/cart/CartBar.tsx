// ─────────────────────────────────────────────────────────────────────────
// The floating enquiry bar.
//
// Mounted once for the whole site, so a room picked on one home is still there
// two pages later. It exists only when the cart does — an empty bar parked at
// the bottom of every page is a permanent advert for a thing you have not done.
//
// ── The care this one needs ─────────────────────────────────────────────
//
// A fixed bar at the bottom of a page covers the bottom of that page. Two
// consequences, both handled here rather than left to chance:
//
//   · it sits above the footer and the page's own CTAs, so it is centred and
//     narrow rather than full-bleed on desktop — the page stays readable
//     around it;
//   · it has a real height, so the site reserves that much space at the foot
//     of the document while it is open (see `--cart-bar` below), otherwise the
//     last thing on every page sits underneath it forever.
//
// It enters once, and never animates again. A bar that slid up each time the
// count changed would draw the eye away from the room the visitor is reading.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import { ChevronRightIcon, /*, ChevronUpIcon */ 
DoorOpenIcon} from "lucide-react"
import { cn } from "@/lib/utils"
import { cartTotal, useCartStore } from "@/store/cartStore"
import { CartDialog } from "./CartDialog"

const MONO = "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"

const formatINR = (value: number): string =>
  `₹ ${value.toLocaleString("en-IN")}`

export const CartBar = () => {
  const items = useCartStore((state) => state.items)
  const [open, setOpen] = useState(false)

  const count = items.length
  const total = cartTotal(items)

  // The page needs to know the bar is there, so its last section can clear it.
  // Set as a custom property on the root rather than passed through props,
  // because the thing that needs the space is every page, not one component.
  useEffect(() => {
    const root = document.documentElement
    if (count > 0) root.style.setProperty("--cart-bar", "6.5rem")
    else root.style.removeProperty("--cart-bar")

    return () => {
      root.style.removeProperty("--cart-bar")
    }
  }, [count])

  if (count === 0) return null


  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 cursor-pointer" onClick={() => setOpen(true)}>
        <div
          className={cn(
            "pointer-events-auto flex w-full max-w-120 items-center gap-2 rounded-full",
            "border-2 border-black bg-white px-4 pl-5 py-3 ",
            "motion-safe:animate-[cart-rise_260ms_cubic-bezier(0.16,1,0.3,1)]"
          )}
        >
          <DoorOpenIcon size={24} aria-hidden className="" />
          {/* Overlapped, because three squares in a row would read as three
              separate things rather than as one basket. */}
          <ul className="flex shrink-0 items-center -space-x-3">
            {/* {shown.map((item) => (
              <li
                key={item.unitId}
                className="relative size-12 overflow-hidden border bg-[#141311]"
              >
              {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </li>
            ))} */}
          </ul>

          <div className="min-w-0 flex-1">
            <p className={cn(MONO, "text-black/60")}>
              {count} {count === 1 ? "unit" : "units"} in your enquiry
            </p>
            <p className="truncate font-mono text-[15px] font-bold">
              {formatINR(total)}
              <span className="font-mono text-[10px] font-normal tracking-[0.14em]">
                {" "}
                / month
              </span>
            </p>
          </div>

          <div className="px-2">
            <ChevronRightIcon size={16} aria-hidden />
          </div>
        </div>
      </div>

      <CartDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
