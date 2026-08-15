import React from 'react';
export function Rule({ orientation = 'horizontal', weight = 'soft', style, ...rest }) {
  const color = weight === 'hard' ? 'var(--ink)' : 'var(--border-soft)';
  const w = weight === 'thick' ? 2 : 1;
  return (
    <div
      role="separator"
      style={orientation === 'vertical'
        ? { width: w, alignSelf: 'stretch', background: weight === 'thick' ? 'var(--ink)' : color, ...style }
        : { height: w, width: '100%', background: weight === 'thick' ? 'var(--ink)' : color, ...style }}
      {...rest}
    />
  );
}
