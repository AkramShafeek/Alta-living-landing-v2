import React from 'react';
import { Icon } from './Icon.jsx';

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap',
  border: '1px solid transparent', background: 'none', color: 'var(--ink)',
  transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-instant) var(--ease-standard), transform var(--dur-instant) var(--ease-standard)',
};

const sizes = {
  sm: { height: 32, padding: '0 12px', fontSize: 13 },
  md: { height: 40, padding: '0 18px', fontSize: 14 },
  lg: { height: 56, padding: '0 28px', fontSize: 16 },
};

export function Button({
  children, variant = 'hard', size = 'md', shape = 'square',
  iconStart, iconEnd, block = false, disabled = false, justify,
  onClick, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hard = variant === 'hard' || variant === 'hard-invert';

  const skin = {
    hard: {
      background: hover ? 'var(--ink)' : 'var(--white)',
      color: hover ? 'var(--paper)' : 'var(--ink)',
      borderColor: 'var(--ink)',
    },
    'hard-invert': {
      background: hover ? 'var(--white)' : 'var(--ink)',
      color: hover ? 'var(--ink)' : 'var(--paper)',
      borderColor: 'var(--ink)',
    },
    solid: {
      background: hover ? 'var(--ink-soft)' : 'var(--ink)',
      color: 'var(--paper)', borderColor: 'var(--ink)',
    },
    outline: {
      background: hover ? 'var(--paper-2)' : 'transparent',
      color: 'var(--ink)', borderColor: 'var(--ink)',
    },
    ghost: {
      background: hover ? 'rgba(17,17,17,.06)' : 'transparent',
      color: 'var(--ink)', borderColor: 'transparent',
    },
    link: {
      background: 'transparent', color: hover ? 'var(--rust)' : 'var(--ink)',
      borderColor: 'transparent', textDecoration: hover ? 'underline' : 'none',
      textUnderlineOffset: '3px', padding: '0 4px',
    },
  }[variant];

  const radius = shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-0)';
  const offset = press ? 'var(--press-offset)' : '0px';

  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        ...base, ...sizes[size], ...skin, borderRadius: radius,
        width: block ? '100%' : undefined,
        justifyContent: justify || (block && variant === 'hard' ? 'space-between' : 'center'),
        boxShadow: hard && !disabled ? (press ? '2px 2px 0 var(--ink)' : 'var(--shadow-hard)') : 'none',
        transform: hard && press ? 'translate(' + offset + ',' + offset + ')' : 'none',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {iconStart ? <Icon name={iconStart} size={size === 'sm' ? 14 : 16} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={size === 'sm' ? 14 : 16} /> : null}
    </button>
  );
}
