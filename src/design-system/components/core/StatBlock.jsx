import React from 'react';

export function StatBlock({ value, label, style, ...rest }) {
  return (
    <div style={{ fontFamily: 'var(--font-ui)', ...style }} {...rest}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-display)' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 'var(--text-micro)', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
