import React from 'react';

export function StatBlock({ value, label, size = 'lg', style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8, padding: 16, ...style }} {...rest}>
      <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: size === 'lg' ? 'var(--fs-stat)' : 40, lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--tracking-display)' }}>{value}</p>
      <p style={{ margin: 0, fontWeight: 200, fontSize: 'var(--fs-body)', textAlign: 'right' }}>{label}</p>
    </div>
  );
}
