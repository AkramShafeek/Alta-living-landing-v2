# Reading and writing TypeScript types

A guide to the type machinery in `src/db` and `src/repositories`, built up from
the bottom. Every example is either a three-line toy or actual code from this
repo — nothing invented for the sake of a tutorial.

If you only read one section, read Part 1.

---

## Part 0: there are two languages in the file

This is the single idea that makes the rest click.

TypeScript is two languages sharing one file. One runs, one doesn't.

```ts
const tables = { properties: { gid: "" } }   // value world — exists at runtime
type TableName = "properties" | "units"      // type world — erased at build
```

The **value world** is JavaScript: things that exist when the browser runs your
code. The **type world** is a separate language that runs *at compile time*,
inside `tsc`, and then vanishes. Nothing in the type world exists in the bundle.

Each world has its own operators, and they look confusingly similar:

| Value world (runtime) | Type world (compile time) |
|---|---|
| `tables["properties"]` — index an object | `Foo["properties"]` — index a type |
| `x => x.id` — a function | `T extends U ? X : Y` — a conditional |
| `Object.keys(tables)` — get keys | `keyof typeof tables` — get keys |
| `a && b` | `A & B` |
| `a \|\| b` | `A \| B` |

Most confusion comes from reading a type-world expression as if it were value
world. `RowOf<"units">` is not a function call. It is a *type-level* function
call, evaluated by the compiler, which produces a type and then disappears.

**The bridge between the worlds is `typeof`.** In the type world, `typeof x`
means "the type of the value `x`". It is the only way to go from a value you
wrote to a type you can compute with.

```ts
const tables = { properties: {}, units: {} }  // a value
type Tables = typeof tables                    // now a type
```

> Careful: `typeof` in the value world (`typeof x === "string"`) is JavaScript's
> runtime operator and is unrelated. Same word, different language.

---

## Part 1: how to read a type out loud

Types are easier when you have words for the symbols. Read left to right, and
say the words.

| Syntax | Say it as | Means |
|---|---|---|
| `T[]` | "array of T" | `Property[]` — many properties |
| `keyof T` | "the keys of T" | union of T's property names |
| `T[K]` | "T at K" | the type of that property |
| `typeof x` | "the type of the value x" | bridge from value to type |
| `A \| B` | "A **or** B" | either one |
| `A & B` | "A **and** B" | both at once |
| `T extends U` | "T **is assignable to** U" | *not* class inheritance |
| `<T>` | "for any T" | a type parameter — a blank to fill in |
| `<T extends U>` | "for any T that fits U" | a constrained blank |
| `A extends B ? X : Y` | "if A fits B, then X, else Y" | a type-level `if` |
| `as const` | "exactly this, literally" | stop widening |

The one that trips everyone: **`extends` does not mean inheritance.** In the
type world it asks a yes/no question — *is the left type assignable to the
right?* Read it as "fits into". `"room" extends string` is true.
`{ id: string, name: string } extends { id: string }` is true, because an object
with more fields fits where fewer are required.

### Worked example

```ts
findBy<K extends keyof T>(field: K, value: T[K]): Promise<T[]>
```

Out loud: *"for any K that is one of T's key names, take a `field` of that key
name and a `value` of whatever type T has at that key, and return a promise of
an array of T."*

That's the whole signature. Each piece was in the table above.

---

## Part 2: the operators, one at a time

### `keyof` — get the key names as a union

```ts
type Unit = { id: string; kind: "room" | "entire"; monthlyRate: number }

type UnitKey = keyof Unit
// "id" | "kind" | "monthlyRate"
```

`keyof` gives you a **union of string literal types** — not an array, not a
value. You cannot `.map()` it. It exists only to be used in other types.

### `T[K]` — indexed access, "T at K"

```ts
type Rate   = Unit["monthlyRate"]   // number
type Kind   = Unit["kind"]          // "room" | "entire"
type Either = Unit["id" | "kind"]   // string | "room" | "entire"
```

It looks like indexing an object, and that's the right intuition — but it
returns the *type* stored at that key, not a value.

Together, `keyof` and `T[K]` are what make `findBy` safe:

```ts
findBy<K extends keyof T>(field: K, value: T[K]): Promise<T[]>
```

When you call `unitRepository.findBy("kind", "entire")`, TypeScript infers
`K = "kind"`, then computes `T[K]` = `Unit["kind"]` = `"room" | "entire"`, and
checks your second argument against *that*. This is why

```ts
unitRepository.findBy("kind", "bedroom")
// Error: '"bedroom"' is not assignable to '"room" | "entire"'
```

fails. The value's allowed type is **derived from the key you passed**. Two
arguments, linked. That linkage is the entire point of the generic.

### `typeof` + `keyof` — the registry trick

Here is `src/db/config.ts`:

```ts
export const tables = {
  properties: { gid: "", schema: zProperty },
  units:      { gid: "", schema: zUnit },
  // …eight more
} as const satisfies Record<string, TableDef>

export type TableName = keyof typeof tables
```

Read `keyof typeof tables` **right to left**:

1. `tables` — a value.
2. `typeof tables` — its type: an object with ten keys.
3. `keyof (that)` — the ten key names as a union.

Result: `TableName = "properties" | "units" | "photos" | …`

This is why adding a table is one line. You wrote the value; the type of the
value is computed from it; the list of names is computed from that. There is no
second list to keep in sync — the same drift problem we avoided with the
coercers in `src/db/parse.ts`.

### `as const` — stop the compiler from being helpful

By default TypeScript **widens** literals, because most values are meant to
change:

```ts
let a = "room"           // widened to: string
const b = "room"         // stays: "room"

const obj = { kind: "room" }
// inferred as { kind: string }  ← widened! the property could be reassigned
```

That widening would destroy the registry. If `tables` were inferred as
`{ properties: { gid: string, schema: ZodObject }, … }`, then `keyof` would still
work, but `tables["properties"]["schema"]` would be the *generic* `ZodObject` —
and `z.infer` of a generic `ZodObject` is useless. You would get back `{}`
instead of `Property`.

`as const` says "infer everything as narrowly as possible, and make it
readonly":

```ts
const obj = { kind: "room" } as const
// { readonly kind: "room" }
```

Now `tables.properties.schema` has the precise type
`ZodObject<{ id: ZodString, slug: ZodString, … }>`, and `z.infer` can extract the
real model from it.

### `satisfies` — check without widening

`as const satisfies Record<string, TableDef>` is two parts doing two jobs.

The problem `satisfies` solves: if you write

```ts
const tables: Record<string, TableDef> = { properties: { … } }   // annotation
```

…then `tables` **is** a `Record<string, TableDef>`, and the specific information
is gone. `keyof typeof tables` becomes `string`. Every table name would be
accepted, including typos.

But with no annotation at all, nothing checks that each entry is a valid
`TableDef` — you could typo `shcema:` and find out at runtime.

`satisfies` gives you both: **verify against the constraint, keep the narrow
inferred type.**

```ts
as const satisfies Record<string, TableDef>
//   ↑ keep it literal      ↑ but still prove each entry is a valid TableDef
```

Rule of thumb: use `:` when you want the variable to *be* that type; use
`satisfies` when you want to *prove* it fits but keep the details.

### Generics — a type parameter is a blank to fill in

A generic is a function in the type world. `<K>` declares a parameter:

```ts
export type RowOf<K extends TableName> = z.infer<(typeof tables)[K]["schema"]>
```

Read it as: *"`RowOf` takes one argument K, which must be one of the table
names, and produces…"*. Then evaluate the body right to left:

| Step | Expression | With `K = "units"` |
|---|---|---|
| 1 | `typeof tables` | the registry's type |
| 2 | `(…)[K]` | `{ readonly gid: ""; readonly schema: ZodObject<…> }` |
| 3 | `(…)["schema"]` | `ZodObject<{ id: ZodString, kind: ZodEnum<…>, … }>` |
| 4 | `z.infer<…>` | `{ id: string; kind: "room" \| "entire"; … }` |

So `RowOf<"units">` **is** the `Unit` model. Not a copy of it, not a parallel
declaration — the same type, computed from the Zod schema you already wrote.

That is the payoff of the whole registry design. One value (`tables`), and from
it: the list of legal table names, and the row type of each table.

The `extends TableName` part is a **constraint**. It does two things: rejects
`RowOf<"nope">` at compile time, and tells the compiler that inside the body,
`K` is safe to use as a key of `tables`.

### `z.infer` — schema to type

Zod schemas are values that exist at runtime (they have to — they do the
validating). `z.infer` is the bridge back:

```ts
const zUnit = z.object({ id: z.string(), monthlyRate: z.number() })   // value
type Unit = z.infer<typeof zUnit>                                     // type
// { id: string; monthlyRate: number }
```

Note the `typeof` — `zUnit` is a value, so you need the bridge before you can
feed it to a type-level function.

This is why our models declare the schema and derive the type, never the other
way round. A hand-written `type Unit = { … }` next to a `zUnit` would be two
declarations free to disagree.

### Conditional types — a type-level `if`

```ts
A extends B ? X : Y
```

*"If A is assignable to B, the answer is X, otherwise Y."*

```ts
type IsString<T> = T extends string ? "yes" : "no"

type A = IsString<"room">    // "yes"
type B = IsString<number>    // "no"
```

Here is ours, from `src/repositories/types.ts`:

```ts
[T] extends [{ id: string }] ? IdentifiedRepository<T> : unknown
```

*"If T has an `id: string` field, contribute the `findById` family; otherwise
contribute nothing."*

`Property` has `id: string`, so it gets `findById`. `PropertyAmenity` is
`{ propertyId, amenityKey }` — no `id` — so it gets `unknown`.

### Why `unknown` is the "nothing" branch

The three parts are joined with `&`:

```ts
export type Repository<T> = ReadRepository<T> &
  ([T] extends [{ id: string }]         ? IdentifiedRepository<T>     : unknown) &
  ([T] extends [{ propertyId: string }] ? PropertyScopedRepository<T> : unknown)
```

`&` is intersection — "has all of both". And `X & unknown` simplifies to just
`X`, because `unknown` adds no requirements. So `unknown` is the identity
element for `&`: the branch that contributes nothing.

Do not use `never` for this. `X & never` is `never` — it would annihilate the
whole type rather than leave it alone.

Worked out per table:

| T | has `id`? | has `propertyId`? | Resulting `Repository<T>` |
|---|---|---|---|
| `Property` | yes | no | Read + Identified |
| `Unit` | yes | yes | Read + Identified + PropertyScoped |
| `PropertyAmenity` | no | yes | Read + PropertyScoped |

Which is why `propertyRepository.findByPropertyId(...)` is a compile error — the
`Property` row has no `propertyId` column, so that method was never added to its
type. The type is not documenting the rule; it *is* the rule.

### The `[T] extends [U]` brackets — preventing distribution

This is the most obscure line in the codebase, so here it is in full.

When a **naked** type parameter appears on the left of `extends`, conditional
types *distribute* over unions — they apply to each member separately and union
the results:

```ts
type Wrap<T> = T extends string ? "str" : "other"

type R = Wrap<string | number>
// NOT evaluated as one question.
// Evaluated as: Wrap<string> | Wrap<number>  →  "str" | "other"
```

Usually helpful. Here, harmful: if `T` were ever a union of two row types, the
conditional would ask the question of each one and union the answers, producing
a repository type with `findById` on one arm and not the other — unusable.

Wrapping both sides in a one-element tuple makes the left side no longer naked,
which switches distribution off:

```ts
[T] extends [{ id: string }] ? … : …
// asks the question once, about T as a whole
```

The tuples are load-bearing punctuation. They mean nothing at runtime and are
never constructed — they exist purely to change how the compiler evaluates the
line.

### `NonNullable<T>` — a built-in helper

```ts
groupBy<K extends keyof T>(field: K): Promise<Map<NonNullable<T[K]>, T[]>>
```

`NonNullable<T>` strips `null` and `undefined` from a union. It is defined in
TypeScript's standard library as — you guessed it — a conditional type.

We need it because `Photo["unitId"]` is `string | undefined` (the column is
optional). But `groupBy` *skips* rows whose key is unset, so `undefined` can
never be a key in the returned map. `NonNullable` makes the type say that:
`Map<string, Photo[]>`, not `Map<string | undefined, Photo[]>`. The caller does
not have to handle a case we already excluded.

### Type predicates — `row is RowOf<K>`

From `findByIds`:

```ts
return ids
  .map((id) => byId.get(id))                            // (RowOf<K> | undefined)[]
  .filter((row): row is RowOf<K> => row !== undefined)  // RowOf<K>[]
```

A normal `.filter()` returns the same element type it was given — TypeScript
cannot tell that your callback removed the `undefined`s. The `row is RowOf<K>`
return annotation is a **type predicate**: it tells the compiler "if this
function returns true, the argument is a `RowOf<K>`."

It is a promise you are making, not one the compiler verifies. Get the condition
wrong and the type is a lie. Keep the body trivially obvious.

### `as unknown as X` — the double cast

The one genuinely unsafe line in the repo, in `createInMemoryRepository`:

```ts
return new InMemoryRepository(tableName, db) as unknown as Repository<RowOf<K>>
```

`as` is an assertion: "trust me, treat this as X." TypeScript refuses a direct
`as` between types it considers unrelated, and going through `unknown` first
defeats that check — `unknown` is assignable from everything, and you can assert
it to anything.

Why it is needed: the class implements *all* the methods unconditionally,
because a class cannot conditionally declare members. `Repository<T>` exposes a
subset depending on T. The compiler cannot verify the class satisfies a type
whose shape depends on a type parameter, so we assert it.

Why it is acceptable here: the class is a strict superset — it has every method
any `Repository<T>` could ask for. The assertion narrows, never invents.

Why it still has a cost: if you add a method to the interface and forget it on
the class, **this cast will hide it** and you will find out at runtime. That is
why it is confined to one line in one factory function rather than sprinkled
around.

---

## Part 3: three full walkthroughs

### 1. `RowOf<K>` — from one value to ten row types

```ts
export type RowOf<K extends TableName> = z.infer<(typeof tables)[K]["schema"]>
```

Call it with `RowOf<"housekeeping">`:

```
tables                            the value in config.ts
typeof tables                     { readonly properties: {…}, readonly housekeeping: {…}, … }
(typeof tables)["housekeeping"]   { readonly gid: ""; readonly schema: ZodObject<…> }
(…)["schema"]                     ZodObject<{ propertyId: ZodString, cover: ZodString, frequency: ZodEnum<…> }>
z.infer<…>                        { propertyId: string; cover: string; frequency: "daily" | "weekly" | … }
```

Every arrow is one of the operators from Part 2. Nothing else is happening.

### 2. `findBy` — linking two arguments

```ts
findBy<F extends keyof RowOf<K>>(field: F, value: RowOf<K>[F]): Promise<RowOf<K>[]>
```

Two generics are in play. `K` comes from the class
(`InMemoryRepository<K extends TableName>`) and is fixed when you build the
repository. `F` is inferred fresh at each call site.

Calling `unitRepository.findBy("kind", "entire")`:

1. `K` is already `"units"`, so `RowOf<K>` is the `Unit` model.
2. From the first argument, infer `F = "kind"`. Check: is `"kind"` in
   `keyof Unit`? Yes.
3. Compute the second parameter's type: `Unit["kind"]` = `"room" | "entire"`.
4. Check `"entire"` against it. Passes.
5. Return type: `Promise<Unit[]>`.

Step 3 is the interesting one — the second parameter's type was never written
down anywhere. It was *computed from the first argument*.

### 3. `Repository<T>` — the conditional method set

```ts
export type Repository<T> = ReadRepository<T> &
  ([T] extends [{ id: string }]         ? IdentifiedRepository<T>     : unknown) &
  ([T] extends [{ propertyId: string }] ? PropertyScopedRepository<T> : unknown)
```

Evaluate `Repository<PropertyAmenity>`, where the model is
`{ propertyId: string; amenityKey: AmenityKey }`:

```
ReadRepository<PropertyAmenity>                              always included
& ([PropertyAmenity] extends [{id: string}] ? … : unknown)   no id field → unknown
& ([PropertyAmenity] extends [{propertyId: string}] ? … )    has it      → PropertyScopedRepository
```

Intersect: `ReadRepository<…> & unknown & PropertyScopedRepository<…>`
→ `ReadRepository<…> & PropertyScopedRepository<…>`.

So `amenityRepository` has `findAll`, `findBy`, `findOneBy`, `findWhere`,
`groupBy`, `count`, `findByPropertyId` and `findByPropertyIds` — and no
`findById`. Hover it in your editor and you will see exactly that list.

---

## Part 4: how to work with types day to day

### Hover is the debugger

There is no `console.log` for types. The equivalent is **hover in the editor**.
Assign an intermediate type and hover its name:

```ts
type Debug = RowOf<"units">        // hover `Debug` to see the expanded model
type Keys  = keyof RowOf<"units">  // hover to see every column name
```

When a type is too big to display, narrow it: hover `RowOf<"units">["kind"]`
rather than the whole model.

### Force a compile error to see what is expected

A quick way to see a type the editor will not expand — assign it to something
wrong and read the error:

```ts
const x: number = someValue   // the error tells you what someValue actually is
```

Delete it afterwards.

### Write a probe file for type-level assertions

To check that something is *rejected*, write a scratch file, run
`npx tsc --noEmit`, read the errors, then delete it. That is how the conditional
method set in `Repository<T>` was verified — a file calling
`propertyRepository.findByPropertyId(...)`, confirming the error appeared, then
removed.

### Read right to left, and name the steps

For anything dense, break it into named intermediates until it is obvious:

```ts
type Entry  = (typeof tables)["units"]
type Schema = Entry["schema"]
type Unit   = z.infer<Schema>
```

Those three lines are `RowOf<"units">`, spelled out.

### When to stop

Complex types earn their keep when they prevent a real mistake — `findBy`'s
key/value linkage and `Repository`'s conditional methods both do. A type that
takes longer to understand than the bug it prevents is not worth it. If you
cannot read it back a week later, a simpler type plus a test is the better
trade.

---

## Cheat sheet

```ts
typeof value                    // value → type (the bridge)
keyof T                         // key names as a union
T[K]                            // the type at key K
T[keyof T]                      // union of all value types
A | B                           // or          A & B      // and
X & unknown === X               // unknown is the "nothing" branch
X & never   === never           // never annihilates — do not use it for that
T extends U ? X : Y             // type-level if ("is T assignable to U?")
[T] extends [U] ? X : Y         // same, but do not distribute over unions
<T extends U>                   // a constrained type parameter
as const                        // infer literally, readonly
satisfies U                     // check against U, keep the narrow type
NonNullable<T>                  // strip null | undefined
x is T                          // type predicate, for .filter()
as unknown as T                 // unchecked assertion — last resort
```

### Where each one lives in this repo

| Construct | File |
|---|---|
| `as const satisfies` | `src/db/config.ts` |
| `keyof typeof` | `src/db/config.ts` — `TableName` |
| Indexed access chain + `z.infer` | `src/db/config.ts` — `RowOf` |
| Generic constrained by a schema | `src/db/parse.ts` — `parseTable<T extends z.ZodObject>` |
| `keyof T` / `T[K]` linkage | `src/repositories/types.ts` — `findBy` |
| Conditional types, `[T] extends [U]`, `& unknown` | `src/repositories/types.ts` — `Repository<T>` |
| `NonNullable<T[K]>` | `src/repositories/types.ts` — `groupBy` |
| Type predicate | `src/repositories/InMemoryRepository.ts` — `findByIds` |
| `as unknown as` | `src/repositories/InMemoryRepository.ts` — `createInMemoryRepository` |
