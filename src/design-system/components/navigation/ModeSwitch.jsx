import React from 'react';

const OPTIONS = [
  { mode: 'WORK', label: '💼 WORK' },
  { mode: 'PARTY', label: '🔥 PARTY' },
];

export function ModeSwitch({ mode = 'WORK', onChange, style, ...rest }) {
  const index = mode === 'WORK' ? 0 : 1;
  return (
    <div
      style={{
        display: 'inline-flex', position: 'relative', padding: 4,
        borderRadius: 'var(--radius-full)',
        border: 'var(--stroke) solid var(--border-soft)',
        background: 'var(--surface-chrome)',
        backdropFilter: 'var(--blur-backdrop)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 4, bottom: 4, left: 4,
          width: 'var(--segment-width)', borderRadius: 'var(--radius-full)',
          background: 'var(--accent)',
          transform: `translateX(calc(${index} * var(--segment-width)))`,
          transition: 'transform var(--dur-spring) var(--ease-spring), background var(--dur-base) var(--ease-standard)',
        }}
      />
      {OPTIONS.map((option) => {
        const active = option.mode === mode;
        return (
          <button
            key={option.mode}
            type="button"
            onClick={() => onChange && onChange(option.mode)}
            style={{
              position: 'relative', width: 'var(--segment-width)', padding: '10px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-wide)',
              color: active ? 'var(--accent-ink)' : 'var(--text-tertiary)',
              transition: 'color var(--dur-base) var(--ease-standard)',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
