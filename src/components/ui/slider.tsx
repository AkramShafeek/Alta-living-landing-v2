import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// shadcn's slider, restyled to the project's brutalist grammar: square
// corners, 2px black borders, amber fill and a hard offset shadow on the
// thumb instead of the default rounded/soft treatment.
function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbCount =
    props.value?.length ?? props.defaultValue?.length ?? 1

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-3 w-full grow border-2 border-black bg-white"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-amber-400"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={i}
          className="block size-5 border-2 border-black bg-white shadow-[3px_3px_0_#000] transition-[box-shadow,translate] hover:bg-amber-400 focus-visible:outline-none focus-visible:bg-amber-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000] disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
