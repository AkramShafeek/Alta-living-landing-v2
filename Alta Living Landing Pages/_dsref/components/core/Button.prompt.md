The primary Alta control — use `variant="hard"` for anything the user is meant to click first.

```jsx
<Button variant="hard" size="lg" shape="pill">Browse Properties</Button>
<Button variant="hard" block iconEnd="arrow-right">View</Button>
<Button variant="link">Listings</Button>
```

Rules: square corners by default; `shape="pill"` only for the hero CTA and nav links. Hover inverts to ink; press moves the button 3px into its own shadow. Never soften the shadow with blur.
