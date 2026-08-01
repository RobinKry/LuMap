import React from 'react';

const BADGES = {
  LUMA: { label: '💼 lu.ma', tint: 'var(--lm-sky-100)' },
  PARTIFUL: { label: '🎉 partiful', tint: 'var(--lm-peach-100)' },
  LINKEDIN: { label: '💼 linkedin', tint: 'var(--lm-sky-100)' },
  EVENTBRITE: { label: '🎫 eventbrite', tint: 'var(--lm-butter-100)' },
};

export function PlatformBadge({ platform, style, ...rest }) {
  const badge = BADGES[platform] || { label: platform, tint: 'var(--lm-alpha-06)' };
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', flex: '0 0 auto',
        background: badge.tint, borderRadius: 'var(--radius-full)', padding: '4px 10px',
        fontFamily: 'var(--font-ui)', fontSize: 'var(--text-meta)',
        fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-wide)',
        color: 'var(--text-body)', ...style,
      }}
      {...rest}
    >
      {badge.label}
    </span>
  );
}
