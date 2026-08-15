import React from 'react';
import { Icon } from './Icon.jsx';

const tones = {
  ink: { background: 'var(--ink)', color: 'var(--white)' },
  paper: { background: 'var(--paper-2)', color: 'var(--ink)' },
  wash: { background: 'var(--pastel-blue-deep)', color: 'var(--ink)' },
  rust: { background: 'var(--rust)', color: 'var(--paper)' },
  outline: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink)' },
  glass: { background: 'rgba(0,0,0,.5)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-pill)' },
};

export function Tag({ children, tone = 'ink', icon, mono = false, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: 'var(--fs-label)', fontWeight: 500, lineHeight: 1.2,
        letterSpacing: mono ? '0.06em' : 0, borderRadius: 'var(--radius-0)',
        ...tones[tone], ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  );
}
