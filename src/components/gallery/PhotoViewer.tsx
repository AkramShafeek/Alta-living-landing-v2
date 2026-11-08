import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { Photo } from "@/models/Photo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,  
  DialogTitle,
} from "@/components/ui/dialog"

type PhotoViewerProps = {
  photos: Photo[]
  /** The photo on screen; `null` closes the viewer. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

/** Full-screen, one photo at a time, with previous / next. */
export const PhotoViewer = ({
  photos,
  index,
  onIndexChange,
}: PhotoViewerProps) => {
  const count = photos.length
  const open = index !== null && count > 0
  const current = open ? ((index % count) + count) % count : 0
  const photo = photos[current]

  const go = (step: number) => onIndexChange((current + step + count) % count)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onIndexChange(null)} >
      <DialogContent        
        className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none bg-black p-0 ring-0 sm:max-w-none"
        onKeyDown={(event) => {
          if (count < 2) return
          if (event.key === "ArrowLeft") go(-1)
          if (event.key === "ArrowRight") go(1)
        }}
      >
        {photo && (
          <>
            <img
              src={photo.url}
              alt={photo.alt}
              className="max-h-full max-w-full object-contain rounded-2xl"
            />

            <div className="absolute top-4 left-4 flex max-w-[70%] flex-col gap-1.5 rounded-xl bg-black/55 px-4 py-3 backdrop-blur-sm">
              <DialogTitle className="font-semibold text-white/70">
                {photo.category}
              </DialogTitle>
              {/* <DialogDescription className="text-sm font-normal text-muted-foreground">
                {photo.caption || photo.alt}
              </DialogDescription> */}
            </div>

            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] tracking-[0.16em]">
              {current + 1} / {count}
            </span>

            {count > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Previous photo"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-4 rounded-full"
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Next photo"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-4 rounded-full"
                >
                  <ChevronRightIcon />
                </Button>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
