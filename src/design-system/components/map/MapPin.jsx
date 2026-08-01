import React from 'react';

export function MapPin({ kind = 'public', selected = false, style, onClick, ...rest }) {
  const residential = kind === 'residential';
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', width: residential ? 84 : 32, height: residential ? 84 : 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
      {...rest}
    >
      {residential ? (
        <>
          <span style={{ position: 'absolute', width: 'var(--pin-blur-outer)', height: 'var(--pin-blur-outer)', borderRadius: '50%', background: 'var(--accent)', opacity: 0.18, filter: 'blur(12px)' }} />
          <span style={{ position: 'absolute', width: 'var(--pin-blur-inner)', height: 'var(--pin-blur-inner)', borderRadius: '50%', background: 'var(--accent)', opacity: 0.38, filter: 'blur(7px)' }} />
        </>
      ) : (
        <>
          <span style={{ position: 'absolute', width: 'var(--pin-halo)', height: 'var(--pin-halo)', borderRadius: '50%', background: 'var(--accent-soft)' }} />
          <span style={{
            position: 'absolute', width: 'var(--pin-core)', height: 'var(--pin-core)', borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: `0 0 0 3px var(--lm-paper-white), 0 2px 6px rgba(36,30,51,.18)${selected ? ', 0 0 0 8px var(--accent-glow)' : ''}`,
          }} />
        </>
      )}
    </div>
  );
}
