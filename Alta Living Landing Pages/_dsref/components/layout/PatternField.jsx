import React from 'react';

export function PatternField({ src = 'assets/pattern-furniture.jpg', size = 300, opacity = 0.1, fadeIn = true, style, ...rest }) {
  return (
    <div aria-hidden="true"
      style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + src + ')', backgroundRepeat: 'repeat',
        backgroundSize: size + 'px ' + size + 'px', opacity: fadeIn ? 0 : opacity,
        animation: fadeIn ? 'alta-pattern-in var(--dur-wash) var(--ease-standard) forwards' : undefined,
        ['--alta-pattern-opacity']: opacity, ...style }} {...rest} />
  );
}
