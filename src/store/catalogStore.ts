// ─────────────────────────────────────────────────────────────────────────
// Catalog store — cached server state, filled lazily.
//
// Two ways in, and they fill different amounts:
//   · loadAllProperties()  — the listing page, fills everything
//   · loadProperty(slug)   — a deep link, fills exactly one
//
// So "loaded" is two questions, not one: do we have *this* property, and do we
// have *all* of them. `status` answers neither — it describes the most recent
// request. Presence in `properties` answers the first, `allLoaded` the second.
// A component that reads `status === "ready"` to mean "the catalog is complete"
// will be wrong the moment someone deep-links to a property.
//
// Nothing derived is stored. No "2 BHK", no price-from, no formatted rupees —
// those are selectors computed at read time, so a stored display string cannot
// drift from the fact it was built from.
// ─────────────────────────────────────────────────────────────────────────

import { create } from "zustand"
import db from "@/db/db"
import { immer } from "zustand/middleware/immer"
import { propertyService } from "@/service"
import { PropertyNotFoundError } from "@/service/propertyService"
import type { PropertyDetail } from "./types"

export type CatalogStatus = "idle" | "loading" | "ready" | "error"

type CatalogState = {
  /** Keyed by id. The URL addresses by slug, everything else references by id. */
  properties: Record<string, PropertyDetail>
  /** slug → id */
  slugIndex: Record<string, string>

  /** True only once the whole catalog has been fetched. */
  allLoaded: boolean
  /** Slugs the service has told us do not exist — so a 404 does not refetch. */
  notFound: string[]

  /** Describes the most recent request, not what the store contains. */
  status: CatalogStatus
  error: string | null

  loadAllProperties: (opts?: { force?: boolean }) => Promise<void>
  loadProperty: (slug: string, opts?: { force?: boolean }) => Promise<void>
}

/**
 * In-flight requests, so two components mounting in the same tick share one
 * round trip instead of racing. Module-level rather than in the store: it is
 * bookkeeping, not state anything renders.
 */
let allInflight: Promise<void> | null = null
const slugInflight = new Map<string, Promise<void>>()

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Could not load the catalog"

export const useCatalogStore = create<CatalogState>()(
  immer((set, get) => ({
    properties: {},
    slugIndex: {},
    allLoaded: false,
    notFound: [],
    status: "idle",
    error: null,

    loadAllProperties: async (opts = {}) => {
      if (!opts.force && get().allLoaded) return
      if (allInflight) return allInflight

      // Without this, `force` re-runs the join over rows the db still has
      // cached and returns exactly what is already on screen. That was correct
      // while every table was a static import — refetching a fixture cannot
      // change it — and stopped being correct the moment rows could change
      // underneath us. This is the only path from the UI to fresh sheet data.
      if (opts.force) db.invalidate()

      allInflight = (async () => {
        set((state) => {
          state.status = "loading"
          state.error = null
        })

        try {
          const details = await propertyService.getAllProperties()

          set((state) => {
            // Replaced wholesale rather than merged: the sheet is the source of
            // truth, so a property deleted there must disappear here too.
            state.properties = {}
            state.slugIndex = {}
            for (const detail of details) {
              state.properties[detail.property.id] = detail
              state.slugIndex[detail.property.slug] = detail.property.id
            }
            state.allLoaded = true
            state.notFound = []
            state.status = "ready"
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.status = "error"
            state.error = messageOf(error)
          })
          console.error("[catalogStore] loadAllProperties failed:", error)
        } finally {
          allInflight = null
        }
      })()

      return allInflight
    },

    loadProperty: async (slug, opts = {}) => {
      if (!opts.force) {
        const { slugIndex, notFound } = get()
        if (slugIndex[slug]) return
        if (notFound.includes(slug)) return
      }

      if (opts.force) db.invalidate()

      const pending = slugInflight.get(slug)
      if (pending) return pending

      const request = (async () => {
        set((state) => {
          state.status = "loading"
          state.error = null
        })

        try {
          const detail = await propertyService.getPropertyBySlug(slug)

          set((state) => {
            // Merged, not replaced — whatever else is already here stays.
            state.properties[detail.property.id] = detail
            state.slugIndex[detail.property.slug] = detail.property.id
            state.status = "ready"
            state.error = null
          })
        } catch (error) {
          // A slug that addresses nothing is an expected outcome of a bad URL,
          // not a failure to load. Recorded so the route can 404 without
          // refetching, and kept out of `error`, which means "something broke".
          if (error instanceof PropertyNotFoundError) {
            set((state) => {
              if (!state.notFound.includes(slug)) state.notFound.push(slug)
              state.status = "ready"
              state.error = null
            })
            return
          }

          set((state) => {
            state.status = "error"
            state.error = messageOf(error)
          })
          console.error(`[catalogStore] loadProperty("${slug}") failed:`, error)
        } finally {
          slugInflight.delete(slug)
        }
      })()

      slugInflight.set(slug, request)
      return request
    },
  }))
)

/** Test seam — the module-level in-flight maps outlive a store reset. */
export const __resetCatalogStore = (): void => {
  allInflight = null
  slugInflight.clear()
  useCatalogStore.setState({
    properties: {},
    slugIndex: {},
    allLoaded: false,
    notFound: [],
    status: "idle",
    error: null,
  })
}
