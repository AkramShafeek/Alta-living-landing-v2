# Alta portfolio import — notes

One file per property, built on 2 Nov 2026 from `Alta Living Data/*.csv`
(Keerthan's sheets), with defaults filled on 3 Nov 2026 (see
[Defaults](#defaults-3-nov-2026)). Format: `docs/bulk-import-format.md`.
`hsr-layout-maple-house.json` is the earlier test home and is not part of the
portfolio.

| File | Home | Units in the file | Validates? |
|---|---|---|---|
| `prop_201-meridian.json` | Alta Meridian Residences · Hulimavu | 2BHK ×32, 1 free (304) | needs rates |
| `prop_202-linden.json` | Alta Linden House · Hulimavu | 1BHK ×7, 2 free; studio, booked | yes |
| `prop_203-lantern.json` | Alta Lantern House · Hulimavu | 1BHK ×9, 1 free (301) | yes |
| `prop_204-harbour.json` | Alta Harbour Residence · JP Nagar | 4 rooms in two 2BHKs (all free) + 1BHK | yes |
| `prop_205-wren.json` | Alta Wren House · Vasanthapura | 1BHK ×2, 1 free (41 G2) | yes |
| `prop_206-juniper.json` | Alta Juniper House · Yelachenahalli | whole 3BHK, occupied | no defaults: 20 fields + metro row |
| `prop_207-cedar.json` | Alta Cedar Residences · Bellandur | 3BHK ×2, both occupied | no defaults: 20 fields |
| `prop_208-skyline.json` | Alta Skyline · Bilekahalli | whole 1BHK, occupied | yes |
| `prop_209-red-brick.json` | The Red Brick Estate · Maddur | rooms ×8 + dorms ×2, all taken (assumed) | needs rates |

Every home is `"status": "draft"`. Nothing goes live until someone sets `live`.

## How the data was mapped

- **A building is one property, and identical apartments are one replica
  unit.** "Meridian 2BHK, 1/32 available" is one listing, not 32 cards. Unit
  numbers (101, 304…) aren't stored. Ops track free apartments by
  `occupiedCount`, and the unit sheet stays the record of which number is
  free.
- **Whole-home booking:** on only for single-apartment homes (Juniper,
  Skyline), which therefore have an `entire` unit. Off for every building
  (`allowsEntireBooking: false`), and those have no `entire` unit.
- **Replica `status`** is `available`, so the counts alone decide
  availability. Set it to `blocked` to shut a unit type completely.
- **Unit `maxOccupancy`** = 2 per bedroom (studio 2). This matches the "Beds"
  column exactly for every property. Property `maxOccupancy` = that column's
  total.
- **Ids:** homes are `prop_201`–`prop_209`, numbered from the
  portfolio's `#` column, chosen not to collide with existing rows. Unit ids use
  the editor's scheme (`prop_201-room-1`, `prop_206-entire`).
- **Building names** (SR Residency, SR Homes, Chaitanya, Aiekya, Green & Cozy,
  The Harbour Residence) go in `addressLine`, which is ops-only, per the naming
  rule that they are street-address names, not brands. Corridors
  (Bannerghatta Rd…) are in the address too.
- **Slugs** follow the naming sheet: `meridian`, `linden`, … plus `red-brick`.
  The site serves them at `/listings/<slug>`, not `/properties/<slug>`.
- **Hooks and bodies** are drafts written only from facts in the sheets: area,
  unit mix, corridor, landmarks named in the live listing titles, and the
  "standard at every property" list. Juniper and Cedar still have no body.
- **`hostId`** is `host_meera`, the only host in the system and still a
  placeholder.

### Amenities → master data

| Sheet says | Mapped to |
|---|---|
| Fully furnished (all) | `furnishing: "fully"` + amenity `fully_furnished` |
| Wi-Fi (all) | included `internet` |
| Housekeeping (all) | included `housekeeping` |
| Maintenance (all) | included `maintenance` |
| Kitchen (all) | `kitchenType: "full"`, including the Linden studio and Red Brick. Verify those two |
| Lift Yes / No | `hasLift` + amenity `lift` |
| Balcony Yes | amenity `balcony` + unit `hasBalcony` |
| AC No (Linden, Lantern, Wren) | `acRooms: "none"`, unit `hasAc: false`. **The sheet beats the default** |
| AC Yes | unit `hasAc: true`; `acRooms` defaulted to `bedrooms_only` |
| AC partial (Meridian 10/32, Harbour 1/3, Red Brick 4/8) | unit `note` where a unit type carries it; `acRooms` defaulted to `bedrooms_only`, so the essentials list says "Bedrooms only" for all of them |
| Self check-in, No heavy deposit | **no master-data key.** Not imported; worth adding as amenities |
| Hot tub (Harbour 1BHK listing) | **no key**; not imported |

## Prices

**From a listing the sheets map to the property (confirmed):**

| Home | Used | Source |
|---|---|---|
| Juniper | ₹1,10,000 / mo, ₹8,000 / night | "Luxurious 3BHK near Yelachenahalli Metro" (Rename) |
| Cedar | ₹1,00,000 / mo, ₹7,900 / night, per 3BHK | "Cedar - 3BHK" (Rename) |
| Skyline | ₹65,000 / mo, ₹3,200 / night | "Skyline 1BHK…@ IIMB" (Rename) |
| Harbour rooms | ₹35,000 / mo, ₹1,900 / night, **per room** | "The Harbour Residence 01" ("price is per room") |

**Defaulted from a "confirm" listing; check before going live:**

| Home | Used | Candidates |
|---|---|---|
| Linden 1BHK **and studio** | ₹35,000 / ₹1,900 | three Hulimavu 1BHK listings at ₹1,900 and ₹32–35k, "Linden or Lantern (confirm)". No studio listing exists; it takes the 1BHK rate |
| Lantern 1BHK | ₹35,000 / ₹1,900 | the same three listings |
| Wren 1BHK (both flats) | ₹45,000 / ₹2,300 | ₹40,000 / ₹2,100 and ₹45,000 / ₹2,300; which flat is which is unknown, so the higher |
| Harbour 1BHK | ₹65,000 / ₹3,700 | "Cheerful 1BHK with Hot Tub", "Alta Harbour Residence? (confirm)" |

Where listings conflict, the higher price was used: an enquiry that finds the
price lower is a pleasant surprise, the reverse is not.

**No source at all, left blank:** Meridian 2BHK, Red Brick room and dorm.
These are the only fields still failing validation outside Juniper and Cedar.

## Defaults (3 Nov 2026)

Filled only where a field was blank, on every home except Juniper and Cedar.
A value from the sheets was never overwritten.

| Field | Default | Why |
|---|---|---|
| `smoking`, `alcohol`, `pets` | `not_allowed` | asked for |
| `partyPolicy` | `no_parties` | asked for |
| `overnightGuests` | `on_request` | asked for |
| `carpetAreaSqft` | 700 | asked for. **Placeholder, not a measurement** |
| `acRooms` | `bedrooms_only` | asked for (where the sheet didn't say "No") |
| `powerBackup` | `full` | asked for |
| `bathrooms` | = bedrooms | 1BHK 1, 2BHK 2 |
| `laundry` | `washer` | cautious: no dryer claimed |
| `wifiDownMbps` | 50 | cautious; the existing homes use 100 |
| `waterSource` | `both` | most common in Bangalore |
| `waterHotWater`, `waterDrinking` | `geyser`, `ro` | every existing home |
| `housekeepingCadence`, `linenChange` | `fortnightly` | every existing home |
| `tenantFit` | `anyone` | every existing home |
| `agreementType` | `license` | every existing home |
| `minStayNights` | 7 | every existing home |

**Red Brick differs:**
- `city: "Mandya"`. Maddur's district, added to `CITIES` in
  `src/models/common.ts` (Coorg is a district too). Reads "Maddur, Mandya".
- `propertyType: "independent_house"`, since there's no resort type.
- `bedrooms: 8` and `bathrooms: 8`. The card reads "8 BHK".
- `waterSource: "borewell"`, `laundry: "none"`, `agreementType: "none"`.
- `minStayNights: 2`, because a week would rule out every weekend stay.

**Counts read conservatively** (an unconfirmed unit counts as taken):
- **Linden:** 1BHK 2/7 free, the confirmed 201 and 301; studio `booked`.
- **Red Brick:** rooms 0/8, dorms 0/2.

## Open questions per property

- **Meridian:** rates. Which apartments have the 10 ACs (only matters if they
  are priced differently).
- **Linden:**
  - Which unit is the studio.
  - Unit `302` is "Available" in the sheet but isn't a unit; `303` is, and is
    marked Occupied. If 302 means 303, the 1BHK is 3/7 free.
  - The portfolio says 8 units; the unit sheet lists 9 rows.
- **Linden / Lantern:** which of the three Hulimavu listings is which, and so
  the real rates.
- **Harbour:**
  - The 2BHK rooms are modelled as 4 separately let rooms because the listing
    says "price is per room". Confirm, and whether a whole 2BHK can also be
    taken.
  - The 1BHK price comes from a "confirm" listing.
  - Which of 515 F1/F2/G1 is the 1BHK (all are free, so nothing depends on it
    yet).
- **Wren:** the price of each flat. `propertyType` assumed `apartment`.
- **Juniper, Cedar:**
  - "No availability given — assumed occupied" in the source.
  - Every other field still blank, by request.
  - Juniper's metro row needs `minutes` and `mode`.
- **Skyline:** no row in the unit sheet. The summary row says 1 unit, 0
  free.
- **Red Brick:**
  - Rates, occupancy, and whether the whole estate can be booked.
  - The name lacks "Alta", against the naming rule; kept as the sheet has it.
  - 32 beds split as 8 rooms × 2 + 2 dorms × 8 (the 2-per-room pattern
    everywhere else), not confirmed.

## Photos

- **Cedar:** 30 photos from the `alta-cedar` Drive folder (owned by
  akramshafeek23, shared "Anyone with the link"). Since 3 Nov, Cedar is three
  room units plus the whole 3BHK (`cedar-units.txt`):
  - Bedroom 1 (`prop_207-room-1`, horse-rider painting, wardrobe wall): 4.
  - Bedroom 2 (`room-2`, red horse painting): 3.
  - Bedroom 3 (`room-3`, smaller, dark wardrobe): 3.
  - On the home: the living room, dining, kitchen, three bathrooms (8
    photos), hallway and utility, 20 in all.

  The cover is the wide living-room shot. `ESC07512` and
  `ESC07527` are near-duplicates of `DSC07512`/`DSC07527` and were skipped.
- **Harbour:** rewritten 3 Nov (`harbour-units.txt`, `harbour-photos.txt`).
  Both "Downtown jp nagar" folders are the same building:
  - `prop_204-room-1`: 2BHK Bedroom 1 (blue sofa), 2 replicas.
  - `prop_204-room-2`: 2BHK Bedroom 2 (grey bed, desk), 2 replicas.
    Both rooms: one per 2BHK flat, ₹35,000 / ₹1,900 per room, 0 of 2
    occupied.
  - `prop_204-room-3`: the 1BHK (from `Reduced Size/Downtown jp nagar 1bhk`),
    with AC, a desk and a bathroom with a bathtub, ₹65,000 / ₹3,700.
  - No whole-property unit (`allowsEntireBooking` FALSE).

  45 photos:
  - 1BHK: 20.
  - 2BHK bedrooms: 5 and 6.
  - The 2BHK's shared living room, kitchen, bathroom and details: 14, on the
    home.
  - Cover section: the 2BHK living room (cover), the 1BHK bedroom, the 1BHK
    sitting room, 2BHK Bedroom 2.
- **Wren:** now two 1BHK units, not one replica (`wren-units.txt`):
  - Wren 1 (`prop_205-room-1`, taken as flat 41 G1, booked)
  - Wren 2 (`prop_205-room-2`, 41 G2, available)

  36 photos from the local `Reduced Size/Alta Wren 1` and `Alta Wren 2`
  folders, kept as AVIF:
  - Wren 1: 19 photos. Wren 2: 7. The building, terrace and neighbourhood:
    10, on the home.
  - 9 photos appear in both folders. They are kept once, and the bedroom ones
    go to Wren 1, whose dark headboard and wardrobe they show.
  - `Alta Wren 1/kitchen 2.avif` and `kitchen 6.avif` are HTML pages, not
    images, and were skipped.
  - The cover section mixes both flats: Wren 2's living room (cover), Wren 1's
    bedroom, Wren 2's kitchen, the building front.
- **Lantern:** one unit, "Lantern 1BHK" (`prop_203-room-1`), 9 copies with 8
  occupied, so 1 free (`lantern-units.txt`). It now has `bedType: double` and
  `bathroom: ensuite`. 20 photos from `Reduced Size/Alta Lantern`, all on the
  unit: living room 4, bedroom 5, kitchen 6, bathroom 2, washing-machine nook
  3. The cover is the green-sofa living room. `DSC02540` and `DSC02546` were
  left out because they feature wine glasses and Lantern's rules say no
  alcohol.
- **Juniper:** "Juniper Bedroom" (`prop_206-room-1`, 3 copies, all occupied,
  rates unknown), plus the whole flat, "Juniper 3BHK" (`prop_206-entire`,
  ₹1,10,000 / ₹8,000, booked), in `juniper-units.txt`. 20 photos from
  `Reduced Size/Alta Juniper`, which are WhatsApp exports at 960–1600 px:
  - The bedroom unit: 3, one per bedroom, all alike.
  - On the home: living 7, dining 2, kitchen 4, bathrooms 3, washing machine
    1.
  - Cover section: the living room (cover), a bedroom, the kitchen, the
    dining area.
- **Skyline:** one whole-flat unit, "Skyline 1BHK" (`prop_208-entire`,
  ₹65,000 / ₹3,200, booked, AC and balcony), in `skyline-units.txt`. 33
  photos from `Reduced Size/Alta skyline`, all on that unit, ordered room by
  room:
  - Living 6, bedroom 9, kitchen 9, wash-basin nook 2, bathroom 4, balcony 3.
  - Cover section: the living room (cover), the bedroom, the kitchen, the
    balcony view.
- **Linden:** a 1BHK unit per floor (`linden-units.txt`), each ₹35,000 /
  ₹1,900, no AC, with a balcony:
  - 1st floor (`prop_202-room-1`): 2 copies, both occupied.
  - 2nd floor (`room-2`): 2 copies, 1 free.
  - 3rd floor (`room-3`): 3 copies, 1 free.
  - The studio, unchanged, moved to `room-4`.

  37 photos from `Reduced Size/SR101`, `SR201` and `SR302`, one sample flat
  per floor:
  - 1st floor 9, 2nd floor 8, 3rd floor 13. On the home: 4 kitchen and 3
    bathroom shots that appeared in two floors' folders, shown once.
  - `SR201/hall 1.avif` is really a JPEG, so it is saved as `.jpg`.
  - `SR201` kitchen 5 and 6 were left out because they feature wine glasses.
  - Cover section: 3rd-floor living room (cover), 2nd-floor living room,
    1st-floor bedroom, 3rd-floor sunset view.
- **Red Brick:** "Red Brick room" (`prop_209-room-1`): 8 copies, 4 occupied,
  so 4 free. The dorm (`room-2`) is unchanged. Both are in
  `red-brick-units.txt`, and both still have no rates. 9 photos from
  `Reduced Size/Red bricks` (WhatsApp exports):
  - On the room unit: 6 (rooms, bathroom, details).
  - On the home: 3 (garden ×2, veranda).
  - Cover: the garden.
  - `11.11.39 AM` was left out as a near-identical frame of `11.11.39 AM (1)`.
- **Meridian:** not shot yet. The owner says its furnishing is the same as
  Linden's, so it is seeded with 14 of Linden's photos:
  - Copied to `public/homes/meridian/` and captioned "(representative)".
  - A different subset, order and cover from Linden's own. Linden's sunset
    view is excluded.
  - All on the "Meridian 2BHK" unit.
  - When Meridian is shot, replace the files and the 14 `prop_201` rows
    (`meridian-photos.txt`).

**Hosting:** the photos are served by the site itself, from
`public/homes/<slug>/NN-<caption>.jpg` (originals from Drive, 1280 px on the
long edge, about 2 MB per home). `NN` is the photo id's number. The whole
photos tab is in `photos-table.txt`: a header plus every row, tab-separated,
for pasting over the tab. `prop_207-cedar.json` points at the same files.

Drive folders are read through the Google Drive connector signed in as
akramshafeek70, a viewer on the parent "alta living pictures" folder. Drive
links still work in the url column if ever needed; the site rewrites them to
`lh3.googleusercontent.com/d/<id>=w2000`.

The site-wide figures on the live site ("1,100+ guests · 4.9★ · 30+
properties · 5+ years") are the real numbers for the placeholders in
`src/content/site.ts`, once confirmed current.

## Regenerating

These were generated by a script rather than typed, so the mapping is applied
the same way everywhere. The script isn't kept; this README is its spec. If the
source sheets change, regenerate all nine from it rather than hand-editing
them one by one.
