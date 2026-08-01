import React from 'react';
import { Button } from '../core/Button.jsx';
import { StatBlock } from '../core/StatBlock.jsx';
import { PlatformBadge } from './PlatformBadge.jsx';
import { FriendAvatarStack } from './FriendAvatarStack.jsx';
import { LinkedInMentionCard } from './LinkedInMentionCard.jsx';

export function EventCard({ event = {}, selected = false, onSelect, onOpenLink, style, ...rest }) {
  const {
    title, venue_name, source_platform, is_residential,
    attendee_count, linkedin_match_count = 0, match_preview = [],
    guest_list_public, friends = [], otherCount = 0,
    original_author_name, original_author_headline,
  } = event;

  return (
    <div
      onClick={onSelect}
      style={{
        padding: 'var(--pad-card)', borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: `2px solid ${selected ? 'var(--accent)' : 'transparent'}`,
        boxShadow: selected ? 'var(--shadow-raised)' : 'var(--shadow-card)',
        fontFamily: 'var(--font-ui)', cursor: onSelect ? 'pointer' : 'default',
        transition: 'border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <PlatformBadge platform={source_platform} />
        {is_residential && (
          <span style={{ fontSize: 'var(--text-micro)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', background: 'var(--lm-alpha-06)', borderRadius: 'var(--radius-full)', padding: '4px 9px' }}>neighborhood (blurred)</span>
        )}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)' }}>{title}</div>
      {venue_name && <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{venue_name}</div>}

      <div style={{ display: 'flex', gap: 'var(--gap-stat)', marginTop: 12 }}>
        <StatBlock value={attendee_count} label="dabei" />
        <StatBlock value={linkedin_match_count} label="LinkedIn-Match" />
      </div>

      {match_preview.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 'var(--text-meta)', color: 'var(--text-muted)' }}>
          z. B. {match_preview.slice(0, 3).join(', ')}{guest_list_public === false ? '' : ' · Namens-Match'}
        </div>
      )}

      <FriendAvatarStack friends={friends} extraCount={otherCount} style={{ marginTop: 12 }} />

      {source_platform === 'LINKEDIN' && (
        <LinkedInMentionCard authorName={original_author_name ?? 'Unknown'} authorHeadline={original_author_headline ?? 'LinkedIn'} onOpen={onOpenLink} />
      )}

      <Button variant="primary" block onClick={onOpenLink} style={{ marginTop: 16 }}>Open Event Link</Button>
    </div>
  );
}
