The hero's signature layer — handwritten notes pinned across the viewport, joined by red string.

```jsx
<div style={{position:'relative', height:600}}>
  <Pinboard
    notes={[{id:'a',x:10,y:20,rotate:-6,text:'Indiranagar\n2BHK — too small'},{id:'b',x:26,y:44,rotate:4,text:'Koramangala\n★ good light'}]}
    connections={[['a','b']]} />
</div>
```

Notes stagger 250ms apart; strings begin only after the last note lands.
