import React from 'react';
// Lucide (lucide-react in source) served as static SVG from CDN — brand icon set.
const CDN = 'https://cdn.jsdelivr.net/npm/lucide-static@0.544.0/icons/';
export function Icon({ name, size = 16, color = 'currentColor', strokeWidth, style, ...rest }) {
  const px = typeof size === 'number' ? size + 'px' : size;
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-block', width: px, height: px, flex: '0 0 auto', background: color,
        WebkitMaskImage: 'url(' + CDN + name + '.svg)', maskImage: 'url(' + CDN + name + '.svg)',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskPosition: 'center', maskPosition: 'center', ...style }}
      data-icon={name} data-stroke={strokeWidth} {...rest}
    />
  );
}
