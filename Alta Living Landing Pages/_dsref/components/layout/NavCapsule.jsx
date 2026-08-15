import React from 'react';
import { Button } from '../core/Button.jsx';

export function NavCapsule({ items = [], active, onSelect, style, ...rest }) {
  return (
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--white)',
      border: '1px solid var(--ink)', borderRadius: 'var(--radius-pill)', padding: '4px 12px',
      boxShadow: '0 2px 4px rgba(0,0,0,.12)', ...style }} {...rest}>
      {items.map(item => (
        <Button key={item} variant="link" size="sm" onClick={() => onSelect && onSelect(item)}
          style={{ textDecoration: active === item ? 'underline' : 'none', color: active === item ? 'var(--rust)' : 'var(--ink)' }}>
          {item}
        </Button>
      ))}
    </nav>
  );
}
