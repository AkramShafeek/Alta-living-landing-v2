// ─────────────────────────────────────────────────────────────────────────
// Service layer.
//
// Fetches flat rows from the repositories and hands them to the builder. It
// does not coerce (the db did), does not validate (the db did), and does not
// format (selectors will). It joins, and that is all.
//
// Repositories arrive as one object rather than ten positional arguments — at
// that count a positional list is unreadable at the call site and a silent
// hazard wherever two tables have similar shapes.
// ─────────────────────────────────────────────────────────────────────────

import type { RowOf } from "@/db/config"
import type { Repository } from "@/repositories"
import type { PropertyDetail } from "@/store/types"
import { buildProperty } from "./propertyBuilder"

export type PropertyRepositories = {
  properties: Repository<RowOf<"properties">>
  units: Repository<RowOf<"units">>
  photos: Repository<RowOf<"photos">>
  reviews: Repository<RowOf<"reviews">>
  nearby: Repository<RowOf<"nearby">>
  amenities: Repository<RowOf<"amenities">>
  included: Repository<RowOf<"included">>
  notIncluded: Repository<RowOf<"notIncluded">>
  housekeeping: Repository<RowOf<"housekeeping">>
  highlights: Repository<RowOf<"highlights">>
  hosts: Repository<RowOf<"hosts">>
}

/**
 * Which properties a caller is asking for.
 *
 * `status` is how ops takes a home off the site, so the default has to be the
 * safe one: only `live` comes back unless something explicitly asks otherwise.
 * The alternative default publishes drafts, which is the worse direction for
 * this to fail in.
 */
export type PropertyQuery = {
  /** Include `draft`, `paused` and `archived`. For an ops preview, not the site. */
  includeNonLive?: boolean
}

/** Thrown when a slug addresses nothing. Distinct from a load failure. */
export class PropertyNotFoundError extends Error {
  constructor(slug: string) {
    super(`No property with slug "${slug}"`)
    this.name = "PropertyNotFoundError"
  }
}

/** The one definition of "a guest can see this". */
const isLive = (property: RowOf<"properties">): boolean =>
  property.status === "live"

export class PropertyService {
  private readonly repos: PropertyRepositories

  constructor(repos: PropertyRepositories) {
    this.repos = repos
  }

  /**
   * Every property, fully nested.
   *
   * Each property is assembled by the same path as a single lookup, so there is
   * one build chain in this file rather than two that can drift apart.
   *
   * This does scan each child table once per property instead of grouping it
   * once overall. That is not a fetch-per-property: `db.getTable` caches the
   * whole table on first read, so the driver is hit once regardless and the
   * repeated work is a filter over an array already in memory. If the catalog
   * ever outgrows a few dozen homes, group the children once here instead.
   */
  async getAllProperties(query: PropertyQuery = {}): Promise<PropertyDetail[]> {
    const rows = await this.repos.properties.findAll()
    const visible = query.includeNonLive ? rows : rows.filter(isLive)

    return Promise.all(visible.map((property) => this.assemble(property)))
  }

  /**
   * One property, fully nested. Throws `PropertyNotFoundError` on a bad slug,
   * and on a slug that addresses a property which is not live.
   *
   * A non-live property is deliberately indistinguishable from a missing one.
   * Filtering it out of the listing but still serving it to anyone holding the
   * link would defeat the filter — a paused home is paused for everyone.
   */
  async getPropertyBySlug(
    slug: string,
    query: PropertyQuery = {}
  ): Promise<PropertyDetail> {
    const property = await this.repos.properties.findOneBy("slug", slug)
    if (!property) throw new PropertyNotFoundError(slug)
    if (!query.includeNonLive && !isLive(property))
      throw new PropertyNotFoundError(slug)

    return this.assemble(property)
  }

  /** One property, fully nested. Throws `PropertyNotFoundError` on a bad id. */
  async getPropertyById(
    id: string,
    query: PropertyQuery = {}
  ): Promise<PropertyDetail> {
    const property = await this.repos.properties.findById(id)
    if (!property) throw new PropertyNotFoundError(id)
    if (!query.includeNonLive && !isLive(property))
      throw new PropertyNotFoundError(id)

    return this.assemble(property)
  }

  /**
   * The single join. Every public method above funnels through here, so the
   * list page and the detail page cannot disagree about what a property is.
   */
  private async assemble(
    property: RowOf<"properties">
  ): Promise<PropertyDetail> {
    const id = property.id

    const [
      units,
      photos,
      reviews,
      nearby,
      amenities,
      included,
      notIncluded,
      housekeeping,
      highlights,
      host,
    ] = await Promise.all([
      this.repos.units.findByPropertyId(id),
      this.repos.photos.findByPropertyId(id),
      this.repos.reviews.findByPropertyId(id),
      this.repos.nearby.findByPropertyId(id),
      this.repos.amenities.findByPropertyId(id),
      this.repos.included.findByPropertyId(id),
      this.repos.notIncluded.findByPropertyId(id),
      this.repos.housekeeping.findByPropertyId(id),
      this.repos.highlights.findByPropertyId(id),
      this.repos.hosts.findById(property.hostId),
    ])

    return buildProperty(property)
      .withUnits(units)
      .withPhotos(photos)
      .withReviews(reviews)
      .withNearby(nearby)
      .withAmenities(amenities)
      .withIncluded(included)
      .withNotIncluded(notIncluded)
      .withHousekeeping(housekeeping)
      .withHighlights(highlights)
      .withHost(host)
      .build()
  }
}
