import React from 'react';

export function PinnedPhoto({ src, alt = '', width = 176, height = 132, rotate, seed = 0, caption, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const s = seed % 100;
  const baseRotate = rotate !== undefined ? rotate : (s / 100) * 10 - 5;
  const r = hover ? baseRotate * 0.4 : baseRotate;
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }} {...rest}
    >
      <div style={{ position: 'relative', zIndex: 10, marginBottom: -4, width: 12, height: 12, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #f87171, #991b1b 60%, #5f1414)',
        border: '1px solid var(--rust)', boxShadow: '0 1px 2px rgba(0,0,0,.6)' }} />
      <div
        style={{
          width, background: 'var(--paper-2)', border: '1px solid var(--ink)', overflow: 'hidden',
          transform: 'perspective(800px) rotateX(3deg) rotate(' + r + 'deg)', transformOrigin: 'top center',
          transition: 'transform 150ms ease-out, box-shadow 250ms ease-out',
          boxShadow: hover ? 'var(--shadow-pinned-hover)' : 'var(--shadow-pinned)',
        }}
      >
        <div style={{ height, padding: 4 }}>
          <img src={src} alt={alt} draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ height: 24, background: 'var(--white)', display: 'flex', alignItems: 'center', padding: '0 6px',
          fontFamily: 'var(--font-hand)', fontSize: 12, color: 'rgba(17,17,17,.7)' }}>{caption}</div>
      </div>
    </div>
  );
}
