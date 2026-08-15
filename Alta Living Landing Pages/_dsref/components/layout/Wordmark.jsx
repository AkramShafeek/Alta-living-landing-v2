import React from 'react';

export function Wordmark({ variant = 'lockup', size = 48, boxed = true, style, ...rest }) {
  if (variant === 'mark') {
    return <img src="assets/alta-logo.png" alt="Alta Living"
      style={{ width: size, height: size, border: boxed ? '1px solid var(--ink)' : 'none',
        borderRadius: boxed ? 'var(--radius-md)' : 0, boxShadow: boxed ? 'var(--shadow-hard-sm)' : 'none',
        background: 'var(--white)', display: 'block', ...style }} {...rest} />;
  }
  if (variant === 'condensed') {
    return <span style={{ fontFamily: 'var(--font-wordmark)', fontSize: size, letterSpacing: '0.02em',
      textTransform: 'uppercase', lineHeight: 1, ...style }} {...rest}>Alta Living</span>;
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, ...style }} {...rest}>
      <img src="assets/alta-logo.png" alt="" style={{ width: size, height: size, border: boxed ? '1px solid var(--ink)' : 'none',
        borderRadius: boxed ? 'var(--radius-md)' : 0, boxShadow: boxed ? 'var(--shadow-hard-sm)' : 'none', background: 'var(--white)' }} />
      <span style={{ fontFamily: 'var(--font-wordmark)', fontSize: size * 0.8, textTransform: 'uppercase', lineHeight: 1 }}>Alta Living</span>
    </span>
  );
}
