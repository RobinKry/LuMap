import React from 'react';

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: 'var(--font-ui)', fontWeight: 'var(--weight-bold)', border: 'none',
  cursor: 'pointer', borderRadius: 'var(--radius-full)',
  transition: 'transform var(--dur-fast) var(--ease-bounce), opacity var(--dur-fast) var(--ease-standard), background var(--dur-base) var(--ease-standard)',
  textAlign: 'center', textDecoration: 'none', whiteSpace: 'nowrap',
};

const variants = {
  primary: { background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: 'var(--shadow-card)' },
  soft: { background: 'var(--accent-soft)', color: 'var(--accent-ink)' },
  ghost: { background: 'var(--surface-card)', color: 'var(--text-primary)', border: 'var(--stroke) solid var(--border-strong)', fontWeight: 'var(--weight-semibold)' },
  chrome: { background: 'var(--surface-chrome)', color: 'var(--text-primary)', border: 'var(--stroke) solid var(--border-soft)', fontWeight: 'var(--weight-semibold)', backdropFilter: 'var(--blur-backdrop)', boxShadow: 'var(--shadow-card)' },
  linkedin: { background: 'var(--lm-linkedin)', color: 'var(--lm-paper-white)' },
};

const sizes = {
  sm: { fontSize: 'var(--text-xs)', padding: '9px 14px' },
  md: { fontSize: 'var(--text-sm)', padding: '13px 18px' },
};

export function Button({ variant = 'primary', size = 'md', block = false, disabled = false, style, children, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        ...base, ...sizes[size], ...variants[variant],
        width: block ? '100%' : undefined,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        ...style,
      }}
      onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(var(--press-scale))'; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
