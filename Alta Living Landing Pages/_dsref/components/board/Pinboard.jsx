import React from 'react';
import { StickyNote } from './StickyNote.jsx';

// Notes are placed in % of the container; connections draw rust strings between them.
export function Pinboard({ notes = [], connections = [], animate = true, children, style, ...rest }) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const byId = Object.fromEntries(notes.map(n => [n.id, n]));
  const notesDoneAt = 0.25 * (notes.length - 1) + 0.5;

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }} {...rest}>
      {size.width > 0 && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox={'0 0 ' + size.width + ' ' + size.height}>
          {connections.map(([a, b], i) => {
            const from = byId[a], to = byId[b]; if (!from || !to) return null;
            const fx = from.x / 100 * size.width, fy = from.y / 100 * size.height;
            const tx = to.x / 100 * size.width, ty = to.y / 100 * size.height;
            const mx = (fx + tx) / 2 + (i % 2 === 0 ? 24 : -24);
            const my = (fy + ty) / 2 + (i % 2 === 0 ? -18 : 18);
            const d = 'M ' + fx + ' ' + fy + ' Q ' + mx + ' ' + my + ' ' + tx + ' ' + ty;
            return (
              <path key={i} d={d} fill="none" stroke="var(--rust)" strokeWidth="1.2"
                style={animate ? {
                  strokeDasharray: 2000, strokeDashoffset: 2000,
                  animation: 'alta-draw 900ms cubic-bezier(0.4,0,0.2,1) forwards',
                  animationDelay: (notesDoneAt + i * 0.15) + 's',
                } : undefined} />
            );
          })}
        </svg>
      )}
      {notes.map((n, i) => (
        <div key={n.id} style={{
          position: 'absolute', left: n.x + '%', top: n.y + '%', transform: 'translate(-50%,-50%)',
          opacity: animate ? 0 : 1,
          animation: animate ? 'alta-note-land 500ms var(--ease-out) forwards' : undefined,
          animationDelay: animate ? (i * 0.25) + 's' : undefined,
        }}>
          <StickyNote rotate={n.rotate}>{n.text}</StickyNote>
        </div>
      ))}
      {children}
    </div>
  );
}
