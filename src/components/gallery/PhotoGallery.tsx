import type { Photo } from "@/models/Photo"
import type { UnitDetail } from "@/store/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PhotoGalleryProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Every photo of the home. */
  photos: Photo[]
  units: UnitDetail[]
  /** A photo was clicked: `list` is what the full-screen viewer should page through. */
  onSelect: (list: Photo[], index: number) => void
}

/**
 * Brutalist trigger, same as the page's "Rooms / Entire home" tabs: square
 * segments split by black rules, amber when selected. `h-auto` + stretch so
 * each segment fills the list's full height instead of the base 1px-short pill.
 */
const tabTrigger = [
  "flex-none rounded-full border-0! border-black! px-3 py-1.5 last:border-r-0! font-normal text-foreground",
  // "font-mono text-[11px] font-semibold tracking-[0.16em] text-foreground uppercase",
  "transition-all hover:bg-amber-400 hover:text-foreground active:scale-[0.92]",
  "focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black",
  "data-active:bg-amber-400 data-active:text-foreground data-active:shadow-none data-active:shadow-[2px_2px_0_#000] data-active:border!",
].join(" ")

/** Groups photos by category, keeping the order categories first appear in. */
const byCategory = (photos: Photo[]) => {
  const groups = new Map<string, Photo[]>()
  for (const photo of photos) {
    groups.set(photo.category, [...(groups.get(photo.category) ?? []), photo])
  }
  return [...groups]
}

const PhotoGrid = ({
  photos,
  onSelect,
}: {
  photos: Photo[]
  onSelect: (photo: Photo) => void
}) =>
  photos.length === 0 ? (
    <p className="py-16 text-center font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
      Photos coming soon
    </p>
  ) : (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onSelect(photo)}
          className="group relative aspect-4/3 overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <img
            src={photo.url}
            alt={photo.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </button>
      ))}
    </div>
  )

/** Full-screen grid of every photo, tabbed by unit. */
export const PhotoGallery = ({
  open,
  onOpenChange,
  title,
  photos,
  units,
  onSelect,
}: PhotoGalleryProps) => {
  const rooms = units.filter((unit) => unit.kind === "room")
  const groups = byCategory(photos)
  // The "All" tab pages through photos in the order the grid shows them.
  const allInOrder = groups.flatMap(([, list]) => list)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-4 rounded-none p-0 ring-0 sm:max-w-none">
        <DialogHeader className="px-6 pt-6 pr-16">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{photos.length} photos</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="min-h-0 flex-1 flex-col">
          <ScrollArea className="w-full px-6">
            {/* mb/mr leave room for the hard shadow inside the scroll viewport */}
            <TabsList className="mr-1 mb-1.5 h-auto! items-stretch gap-2 overflow-hidden rounded-full border border-black bg-blue-100 p-2">
              <TabsTrigger value="all" className={tabTrigger}>
                All photos
              </TabsTrigger>
              {rooms.map((room) => (
                <TabsTrigger key={room.id} value={room.id} className={tabTrigger}>
                  {room.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <ScrollArea className="min-h-0 flex-1 mt-4">
            <div className="px-6 pb-10">
              <TabsContent value="all" className="flex flex-col gap-8 pt-2">
                {groups.map(([category, list]) => (
                  <section key={category} className="flex flex-col gap-3">
                    <h3 className="text-muted-foreground text-lg">
                      {category}
                    </h3>
                    <PhotoGrid
                      photos={list}
                      onSelect={(photo) =>
                        onSelect(allInOrder, allInOrder.indexOf(photo))
                      }
                    />
                  </section>
                ))}
              </TabsContent>

              {rooms.map((room) => (
                <TabsContent key={room.id} value={room.id} className="pt-2">
                  <PhotoGrid
                    photos={room.photos}
                    onSelect={(photo) =>
                      onSelect(room.photos, room.photos.indexOf(photo))
                    }
                  />
                </TabsContent>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
