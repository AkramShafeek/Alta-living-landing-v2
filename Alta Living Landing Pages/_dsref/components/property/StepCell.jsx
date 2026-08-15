import React from 'react';

export function StepCell({ n, title, children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0', ...style }} {...rest}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Step {n}</span>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: '34ch' }}>{children}</p>
    </div>
  );
}
