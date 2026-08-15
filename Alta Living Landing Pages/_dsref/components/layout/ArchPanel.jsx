import React from 'react';

export function ArchPanel({ title, action, children, pad = 64, style, ...rest }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'stretch',
      padding: pad, paddingBottom: 48, border: '1px solid var(--paper-3)',
      borderTopLeftRadius: 'var(--radius-arch)', borderTopRightRadius: 'var(--radius-arch)',
      borderBottom: 'none', ...style }} {...rest}>
      {(title || action) && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          {title ? <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'var(--fs-display)', lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--tracking-display)' }}>{title}</h2> : <span />}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
