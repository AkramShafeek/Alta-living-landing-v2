Wraps every content band below the hero ("Top Picks", "What people love about us").

```jsx
<ArchPanel title="Top Picks" action={<Button variant="link" iconEnd="arrow-right">Explore all</Button>}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32}}>…</div>
</ArchPanel>
```

Only the top corners round. Never round the bottom.
