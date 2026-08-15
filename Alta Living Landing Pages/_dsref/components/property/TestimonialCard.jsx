import React from 'react';
import { Tag } from '../core/Tag.jsx';
import { Icon } from '../core/Icon.jsx';
import { Rule } from '../core/Rule.jsx';

export function TestimonialCard({ quote, name = 'Guest Name', location = 'Indiranagar, Bangalore', rating = 5, verified = true, tone = 'blue', style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 300, maxWidth: 420,
      background: 'var(--pastel-' + tone + ')', border: '1px solid var(--ink)', overflow: 'hidden', ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: 16, gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>{name}</p>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="star" size={16} color={i < rating ? 'var(--ink)' : 'var(--text-muted)'} />
            ))}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', lineHeight: 1.6, color: 'var(--text-muted)' }}>{quote}</p>
        <Rule />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 'var(--fs-label)' }}>
          <Tag tone="outline" icon="map-pin">{location}</Tag>
          {verified ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
              <Icon name="home" size={16} />Verified Stay
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
