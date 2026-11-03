# Bulk import format (ops editor → Import JSON)

One JSON file describes one or more homes completely. Each home is a single
nested object containing its rooms, their photos and reviews, and every other
child table. The importer flattens it into the sheet's tabs; you never write a
`propertyId`.

- **Code:** `src/ops/importJson.ts`
- **Worked example:** `docs/examples/bulk-import.example.json`, with two homes
  that use every section
- **Tests:** `src/ops/test/importJson.test.ts`. They import the example, so if
  this doc and the code disagree, a test fails.
- **Field rules:** the Zod models in `src/models/*.ts`. Those decide validity,
  not this doc.

---

## 1. Top level

The canonical form:

```json
{
  "version": 1,
  "properties": [ { …home… }, { …home… } ]
}
```

Also accepted: a bare array of homes, `[ {…}, {…} ]`, or a single home object.
`version` is informational only and nothing reads it yet.

---

## 2. A home

A home is the `properties` columns as flat keys, plus up to nine nested keys:

```jsonc
{
  "id": "prop_101",            // REQUIRED, the one id that is never optional
  "slug": "koramangala-flat",  // must not match another home's slug
  "name": "…",
  // …every other `properties` column, see §6…

  "units":        [ {unit} ],        // rooms + the whole-home row; each may nest photos/reviews
  "photos":       [ {photo} ],       // photos of the home, not of one room
  "reviews":      [ {review} ],      // reviews of the home, not of one room
  "amenities":    ["washer", "lift"],            // bare keys
  "included":     ["electricity", "internet"],   // bare keys
  "notIncluded":  [ {item, note} ],
  "housekeeping": [ {cover, frequency} ],
  "nearby":       [ {kind, name, minutes, mode} ],
  "highlights":   [ {value, label} ]
}
```

Every nested key is optional. Leave one out and that home gets no rows in that
tab.

### A unit

A unit is a `units` row, with optional nested `photos` and `reviews` belonging to
that room:

```jsonc
{
  "id": "prop_101-room-1",   // optional, see §3
  "kind": "room",            // defaults to "room"; use "entire" for the whole-home row
  "name": "Courtyard room",
  "maxOccupancy": 2, "monthlyRate": 24000, "nightlyRate": 1800, "status": "available",
  "photos":  [ {photo} ],    // unitId is set for you
  "reviews": [ {review} ]    // unitId is set for you
}
```

A home needs exactly **one** `"kind": "entire"` unit if it lets the whole home
(`allowsEntireBooking`, which defaults to true). Rooms are optional; a studio is
often just the one entire unit.

**Replica rooms** are N identical rooms listed once. Set `"hasReplicas": true`
with `"totalCount"` and `"occupiedCount"`. The model requires both counts when
`hasReplicas` is true, requires `occupiedCount ≤ totalCount`, and allows
replicas only on rooms, never on the `entire` unit.

---

## 3. Ids

| Table | id | If omitted |
|---|---|---|
| home (`properties`) | **required** | import refuses the file |
| `units` | optional | left blank, **unless** the unit nests photos/reviews: then it is generated so they can point at it |
| `photos`, `reviews` | optional | left blank |
| amenities, included, notIncluded, housekeeping, nearby, highlights | no id column | — |

A blank id is still invalid on the site (`id` is required by the model), so it
shows as a problem in the editor. Open the home and click **Fill N missing
ids**, or use **Auto** next to one blank id field.

**Generated ids** are always `<propertyId>-<noun>-<n>`:

```
prop_101-room-1    prop_101-photo-3    prop_101-review-1    prop_101-entire
```

`n` is the smallest number not already used anywhere in that tab. The whole-home
unit gets `<propertyId>-entire`. Different homes can't collide because the
prefixes differ. Older ids (`unit_001a`, `ph_001b`) remain valid; ids are never
parsed, only compared.

If you **supply** ids, they must be unique across the whole tab, including
other homes. A clash refuses the import.

A top-level photo or review can set `unitId` explicitly to a unit's id. That's
the only reason to write `unitId`; inside a unit it's ignored with a warning.

---

## 4. Values

Write normal JSON. The importer converts each value into the string a sheet
cell would hold, and the site's own coercers read it back.

| JSON | Becomes | Use for |
|---|---|---|
| `"text"` | as is | text, enums, dates |
| `18000`, `12.93` | `"18000"`, `"12.93"` | numbers. `"18,000"` as a string also works |
| `true` / `false` | `"TRUE"` / `"FALSE"` | booleans |
| `null` or omitted | blank | anything optional, or to take the default |
| `["a","b"]` | `"a\|b"` | only list columns (none on a home today) |
| an object | refused | — |

- **Dates** are `"dd/mm/yyyy"` (`"01/11/2026"`). ISO `"2026-11-01"` also works.
- **Enums** must match exactly and are case-sensitive. See §6.
- **Unknown keys** are dropped and listed under "ignored" in the import banner.
  Check that list for typos: a misspelled column is silently missing data.
- **`order`** on photos, notIncluded and highlights defaults to position. The
  home's photos come first, then each unit's photos in unit order.
- **Values are not validated at import.** A wrong enum or a missing required
  field still imports, the banner counts it, and the editor marks it on the
  field. Fix it there, or fix the file and re-import.

---

## 5. Importing, and re-importing

- **New id:** the home is appended.
- **Existing id:** the home is **replaced whole**. Its old rows in every tab are
  deleted and the file's rows take their place, after a confirm dialog. To
  correct a home, edit the file and import it again; nothing is merged.
- **Refused files change nothing.** The importer refuses: invalid JSON, a home
  without `id`, the same home twice, a slug or child id already in use, and
  structural errors (a list where an object belongs, and so on). Every problem
  is listed at once.
- The import only changes the **draft** in this browser. After it, export as
  usual and paste into the sheet.
- **Photos** take a `url` and are not uploaded. Any of these works:
  - a **Google Drive share link**, pasted as Drive gives it
    (`https://drive.google.com/file/d/<id>/view?usp=sharing`). The site
    rewrites it to the image (`lh3.googleusercontent.com/d/<id>=w2000`) when it
    reads the sheet, and the cell keeps the link as pasted. The file must be
    shared as **Anyone with the link**, or it shows as broken. This isn't an
    official Google API; fine to start with, but move to a real image host
    once traffic grows.
  - a file in `public/homes/<id>/…`, served as `/homes/<id>/…`
  - any full image URL (CDN, Cloudinary, …)

---

## 6. Field reference

`*` = required. `(default)` = what you get if you leave it out. The rest are
optional and blank by default.

### Home (`properties`)

| Field | Type | Values / notes |
|---|---|---|
| `id`* | text | e.g. `prop_101` |
| `slug`* | text | URL: `/listings/<slug>`; unique |
| `name`* | text | |
| `status`* | enum | `draft` `live` `paused` `archived`. Only `live` shows on the site |
| `listedOn`, `vettedOn` | date | dd/mm/yyyy |
| `vettedBy` | text | |
| `city`* | enum | `Bangalore` `Goa` `Coorg` `Mandya` |
| `neighbourhood`* | text | |
| `subLocality` | text | |
| `addressLine`, `pincode` | text | ops only, not shown |
| `lat`, `lng` | number | |
| `floor`, `totalFloors` | int | 0 = ground |
| `hasLift` | bool | (false) |
| `propertyType`* | enum | `apartment` `independent_house` `villa` `studio` |
| `bedrooms`*, `bathrooms`* | int ≥ 0 | |
| `balconies` | int | (0) |
| `carpetAreaSqft`* | number > 0 | |
| `furnishing`* | enum | `fully` `semi` |
| `maxOccupancy`* | int > 0 | |
| `deskCount`, `taskChairCount` | int | (0) |
| `acRooms`* | enum | `all` `bedrooms_only` `living_only` `none` |
| `kitchenType`* | enum | `full` `kitchenette` `none` |
| `kitchenHob`, `kitchenFridge`, `kitchenMicrowave`, `kitchenOven`, `kitchenCookware` | bool | (false) |
| `laundry`* | enum | `washer_dryer` `washer` `shared` `none` |
| `parkingCar`, `parkingTwoWheeler` | int | (0) |
| `parkingCovered` | bool | (false) |
| `floorPlanUrl` | text | |
| `wifiDownMbps`* | number > 0 | |
| `wifiWired` | bool | (false) |
| `wifiProvider` | text | |
| `powerBackup`* | enum | `none` `partial` `full` |
| `waterSource`* | enum | `corporation` `borewell` `both` |
| `waterHotWater`* | enum | `geyser` `solar` `none` |
| `waterDrinking`* | enum | `ro` `can` `none` |
| `housekeepingCadence`* | enum | `weekly` `fortnightly` `on_demand` `none` |
| `linenChange`* | enum | `weekly` `fortnightly` `on_request` |
| `gstInvoice` | bool | (false) |
| `tenantFit`* | enum | `anyone` `couples_welcome` `family_only` `women_only` `men_only` |
| `smoking`*, `alcohol`*, `pets`* | enum | `allowed` `not_allowed` `on_request` |
| `overnightGuests`* | enum | `allowed` `on_request` `not_allowed` |
| `partyPolicy`* | enum | `no_parties` `ok_with_notice` |
| `kycRequired` | bool | (true) |
| `agreementType`* | enum | `rental_agreement` `license` `none` |
| `sharedWith` | text | per-room stays only |
| `currency` | enum | `INR` (INR) |
| `minStayNights`* | int > 0 | |
| `noticePeriodDays`, `lockInMonths` | int | (0) |
| `allowsEntireBooking` | bool | (true). False hides the entire unit on the site |
| `hook`* | text ≤ 140 chars | one-line pitch on the card |
| `body`* | text | the story |
| `founderNote` | text | |
| `displayOnHome` | bool | (false). Featured on the landing page |
| `hostId`* | text | must match a host id; today that's `host_meera` |

### Unit (`units`)

| Field | Type | Values / notes |
|---|---|---|
| `id` | text | optional here, see §3 |
| `kind` | enum | `room` (default in import), `entire` |
| `name`* | text | |
| `bedType` | enum | `king` `queen` `double` `single` `bunk` |
| `bathroom` | enum | `ensuite` `shared` |
| `hasDesk`, `hasAc`, `hasBalcony` | bool | (false) |
| `areaSqft` | number > 0 | |
| `maxOccupancy`* | int > 0 | |
| `monthlyRate`*, `nightlyRate`* | number ≥ 0 | rupees |
| `deposit` | number | (0) |
| `status`* | enum | `available` `booked` `on_notice` `blocked`. Only `available` is bookable |
| `note` | text | |
| `hasReplicas` | bool | (false) |
| `totalCount` | int > 0 | required if `hasReplicas` |
| `occupiedCount` | int ≥ 0 | required if `hasReplicas`; ≤ `totalCount` |
| `photos`, `reviews` | list | nested, see below |

### Photo (`photos`)

| Field | Type | Notes |
|---|---|---|
| `id` | text | optional here |
| `url`* | text | Drive share link, `/homes/…`, or a full image URL |
| `alt`* | text | describe the image (accessibility requirement) |
| `caption` | text | |
| `category` | text | ("All Photos"), e.g. `Living`, `Bedroom`, `Kitchen` |
| `order` | int | defaults to position |
| `isHero` | bool | (false). Set on exactly one home photo |
| `unitId` | text | top-level photos only, to point at a unit by id |

### Review (`reviews`)

| Field | Type | Notes |
|---|---|---|
| `id` | text | optional here |
| `authorFirstName`* | text | |
| `authorCity` | text | |
| `stayMonth` | text | `"Mar 2025"` |
| `stayDurationNights` | int > 0 | |
| `rating`* | number 1–5 | |
| `text`* | text | |
| `source`* | enum | `direct` `google` `whatsapp` |
| `verified` | bool | (false) |
| `unitId` | text | top-level reviews only |

### Key lists

- `amenities`: any of `fully_furnished` `work_desk` `task_chair` `washer`
  `dryer` `dishwasher` `ro_water` `power_backup` `covered_parking`
  `two_wheeler_parking` `balcony` `courtyard` `lift` `gym` `pool` `security`
  `pet_friendly` `gst_invoice`
- `included`: any of `electricity` `water` `gas` `internet` `maintenance`
  `housekeeping` `linen`

Duplicates in a key list are dropped.

### Small tables

| Table | Fields |
|---|---|
| `notIncluded` | `item`*, `note`, `order` (position) |
| `housekeeping` | `cover`*, `frequency`*: `daily` `weekly` `fortnightly` `monthly` `quarterly` `yearly` `on_demand` |
| `nearby` | `kind`*: `metro` `tech_park` `airport` `cafe_strip` `grocery` `hospital` `gym` `park`; `name`*; `minutes`* (int > 0); `mode`*: `walk` `drive` |
| `highlights` | `value`*, `label`*, `order` (position). Three at most per home |

---

## 7. Checklist for writing a batch (for Claude, later)

1. Start from `docs/examples/bulk-import.example.json` and keep its key order.
2. Pick home ids that aren't in the sheet yet. Check the editor's list; ids
   continue as `prop_NNN`. Re-using an id **replaces** that home.
3. Slugs: lowercase `neighbourhood-name`, unique.
4. New homes should use `"status": "draft"` so nothing goes live by accident.
5. Each home: exactly one `"kind": "entire"` unit unless
   `allowsEntireBooking: false`. One home photo with `"isHero": true`.
6. Omit child ids, or write them as `<propId>-room-N` etc. Don't invent another
   scheme.
7. Validate the JSON before handing it over. A trailing comma refuses the whole
   file.
8. After import: read the banner's "ignored" list (typos), click **Fill missing
   ids** on each home, check the problem count is 0, then export.
