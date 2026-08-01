import React from 'react';

export function SectionLabel({ children, style, ...rest }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-bold)', textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wide)', color: 'var(--text-tertiary)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
