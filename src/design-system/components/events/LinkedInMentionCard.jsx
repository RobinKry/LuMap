import React from 'react';
import { Button } from '../core/Button.jsx';

export function LinkedInMentionCard({ authorName = 'Unknown', authorHeadline = 'LinkedIn', onOpen, style, ...rest }) {
  return (
    <div
      style={{
        marginTop: 12, padding: 'var(--pad-card-inner)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--lm-sky-100)',
        fontFamily: 'var(--font-ui)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--lm-linkedin)' }}>
        LinkedIn mention
      </div>
      <div style={{ marginTop: 8, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)', color: 'var(--text-body)' }}>
        Mentioned by {authorName} • {authorHeadline}
      </div>
      <Button variant="linkedin" size="sm" onClick={onOpen} style={{ marginTop: 12 }}>View original post</Button>
    </div>
  );
}
