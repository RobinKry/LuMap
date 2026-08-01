import React from 'react';

export function BottomSheet({ title, subtitle, height = '58%', children, style, ...rest }) {
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height,
        background: 'var(--surface-sheet)',
        backdropFilter: 'var(--blur-backdrop)',
        borderTopLeftRadius: 'var(--radius-sheet)', borderTopRightRadius: 'var(--radius-sheet)',
        boxShadow: 'var(--shadow-sheet)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-ui)', overflow: 'hidden',
        transition: 'height var(--dur-sheet) var(--ease-spring)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
        <span style={{ width: 40, height: 5, borderRadius: 'var(--radius-full)', background: 'var(--lm-alpha-14)' }} />
      </div>
      {(title || subtitle) && (
        <div style={{ padding: '2px var(--pad-screen-x) 10px' }}>
          {title && <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-primary)' }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--pad-screen-x) var(--space-10)' }}>{children}</div>
    </div>
  );
}
