import React from 'react';
import { Icon } from './Icon.jsx';

export function Accordion({ items = [], defaultOpen = -1, style, ...rest }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid var(--ink)', ...style }} {...rest}>
      {items.map((it, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--ink)' }}>
          <button type="button" onClick={() => setOpen(open === i ? -1 : i)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
              padding: '18px 4px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>
            {it.q}
            <Icon name={open === i ? 'minus' : 'plus'} size={18} />
          </button>
          {open === i ? (
            <p style={{ margin: 0, padding: '0 4px 20px', maxWidth: '70ch', fontSize: 'var(--fs-body-sm)',
              lineHeight: 1.65, color: 'var(--ink-soft)' }}>{it.a}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
