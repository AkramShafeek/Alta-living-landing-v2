import type { ReactNode } from "react"
import { CheckIcon, DoorOpenIcon, PlusIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A card for one thing you can book — a room, or an entire home.
 *
 * Composed like shadcn's own `Card` (see `components/ui/card.tsx`): flat,
 * independently-named parts rather than one component configured through a
 * growing prop list. A caller owns its own data end to end — what `title`
 * says, what goes in the `List`, what `RoomCardAction` does on click.
 * `RoomCard` itself knows nothing about rooms, rents, or enquiries, only
 * about this layout — so the same parts describe a single room or an entire
 * home.
 *
 * Import as a namespace to use the dot-notation this file is named for:
 *   import * as RoomCard from "@/components/RoomCard"
 *   <RoomCard.Root>...<RoomCard.Media>...
 */

const monoLabel =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"

const DEFAULT_ICON_SIZE = 14

function RoomCard({
  bookable = true,
  className,
  children,
}: {
  /** Whether the thing this card represents can currently be taken. Only
   *  controls the card's own dimming — `RoomCardStatus` and `RoomCardAction`
   *  take their own availability so a caller can set them independently. */
  bookable?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <article
      className={cn(
        "grid border-2 rounded-4xl border-black/15 bg-white p-4 lg:grid-cols-[1fr_1fr]",
        !bookable && "opacity-70",
        className
      )}
    >
      {children}
    </article>
  )
}

/** The left-hand slot — a photo grid, a single image, whatever the caller has. */
function RoomCardMedia({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

/** The right-hand column: header, list and footer, vertically centred. */
function RoomCardContent({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col justify-center pl-7", className)}>
      {children}
    </div>
  )
}

function RoomCardHeader({
  title,
  area,
  price,
  priceUnit = "per month",
}: {
  title: ReactNode
  /** The line under the title — a neighbourhood, a size, a note. Omitted when empty. */
  area?: ReactNode
  price: ReactNode
  priceUnit?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-7 pt-7 pb-5">
      <div className="min-w-0">
        <h3 className="bricolage-grotesque-500 text-3xl leading-tight tracking-tight">
          {title}
        </h3>
        {area && <p className={cn(monoLabel, "mt-1.5")}>{area}</p>}
      </div>

      <div className="text-right">
        <p className="font-mono text-3xl font-bold whitespace-nowrap">
          {price}
        </p>
        <p className={cn(monoLabel, "mt-0.5")}>{priceUnit}</p>
      </div>
    </div>
  )
}

export type RoomCardListItem = {
  key: string
  label: ReactNode
  icon?: LucideIcon
}

/** The amenities/features list — or any other label list a caller wants here. */
function RoomCardList({
  items,
  availability,
}: {
  items: RoomCardListItem[]
  /**
   * A count line — "2/5 Available" — for a listing that stands for several
   * identical rooms. Omitted for a single room, whose status tag already says
   * all there is to say.
   */
  availability?: ReactNode
}) {
  if (items.length === 0 && !availability) return null

  return (
    <ul className="flex flex-col gap-x-6 gap-y-3 px-7 pb-7">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-center gap-2 font-mono text-[13px] text-black/75"
        >
          {item.icon && (
            <item.icon
              size={DEFAULT_ICON_SIZE}
              aria-hidden
              className="shrink-0"
            />
          )}
          {item.label}
        </li>
      ))}
      {availability && (
        <li key="availability" className="flex items-center gap-2 font-mono text-[13px] text-black/75">
          <DoorOpenIcon size={DEFAULT_ICON_SIZE} aria-hidden className="shrink-0" />
          {availability}
        </li>
      )}
    </ul>
  )
}

function RoomCardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-7 py-5">
      {children}
    </div>
  )
}

/** A cluster within the footer — the status side, or the action side. */
function RoomCardGroup({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </span>
  )
}

function RoomCardStatus({
  label,
  available,
}: {
  label: ReactNode
  available: boolean
}) {
  return (
    <span
      className={cn(
        "border-2 border-black px-2.5 py-1 font-mono text-[10px] rounded-full font-semibold tracking-[0.16em] uppercase",
        available ? "bg-green-100" : "bg-black text-background"
      )}
    >
      {label}
    </span>
  )
}

/** A small mono aside next to the status tag — a deposit, a nightly rate. */
function RoomCardNote({ children }: { children: ReactNode }) {
  return <span className={monoLabel}>{children}</span>
}

type RoomCardActionState = "idle" | "active" | "unavailable"

function RoomCardAction({
  state,
  onClick,
  idleLabel = "Add to enquiry",
  activeLabel = "In your enquiry",
  unavailableLabel = "Not available",
  idleIcon: IdleIcon = PlusIcon,
  activeIcon: ActiveIcon = CheckIcon,
}: {
  state: RoomCardActionState
  onClick?: () => void
  idleLabel?: ReactNode
  activeLabel?: ReactNode
  unavailableLabel?: ReactNode
  idleIcon?: LucideIcon
  activeIcon?: LucideIcon
}) {
  if (state === "unavailable") {
    return (
      <span className="border-2 border-black bg-white px-4 py-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase opacity-70">
        {unavailableLabel}
      </span>
    )
  }

  const active = state === "active"

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-2 border-black px-4 py-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black rounded-full",
        active
          ? "bg-black text-amber-300 hover:bg-white hover:text-black"
          : "bg-amber-400 hover:bg-black hover:text-amber-300"
      )}
    >
      {active ? (
        <>
          <ActiveIcon size={13} aria-hidden /> {activeLabel}
        </>
      ) : (
        <>
          <IdleIcon size={13} aria-hidden /> {idleLabel}
        </>
      )}
    </button>
  )
}

export {
  RoomCard,
  RoomCardMedia,
  RoomCardContent,
  RoomCardHeader,
  RoomCardList,
  RoomCardFooter,
  RoomCardGroup,
  RoomCardStatus,
  RoomCardNote,
  RoomCardAction,
}
