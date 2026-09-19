# Sliding panels in React

**What this is:** how the enquiry cart moves from "what you picked" to "who is
asking" on a button press, and the general shape of the technique.

**Where the code is:** `src/components/cart/CartDialog.tsx`.

The pattern is small — a wide strip inside a narrow window, moved with one
`transform`. Almost everything worth writing down is the part around it: what
happens to focus, to height, to the keyboard, and to state when the thing you
are standing on disappears underneath you.

---

## The mechanism

Two elements. A **mask** that clips, and a **track** that moves.

```tsx
// mask — clips, and never moves
<div className="min-h-0 flex-1 overflow-hidden">
  {/* track — twice as wide as the mask, and the only thing that moves */}
  <div
    className={cn(
      "flex h-full w-[200%] transition-transform duration-400 ease-out",
      "motion-reduce:transition-none",
      step === "form" && "-translate-x-1/2"
    )}
  >
    <div className="w-1/2 overflow-y-auto" inert={step === "form"}>
      {/* panel one */}
    </div>
    <div className="w-1/2 overflow-y-auto" inert={step === "cart"}>
      {/* panel two */}
    </div>
  </div>
</div>
```

The arithmetic, since the percentages refer to two different things:

- the **track** is `200%` — twice the mask's width
- each **panel** is `w-1/2` — half the track, so exactly one mask wide
- `-translate-x-1/2` moves the track by half its own width, which is one mask

Generalising to _n_ panels: the track is `n × 100%`, each panel is `1/n` of it,
and panel _i_ is shown by translating `-(i / n) × 100%`. For three panels that is
`w-[300%]`, `w-1/3`, and `-translate-x-1/3` / `-translate-x-2/3`.

### Why `transform` and not `left` or `margin-left`

`transform` is one of the two properties (with `opacity`) a browser can animate
without touching layout or paint — it is handed to the compositor and moved
there. Animating `left` or `margin-left` re-runs layout on every frame for the
whole subtree, which on a panel holding a list of images is visibly rough.

The rule of thumb: if it can be expressed as a transform, express it as one.

### Why not just swap the panels

The obvious alternative is `{step === "cart" ? <Cart/> : <Form/>}`. It is less
code and it is wrong here for two reasons.

The mechanical one: you cannot animate between two things when one of them does
not exist. Motion needs both endpoints on screen at once.

The one that actually matters: a cut and a slide say different things. A cut
reads as _a different screen_. A slide reads as _the same thing, one step on_ —
which is true, because it is the same enquiry with a name attached. Reaching for
the slide is a claim about the relationship between the two panels, and if that
claim is false, don't make it. A modal that replaces its contents with something
unrelated should cut.

---

## The four things that bite

### 1. `min-h-0`, or the mask will not clip

The mask is a flex child (`flex-1` inside the dialog's column). A flex item's
default `min-height` is `auto`, which means **it refuses to shrink below its
content**. So `overflow-hidden` has nothing to clip against, the mask grows to
fit the track, and the dialog gets taller instead of the panel scrolling.

`min-h-0` releases that floor. This is the single most common reason a flexbox
scroll container "doesn't work", and it applies to `min-w-0` in a row the same
way — the truncating text in the cart line needs it for the same reason.

### 2. The off-screen panel is still in the DOM

This is the accessibility bug the pattern invites, and it is invisible in
testing unless you use the keyboard: the second panel is translated out of
sight, not removed, so **Tab walks straight into a form nobody can see**. Screen
readers likewise read straight through it.

`inert` is the fix, and as of React 19 it is a real boolean prop:

```tsx
<div className="w-1/2" inert={step === "form"}>
  …
</div>
```

`inert` removes a subtree from the tab order, from hit testing, and from the
accessibility tree, in one attribute. Before React 19 you had to pass `inert=""`
and fight the type definitions; on this project you don't.

`visibility: hidden` would also work but takes the element out of rendering, so
it cannot be animated from — which defeats the point. `aria-hidden` alone is not
enough: it hides from screen readers and leaves the element tabbable, which is
the worst of the three states.

### 3. Panels are different heights

Two panels of different heights inside one mask leaves a choice:

- **animate the height too** — expensive (it is a layout property, see above)
  and prone to jumping when content loads
- **let the container size to the tallest** — dead space under the short one
- **fix the container and scroll each panel** — what this dialog does

The dialog has `max-h-[min(44rem,calc(100dvh-2rem))]` and each panel carries its
own `overflow-y-auto`, so the frame is stable and each side scrolls on its own.
The header and footer sit _outside_ the mask and never move, which also means
the primary button keeps its position across the transition — the thing you are
about to press does not slide away from under the cursor.

### 4. Focus does not follow the slide

Moving pixels moves nothing about focus. After the track settles, focus is still
on the button that started it — which is now off-screen and `inert`.

```tsx
useEffect(() => {
  if (step === "form") nameRef.current?.focus()
}, [step])
```

Focus the first meaningful control of the panel you arrived at. Not the panel
container, not the back button.

---

## State: derive the step, don't sync it

The subtler half of this pattern is what happens when the reason for the second
panel disappears while you are standing on it. Here: the last room is removed
from the cart while the form is showing.

The reflex is an effect:

```tsx
// Don't.
useEffect(() => {
  if (items.length === 0) setStep("cart")
}, [items.length])
```

That renders the form once with nothing in it, _then_ corrects — one frame of a
form describing an empty cart, and a slide that starts a tick late. It also
trips `react-hooks/set-state-in-effect`, which is the linter noticing the same
thing.

Derive it instead:

```tsx
const [requestedStep, setRequestedStep] = useState<"cart" | "form">("cart")

// An empty cart has nothing to send, so the form is not reachable.
const step = items.length === 0 ? "cart" : requestedStep
```

`requestedStep` is what the visitor asked for; `step` is what they can actually
have. There is no window in which those disagree on screen, because the
constraint is applied during render rather than after it.

The same principle covers "reopening should start at the first panel". That is
an **event**, not a derivation, so it goes in the handler:

```tsx
const handleOpenChange = (next: boolean) => {
  if (!next) setRequestedStep("cart")
  onOpenChange(next)
}
```

The general rule: if a value can be computed from what you already have, compute
it. If it changes because something _happened_, set it where it happened. An
effect is for neither — it is for synchronising with something outside React.

---

## Motion

```
transition-transform duration-400 ease-out motion-reduce:transition-none
```

**Ease-out, not ease-in-out.** The panel should leave immediately and settle
gently. Ease-in makes an interface feel like it is deciding whether to obey.

**~300–400ms.** Under ~200ms the slide is not read as movement, just as a jump;
over ~500ms it is something to wait for. This one is 400ms because it travels a
full panel width.

**`motion-reduce:transition-none` is not optional.** `prefers-reduced-motion` is
set by people for whom large-area movement causes actual symptoms, and a
full-width slide is exactly the kind it means. Removing the transition leaves
the panel change instant and completely functional — which is the point: the
motion was always a nicety layered on a working state change.

---

## When to reach for this

**Good fit:** a linear sequence, two to four steps, where the later steps are a
continuation of the first and the whole thing fits in one frame. Checkout steps,
a filter panel drilling into a sub-filter, a settings pane opening a detail.

**Bad fit:**

- **More than about four panels.** The track gets wide, all of it stays mounted,
  and the arithmetic stops being obvious. Route or conditionally render instead.
- **Panels that are not a sequence.** If you can arrive at panel three without
  passing through two, horizontal position is lying about the structure. Use
  tabs — and note that tabs are the right answer for the _other_ half of this
  page: the property page's "More details" panel switches between alternatives,
  so it uses Radix `Tabs` with no sliding at all.
- **Anything heavy in an off-screen panel.** It is mounted the whole time. Video,
  a map, a large list — pay for that only when it is on screen.

---

## The whole thing, minimal

```tsx
function Steps({ index, children }: { index: number; children: ReactNode[] }) {
  const count = children.length

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-400 ease-out motion-reduce:transition-none"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${(index * 100) / count}%)`,
        }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="overflow-y-auto"
            style={{ width: `${100 / count}%` }}
            inert={i !== index}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Everything else in `CartDialog.tsx` — the derived step, the focus move, the
fixed header and footer — is the part that makes it behave. The slide itself is
these twenty lines.
