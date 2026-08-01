import React from 'react';

export function TextField({ value, onChange, placeholder, style, ...rest }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoCapitalize="off"
      autoCorrect="off"
      style={{
        width: '100%', boxSizing: 'border-box',
        background: 'var(--surface-input)',
        border: 'var(--stroke) solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '13px 16px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)',
        outline: 'none',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-glow)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
      {...rest}
    />
  );
}
