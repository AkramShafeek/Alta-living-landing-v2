import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function FeatureCell({ icon = 'check', title, children, tone = 'blue', style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20,
      background: 'var(--pastel-' + tone + ')', border: '1px solid var(--ink)', ...style }} {...rest}>
      <Icon name={icon} size={22} />
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: 1.1 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', lineHeight: 1.55, color: 'var(--ink-soft)' }}>{children}</p>
    </div>
  );
}
