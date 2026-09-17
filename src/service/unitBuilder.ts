// ─────────────────────────────────────────────────────────────────────────
// Unit rows → UnitDetail.
//
// A photo carries `unitId`; a unit carries no `photoIds`. The link is stored
// from one side only, so this is where it gets walked in reverse.
// ─────────────────────────────────────────────────────────────────────────

import type { Photo } from "@/models/Photo"
import type { Unit } from "@/models/Rooms"
import type { UnitDetail } from "@/store/types"
import { byOrder, stripPropertyId } from "./nesting"

/**
 * One unit with its own photos.
 *
 * `photos` must already be this unit's — use `buildUnitDetails` when you have
 * the whole property's set, so the grouping happens once rather than per unit.
 */
export function buildUnitDetail(unit: Unit, photos: Photo[]): UnitDetail {
  return {
    ...stripPropertyId(unit),
    photos: [...photos].sort(byOrder),
  }
}

/**
 * Every unit of a property, each with its photos.
 *
 * Groups the photos in one pass rather than filtering the full list per unit —
 * the same reason the repositories expose `groupBy`.
 */
export function buildUnitDetails(units: Unit[], photos: Photo[]): UnitDetail[] {
  const photosByUnit = new Map<string, Photo[]>()

  for (const photo of photos) {
    // A photo of the whole home carries no unitId. It belongs on the property
    // and nowhere else, so it is skipped rather than bucketed under "".
    if (!photo.unitId) continue

    const bucket = photosByUnit.get(photo.unitId)
    if (bucket) bucket.push(photo)
    else photosByUnit.set(photo.unitId, [photo])
  }

  return units.map((unit) =>
    buildUnitDetail(unit, photosByUnit.get(unit.id) ?? [])
  )
}
