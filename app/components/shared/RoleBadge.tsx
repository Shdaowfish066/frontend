import React from 'react';
import { Ghost } from 'lucide-react';

export function CaptainBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(251,191,36,0.15)',
      border: '1px solid rgba(251,191,36,0.4)',
      color: '#FBBF24',
      borderRadius: 24, padding: '2px 10px', fontSize: 11, fontWeight: 600,
    }}>
      👑 Captain
    </span>
  );
}

export function MemberBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(100,116,139,0.15)',
      border: '1px solid rgba(100,116,139,0.3)',
      color: '#64748B',
      borderRadius: 24, padding: '2px 10px', fontSize: 11, fontWeight: 500,
    }}>
      Member
    </span>
  );
}

export function AnonymousBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color: '#64748B', fontStyle: 'italic', fontSize: 13,
    }}>
      <Ghost size={13} /> Anonymous
    </span>
  );
}
