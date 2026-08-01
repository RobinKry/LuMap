import React from 'react';

const TINTS = ['var(--lm-lilac-300)', 'var(--lm-mint-300)', 'var(--lm-butter-300)', 'var(--lm-peach-300)'];

export function FriendAvatarStack({ friends = [], extraCount = 0, style, ...rest }) {
  if (friends.length === 0 && extraCount === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }} {...rest}>
      {friends.slice(0, 4).map((friend, i) => (
        <div
          key={friend.id}
          style={{
            width: 32, height: 32, borderRadius: 'var(--radius-full)', overflow: 'hidden',
            border: 'var(--stroke-ring) solid var(--surface-card)',
            background: TINTS[i % TINTS.length],
            marginLeft: i === 0 ? 0 : 'var(--avatar-overlap)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: '0 0 auto',
          }}
        >
          {friend.avatar_url
            ? <img src={friend.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--lm-ink-900)' }}>{(friend.display_name || '?').slice(0, 1).toUpperCase()}</span>}
        </div>
      ))}
      {extraCount > 0 && (
        <span style={{ marginLeft: 8, fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>+{extraCount} others</span>
      )}
    </div>
  );
}
