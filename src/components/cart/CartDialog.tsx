// ─────────────────────────────────────────────────────────────────────────
// The cart, expanded.
//
// Two panels on one track: what you picked, and who is asking. The track slides
// rather than swapping, because the second panel is a continuation of the first
// — the same enquiry, one step on — and a cut would read as a different screen.
//
// Both panels stay mounted so the slide has something to slide to, but the one
// off-screen is `inert`: it is still in the DOM, and without that a keyboard or
// a screen reader would wander into a form nobody can see.
//
// The form is deliberately almost entirely read-only. Everything in it came
// from the catalog and the cart, and letting someone retype a rate here would
// produce an enquiry that disagrees with the listing it came from. The one
// editable field is the thing only they know: their name.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react"
import { Dialog, VisuallyHidden } from "radix-ui"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  XIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { enquiryWhatsApp } from "@/content/site"
import { whatsappLink } from "@/lib/whatsapp"
import {
  cartTotal,
  itemsByProperty,
  useCartStore,
  type CartItem,
} from "@/store/cartStore"

const MONO = "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"

const formatINR = (value: number): string =>
  `₹ ${value.toLocaleString("en-IN")}`

/** One line of the cart. */
const CartLine = ({
  item,
  onRemove,
}: {
  item: CartItem
  onRemove: () => void
}) => (
  <li className="flex items-stretch gap-4 border-b-2 border-black/15 py-4 last:border-b-0">
    <div className="relative size-22 shrink-0 overflow-hidden border-2 border-black bg-[#141311]">
      {item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt={item.photoAlt}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center px-1 text-center font-mono text-[9px] tracking-[0.14em] text-background/60 uppercase">
          No photo
        </span>
      )}
    </div>

    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <p className="bricolage-grotesque-500 truncate text-lg leading-tight tracking-tight">
        {item.kind === "entire" ? "Entire home" : item.unitName}
      </p>
      <p className={cn(MONO, "truncate text-black/60")}>
        {item.propertyName} · {item.area}
      </p>
      <p className="font-mono text-[15px] font-bold">
        {formatINR(item.monthlyRate)}
        <span className="font-mono text-[10px] font-normal tracking-[0.14em]">
          {" "}
          / month
        </span>
      </p>
    </div>

    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${item.unitName} from the enquiry`}
      className="h-fit shrink-0 self-center border-2 border-black bg-white p-2 transition-colors hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <XIcon size={14} aria-hidden />
    </button>
  </li>
)

export const CartDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const items = useCartStore((state) => state.items)
  const remove = useCartStore((state) => state.remove)

  const [requestedStep, setRequestedStep] = useState<"cart" | "form">("cart")
  const [name, setName] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  // An empty cart has nothing to send, so the form is not reachable. Derived
  // rather than corrected in an effect: removing the last room while standing
  // on the form should slide straight back, not render the form for a frame
  // and then move.
  const step = items.length === 0 ? "cart" : requestedStep

  // Reopening starts at the cart rather than wherever it was left. Done on the
  // close event, not in an effect watching `open`.
  const handleOpenChange = (next: boolean) => {
    if (!next) setRequestedStep("cart")
    onOpenChange(next)
  }

  useEffect(() => {
    if (step === "form") nameRef.current?.focus()
  }, [step])

  const total = cartTotal(items)
  const groups = itemsByProperty(items)
  const href = whatsappLink(enquiryWhatsApp, items, name)

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" />

        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
            "flex max-h-[min(44rem,calc(100dvh-2rem))] flex-col overflow-hidden",
            "border-2 border-black bg-white shadow-[10px_12px_0_#000]"
          )}
        >
          <Dialog.Title asChild>
            <div className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-black bg-amber-400 px-6 py-4">
              <div>
                <p className="bricolage-grotesque-500 text-xl leading-none tracking-tight">
                  {step === "cart" ? "Your enquiry" : "Almost there"}
                </p>
                <p className={cn(MONO, "mt-1.5 text-black/70")}>
                  {step === "cart"
                    ? `${items.length} ${items.length === 1 ? "room" : "rooms"} selected`
                    : "We'll open WhatsApp with this written out"}
                </p>
              </div>

              <Dialog.Close
                aria-label="Close"
                className="border-2 border-black bg-white p-2 transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <XIcon size={16} aria-hidden />
              </Dialog.Close>
            </div>
          </Dialog.Title>

          <VisuallyHidden.Root asChild>
            <Dialog.Description>
              The rooms you have selected, and the enquiry we will send about
              them.
            </Dialog.Description>
          </VisuallyHidden.Root>

          {/* The track. Two panels of equal width, translated by one panel. */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              className={cn(
                "flex h-full w-[200%] transition-transform duration-400 ease-out",
                "motion-reduce:transition-none",
                step === "form" && "-translate-x-1/2"
              )}
            >
              {/* ── panel one: the cart ── */}
              <div
                className="w-1/2 overflow-y-auto px-6 py-2"
                inert={step === "form"}
              >
                {items.length === 0 ? (
                  <p className="py-12 text-center font-mono text-[12px] leading-loose text-black/60">
                    Nothing selected yet. Add a room from any home and it will
                    wait here.
                  </p>
                ) : (
                  groups.map((group) => (
                    <section key={group.propertyId} className="py-2">
                      {groups.length > 1 && (
                        <p className={cn(MONO, "pt-3 text-black/50")}>
                          {group.propertyName}
                        </p>
                      )}
                      <ul>
                        {group.items.map((item) => (
                          <CartLine
                            key={item.unitId}
                            item={item}
                            onRemove={() => remove(item.unitId)}
                          />
                        ))}
                      </ul>

                      <Link
                        to={`/listings/${group.propertySlug}`}
                        onClick={() => onOpenChange(false)}
                        className="mb-2 inline-flex items-center gap-2 border-2 border-black bg-white px-3.5 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        <ExternalLinkIcon size={12} aria-hidden /> Go to{" "}
                        {group.propertyName}
                      </Link>
                    </section>
                  ))
                )}
              </div>

              {/* ── panel two: who is asking ── */}
              <div
                className="w-1/2 overflow-y-auto px-6 py-5"
                inert={step === "cart"}
              >
                <label
                  htmlFor="enquiry-name"
                  className={cn(MONO, "mb-2 block")}
                >
                  Your name
                </label>
                <input
                  id="enquiry-name"
                  ref={nameRef}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Anjali"
                  autoComplete="name"
                  className="w-full border-2 border-black bg-background px-3.5 py-3 font-mono text-[14px] transition-shadow focus:bg-white focus:shadow-[4px_4px_0_#000] focus:outline-none"
                />

                <p className={cn(MONO, "mt-7 mb-2 text-black/50")}>
                  What we'll say
                </p>

                {/* A preview, not a field. Everything here came from the
                    listing, and letting it be retyped here would let the
                    enquiry disagree with the home it is about. */}
                <div className="border-2 border-black bg-blue-50 p-4">
                  <ul className="flex flex-col gap-3">
                    {items.map((item) => (
                      <li
                        key={item.unitId}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-[13px]">
                            {item.kind === "entire"
                              ? "Entire home"
                              : item.unitName}
                          </span>
                          <span className={cn(MONO, "text-black/55")}>
                            {item.propertyName}
                          </span>
                        </span>
                        <span className="font-mono text-[13px] font-bold whitespace-nowrap">
                          {formatINR(item.monthlyRate)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 font-mono text-[11px] leading-relaxed text-black/60">
                  Pressing send opens WhatsApp with this already written. You
                  send it yourself — nothing leaves this page until you do.
                </p>
              </div>
            </div>
          </div>

          {/* ── the foot, which changes with the step ── */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t-2 border-black bg-amber-100 px-6 py-4">
            <div>
              <p className={cn(MONO, "text-black/60")}>
                {items.length > 1 ? "Total, per month" : "Per month"}
              </p>
              <p className="font-mono text-2xl font-bold">{formatINR(total)}</p>
            </div>

            {step === "cart" ? (
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setRequestedStep("form")}
                className="inline-flex items-center gap-2.5 border-2 border-black bg-black px-6 py-3.5 font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-300 uppercase transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-40 disabled:hover:bg-black disabled:hover:text-amber-300"
              >
                Send enquiry <ArrowRightIcon size={14} aria-hidden />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRequestedStep("cart")}
                  className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-3.5 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <ArrowLeftIcon size={14} aria-hidden /> Back
                </button>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 border-2 border-black bg-black px-6 py-3.5 font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-300 uppercase transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Open WhatsApp <ArrowRightIcon size={14} aria-hidden />
                </a>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
