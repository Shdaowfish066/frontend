import React from 'react';
import { motion } from 'motion/react';
import { FileText, Users, MessageCircle, UserCheck, CheckCircle2 } from 'lucide-react';

type EmptyType = 'posts' | 'communities' | 'messages' | 'members' | 'reports' | 'comments';

const CONFIGS: Record<EmptyType, { icon: React.ReactNode; title: string; subtitle: string; emoji?: string }> = {
  posts: {
    icon: <FileText size={40} />, title: 'No posts yet',
    subtitle: 'Be the first to share something with the community!',
  },
  communities: {
    icon: <Users size={40} />, title: 'No communities found',
    subtitle: 'Create a new community to get started.',
  },
  messages: {
    icon: <MessageCircle size={40} />, title: 'Select a conversation',
    subtitle: 'Choose a conversation or start a new one.',
  },
  members: {
    icon: <UserCheck size={40} />, title: 'No members yet',
    subtitle: 'This community is just getting started.',
  },
  reports: {
    icon: <CheckCircle2 size={40} />, title: 'No open reports',
    subtitle: 'Everything looks clean. Great moderation work!',
    emoji: '✅',
  },
  comments: {
    icon: <MessageCircle size={40} />, title: 'No comments yet',
    subtitle: 'Be the first to comment!',
    emoji: '💬',
  },
};

export function EmptyState({ type }: { type: EmptyType }) {
  const config = CONFIGS[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, padding: '60px 24px', textAlign: 'center',
      }}
    >
      <div style={{ color: '#2A2D3E', fontSize: 48 }}>
        {config.emoji || config.icon}
      </div>
      <p style={{ color: '#64748B', fontWeight: 600, fontSize: 16 }}>{config.title}</p>
      <p style={{ color: '#475569', fontSize: 14, maxWidth: 300 }}>{config.subtitle}</p>
    </motion.div>
  );
}
