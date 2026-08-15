import React from 'react';

export function StickyNote({ children, rotate = -4, width = 112, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }} {...rest}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rust)', marginBottom: -4, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,.4)' }} />
      <div style={{ width, transform: 'rotate(' + rotate + 'deg)', background: 'var(--note)',
        border: '1px solid rgba(17,17,17,.4)', boxShadow: 'var(--shadow-note)', padding: '8px 12px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-hand)', fontSize: 14, lineHeight: 1.35,
          color: 'rgba(17,17,17,.7)', whiteSpace: 'pre-line' }}>{children}</p>
      </div>
    </div>
  );
}
