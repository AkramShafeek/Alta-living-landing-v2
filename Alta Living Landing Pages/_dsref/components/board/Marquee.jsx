import React from 'react';

export function Marquee({ items = [], speed = 26, tone = 'rust', style, ...rest }) {
  const grounds = {
    rust: { background: 'color-mix(in srgb, var(--rust-band) 60%, transparent)', color: 'var(--white)' },
    ink: { background: 'var(--ink)', color: 'var(--paper)' },
    paper: { background: 'var(--paper-2)', color: 'var(--ink)' },
  };
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
      borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)', ...grounds[tone], ...style }} {...rest}>
      <div style={{ display: 'inline-flex', animation: 'alta-marquee ' + speed + 's linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ padding: '12px 28px', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)',
            textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>
            <span style={{ marginRight: 10, color: 'var(--clay)' }}>—</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}
