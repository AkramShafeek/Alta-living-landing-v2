# Data layer review

**Scope:** `src/db`, `src/models`, `src/repositories`, `src/service`, `src/store`,
and the Google Sheets migration wired in on top of them.
**Date:** 17 September 2026

**Reviewer note:** this reviews the layer as it now stands — with `properties`
reading from a live published sheet — not as it stood when every table was a
fixture. Several judgements below were correct for fixtures and change weight
once ops can edit production data from a spreadsheet.

> **Status, 17 September 2026.** Findings 1, 2, 3, 4 and 6 are fixed; see
> "Resolved" at the foot of this document for what changed and what it left
> open. Finding 5 and the table in finding 7 are still outstanding. The findings
> below are kept as written, because the reasoning is the part worth keeping.

---

## Verdict

The architecture is sound and unusually well-reasoned. Layer boundaries are real
rather than nominal: coercion happens in exactly one place, validation in exactly
one place, joining in exactly one place, formatting in exactly one place. The
comments explain _why_ rather than restating the code, and several of them
pre-empt the exact objection a reviewer would raise. That is rare and worth
keeping.

The problems are not architectural. They are **unfinished edges** — three
contracts that documentation promises and code does not keep, one relation that
was cut and never reconnected, and one failure mode that the sheets migration
made materially more likely than it used to be.

Nothing here blocks the current build. Items 1–3 should land before a second
property is added to the sheet.

---

## Findings

### 1. One bad cell takes down the whole catalog — `src/db/parse.ts:125`

`parseTable` throws on the first row that fails validation, so a single
malformed cell fails the entire table. Every table flows through `assemble()`,
so a bad `units` row fails the property page _and_ the listings page.

The comment defends this, and the reasoning is good:

> A catalog we cannot trust is worse than no catalog: a silently dropped unit
> renders as a home with one fewer bedroom, at a price that no longer matches
> what is there.

That argument is about **wrong data**. It is not the same argument as
**unavailable data**, and the sheets migration is what separated them. With
fixtures, an invalid row could only appear via a code change — caught in review
and in CI. Now it appears when someone types `Mumbai` into `city`, an enum of
three values (`src/models/common.ts:4`), or leaves `wifiDownMbps` blank on a new
row. The blast radius of an ops typo is the entire site, five minutes after the
edit, with no deploy and no reviewer in the path.

Note the asymmetry this creates: an extra _column_ is dropped safely (`coerceRow`
walks the schema's keys), but an extra _enum value_ is fatal.

**Recommendation.** Keep fail-fast where a missing row corrupts meaning — `units`
is the real case, since a dropped unit genuinely does misprice a home. For
`properties`, quarantine instead: drop the offending row, keep the rest, surface
the failure somewhere a human sees it. One property missing from the listing is a
smaller incident than every property missing.

A cheaper middle option for now: validate the published CSV on a schedule or in
CI, so ops hears about a bad cell before a visitor does.

---

### 2. `force: true` does not refetch — `src/db/db.ts:47`, `src/pages/Listings.tsx:200`

`db.getTable` caches the parsed promise for the process lifetime. `invalidate()`
exists (`src/db/db.ts:122`) but **has no caller anywhere in `src/`**. So the
store's `force` option, and the "Retry" button wired to it, re-run the service
against the same cached rows and return the same data.

Precisely:

- **Retry after a failed load works.** A rejected promise deletes its own cache
  entry, so the next call goes back to the network.
- **Refresh after a successful load does not.** There is no path from the UI to
  fresh sheet data short of a page reload.

This was invisible while everything was a fixture — refetching a static import
returns the same rows by definition, so `force` was correctly a no-op. It stops
being correct the moment the rows can change underneath us, which is now.

**Fix.** Have the store's `force` path call `db.invalidate()` before asking the
service. Worth also deciding whether `getTable` should carry a TTL of its own:
Google already edge-caches the CSV for five minutes, so anything shorter is
wasted work, and anything much longer means a correction ops made this morning is
still not showing at lunch.

---

### 3. Draft and archived properties render — no filter anywhere

`PROPERTY_STATUSES` is `draft | live | paused | archived`
(`src/models/common.ts:3`) and `zProperty.status` enforces it. Nothing filters on
it: `getAllProperties` (`src/service/propertyService.ts:58`) returns every row,
and no page narrows the list.

With fixtures this was theoretical — the one fixture is `live`. On a live sheet
it is a matter of time: `status` is exactly the column ops will reach for to take
a home off the site, and it will silently do nothing. The failure publishes a
home that was meant to be hidden, which is the worse direction for this to fail
in.

**Fix.** Filter to `live` in the service, and give the service an explicit way to
ask for the others (an ops preview, later). Doing it in the service rather than
per page means the listing and the detail page cannot disagree — the same reason
`assemble()` is a single funnel.

Decide alongside this what a direct link to a non-live property should do. A 404
is probably right; silently rendering it defeats the filter.

---

### 4. The host relation is severed — `src/models/Property.ts:114`

`hostId` is commented out of the model. Meanwhile:

- `src/data/mock/properties.json` carries `hostId: "host_meera"`
- `src/data/mock/hosts.json` exists, fully populated
- the published sheet has a `hostId` column, which `coerceRow` silently drops
- there is no `Host` model, no `hosts` entry in the registry, no repository
- `src/content/schema.ts:260` — the _old_ schema — still declares it

The data is present at both ends and the link is absent in the middle. The
"responds within an hour, six minutes away" host block is a trust element the
product leans on, and it currently cannot be rendered from the catalog.

**Fix.** Either finish it — `Host` model, registry entry, repository, `withHost()`
on the builder — or delete `hosts.json` and the commented line so the next reader
is not misled about what exists. A commented-out field is the most expensive of
the three states.

**Do not publish the hosts tab** if you finish it: it holds `phone` and
`whatsapp`, and publish-to-web is world-readable. Keep it a fixture, or put it
behind something authenticated.

---

### 5. Two documented contracts that no code keeps

**`MAX_HIGHLIGHTS_PER_PROPERTY`** (`src/models/Highlight.ts:25`). The doc says
"the service layer enforces it when it groups highlights by `propertyId`". The
service does not; `PropertyBuilder.build()` sorts and passes through. The
constant has no readers. A fourth highlight row renders a fourth highlight.

**`findByPropertyIds`** (`src/repositories/types.ts:57`). Built specifically to
avoid the N+1 that `assemble()` performs, documented as "the grouped form, for
joining many properties without an N+1" — and `assemble()` calls the _ungrouped_
`findByPropertyId`, once per property per table. `getAllProperties` is therefore
O(properties × child tables) array scans.

The performance cost is nil today and the comment at
`src/service/propertyService.ts:50` honestly says so. The issue is not speed. It
is that the codebase contains a well-tested API whose only purpose is unused,
sitting next to a comment that points at it — a reader cannot tell which of the
two paths is intended. Either route `getAllProperties` through it, or drop it and
the comment.

---

### 6. Sheets fetch has no timeout — `src/db/sheets.ts:58`

`fetch(url)` with no `AbortSignal`. A hung connection leaves the store in
`loading` indefinitely: there is no spinner timeout and no retry path, so the
page never resolves. The status, HTML and empty-tab guards around it are good;
this is the one failure mode they miss, and the one that produces no error
message at all.

`AbortSignal.timeout(10_000)`, and a `DbError` on abort in the same shape as the
other guards.

---

### 7. Smaller things

| Where                                 | Issue                                                                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/pricing.ts:13`               | Imports `Unit` from `@/content/schema`, not `@/models/Rooms`. Two live definitions of the same concept, and the pricing engine is typed against the legacy one.                                                                                   |
| `src/pages/Home.tsx:15`               | Still renders hardcoded `properties` from `content/site.ts` while Listings and Property read the store. Expected mid-migration, but it means the home page will not reflect a sheet edit.                                                         |
| `src/models/Photo.ts:1`, `Rooms.ts:1` | Single quotes and semicolons, against the repo's style. Prettier has only been run over `src/db`. Run it repo-wide once and be done.                                                                                                              |
| `src/db/config.ts:130`                | `sourceReport()` has no callers. Either log it at startup — genuinely useful once tables are on mixed sources — or remove it.                                                                                                                     |
| `src/db/config.ts:70`                 | Nothing enforces "only one table may have an empty gid"; it is a comment. A second `sheets` table with a blank gid silently reads `properties` and fails validation with a confusing message. A one-line assertion would make that a clear error. |
| `src/models/Rooms.ts`                 | `monthlyRate`/`nightlyRate` are `nonnegative()`, so `0` validates and renders as "₹ 0". If a blank rate means "ask us", that wants to be explicit rather than a zero.                                                                             |

---

## Design observations

**The layering is the strongest thing here.** `Row` (all strings) → coerce →
validate → repository → join → store → selectors, each boundary crossed exactly
once. The sheets migration proved it: the driver swap touched one function, and
`parse`, `repositories`, `service` and `store` were untouched and needed no
re-testing. That is the payoff the design was built for, and it paid.

**Per-table sources were the right call.** Migrating a tab at a time keeps each
switch small enough to reason about and reversible without a deploy. The
static write-out of the env reads (`src/db/config.ts:100`) is doing real work —
the dynamic version fails only in production, the worst available failure shape.

**Conditional repository types are elegant and worth the cast.** Granting
`findById` only to tables with an `id` column turns a class of runtime nonsense
into compile errors. The single `as unknown as` in `createInMemoryRepository` is
a fair price and is honestly labelled.

**The store's two-axis "loaded" model is right**, and the comment explaining why
`status` answers neither question is the kind of thing that stops a future bug.

**Where the design is now under-specified: who owns data quality.** The layer
assumes a row is either valid or fatal, which held when rows came from a reviewed
commit. Ops editing a live spreadsheet introduces a third state — _plausible but
wrong_ — and nothing currently sits between a typo and production. Findings 1, 2
and 3 are all versions of this one gap. Worth deciding deliberately rather than
resolving each case ad hoc:

- what happens to a row that fails validation
- who finds out, and how
- how quickly a correction reaches the site

---

## Suggested order

1. **Status filter (#3)** — smallest change, prevents publishing something meant to be hidden
2. **`invalidate()` on force (#2)** — makes corrections actually reachable
3. **Fetch timeout (#6)** — one line, removes a silent hang
4. **Row quarantine for `properties` (#1)** — the real design decision; make it awake
5. **Host relation (#4)** — finish it or delete it, but do not leave it commented
6. **Contracts (#5) and the table in #7** — cleanup, no urgency

---

## Resolved

**#1 Row quarantine.** `parseTable` now takes an `onBadRow` policy from the
table registry and returns `{ rows, skipped }`. `properties` is `"skip"`; every
other table keeps the original fail-fast behaviour, `units` most deliberately.
Dropped rows are logged and kept in `db.issues()`. That is a seam, not a
feature: **nothing surfaces quarantined rows to a human yet**, so a home can
still vanish from the listing with only a console error to say why. An ops
banner or a health check is the obvious next consumer.

**#2 `force` refetches.** `loadAllProperties({ force: true })` and
`loadProperty(slug, { force: true })` call `db.invalidate()` first. Google still
edge-caches the published CSV for about five minutes, so a correction made
moments ago can still come back stale — the fix removes our cache from the path,
not Google's.

**#3 Status filter.** `getAllProperties` returns only `status === "live"`, and
both single lookups throw `PropertyNotFoundError` for a non-live property, so a
direct link cannot bypass the listing filter. `PropertyQuery.includeNonLive`
opens it up for a future ops preview. One definition of "live", in the service,
so the listing and the detail page cannot disagree.

**#4 Host relation.** `Host` model, `hosts` table, `hostRepository`, and a
required `hostId` on `properties`. Joined onto `PropertyDetail` as
`host: Host | null` — nullable so a dangling key costs the host block rather
than the page. Nothing renders it yet, which is intended. `hosts` reads from the
fixture and has **no env switch**: it holds `phone` and `whatsapp`, and
publish-to-web is world-readable. `languages` uses the registry's `coerce`
override with `list`, the first column whose Zod type does not imply its
coercer.

**#6 Fetch timeout.** 10s `AbortSignal.timeout`, with a `DbError` naming the
timeout distinctly from a network failure.

### Also changed

**`displayOnHome`** added to `properties` — a boolean, defaulting to `false` so
a home is featured only when someone says so. Deliberately separate from
`status`: `status` says whether a home is public at all, `displayOnHome` says
whether it is promoted.

**Tests no longer read production.** `.env` is loaded by vitest as well as by
the dev server, so once `properties` pointed at the sheet the suite was asserting
against live data over the network. `.env.test` pins every table to its fixture.
Note it must list every per-table switch: Vite merges `.env.test` over `.env`
key by key, so setting only `VITE_DB_SOURCE` leaves the specific switches
standing.

### Open

- Finding 5 — `MAX_HIGHLIGHTS_PER_PROPERTY` and `findByPropertyIds` are still
  documented-but-unused.
- Finding 7 — the `pricing.ts` / `content/schema.ts` duplicate `Unit`, `Home.tsx`
  still on hardcoded content, repo-wide Prettier, unused `sourceReport()`, the
  unenforced one-empty-gid rule, and zero rates. Note the gid rule is now moot
  in practice: `properties` and `units` both carry real gids.
- **The sheet has no `displayOnHome` column yet**, so every property read from
  it defaults to `false`.
