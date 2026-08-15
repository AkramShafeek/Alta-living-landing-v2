import { HomeIcon, MapPinIcon, StarIcon } from "lucide-react"
import { Separator } from "./ui/separator"
import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  blue: "bg-blue-50",
  peach: "bg-orange-50",
  sage: "bg-green-50",
  lilac: "bg-violet-50",
  butter: "bg-amber-50",
} as const

export const TestimonialCard = ({
  quote,
  name,
  location,
  rating = 5,
  tone = "blue",
}: {
  quote?: string
  name?: string
  location?: string
  rating?: number
  tone?: keyof typeof TONE_CLASSES
}) => {
  return (
    <div className={cn("w-full flex flex-1 flex-col border shadow-[3px_5px_0px_#000] border-black gap-2 overflow-hidden h-full", TONE_CLASSES[tone])}>
      <div className="flex flex-col w-full justify-between h-full">
        <div className="flex flex-col p-4 w-full gap-2">
          <div className="flex w-full justify-between items-center">
            <p className="text-2xl font-bold">{name || "Guest Name"}</p>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  size={16}
                  className={i < rating ? "fill-black text-black" : "text-muted-foreground"}
                />
              ))}
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {quote ||
              "Something nice this guest said about staying at the property, kept short enough to fit a couple of lines."}
          </p>

        </div>

        <div className="flex flex-col gap-2 border-t border-black">
          {/* <Separator className="bg-black"/> */}
          <div className="text-xs flex justify-between gap-2 items-center p-2">
            <div className="bg-blue-200 text-blue-800 text-xs h-fit px-2 py-1 flex gap-2 items-center">
              <MapPinIcon size={12} />
              {location || "Indiranagar, Bangalore"}
            </div>
            <p className="flex items-center gap-1 text-muted-foreground">
              <HomeIcon size={16} /> Verified Stay
            </p>
          </div>
        </div>


      </div>
    </div>
  )
}
