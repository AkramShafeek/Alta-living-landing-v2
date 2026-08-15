import React from 'react';
import { Button } from '../core/Button.jsx';
import { Tag } from '../core/Tag.jsx';
import { Icon } from '../core/Icon.jsx';
import { Rule } from '../core/Rule.jsx';

export function PropertyCard({
  src, alt = '', title = 'Property Title', hook, location = 'Bangalore',
  beds = '1BHK', availability, price = '₹ 30,000', unit = 'per night',
  tone = 'blue', onView, style, ...rest
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 320,
      background: 'var(--pastel-' + tone + ')', border: '1px solid var(--ink)', overflow: 'hidden', ...style }} {...rest}>
      <div style={{ height: 288, borderBottom: '1px solid var(--ink)', overflow: 'hidden' }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: 16, gap: 8 }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: 1.1 }}>{title}</p>
        <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>{hook}</p>
        <Rule />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--fs-label)', alignItems: 'center' }}>
          <Tag icon="map-pin">{location}</Tag>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="bed" size={16} />{beds}</span>
          {availability ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="door-open" size={16} />{availability}</span> : null}
        </div>
        <Rule />
        <div style={{ display: 'flex', gap: 8, padding: 8 }}>
          <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 8, font: 'var(--type-price)' }}>
            {price}<span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 400 }}>{unit}</span>
          </p>
        </div>
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <Button variant="hard" block iconEnd="arrow-right" onClick={onView} style={{ borderTop: '1px solid var(--ink)' }}>View</Button>
      </div>
    </div>
  );
}
