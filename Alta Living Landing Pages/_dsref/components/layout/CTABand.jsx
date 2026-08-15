import React from 'react';
import { Button } from '../core/Button.jsx';

export function CTABand({ title, subtitle, action = 'Browse Properties', onAction, style, ...rest }) {
  return (
    <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '72px 32px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center',
      borderTop: '1px solid var(--ink)', ...style }} {...rest}>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 'var(--fs-display)', lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--tracking-display)' }}>{title}</h2>
      <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)',
        textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', opacity: .8 }}>{subtitle}</p>
      <Button variant="hard" size="lg" shape="pill" onClick={onAction} style={{ marginTop: 12 }}>{action}</Button>
    </section>
  );
}
