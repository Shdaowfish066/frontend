import React from 'react';
import { motion } from 'motion/react';

function Shimmer({ width, height, radius = 6 }: { width: string | number; height: number; radius?: number }) {
  return (
    <motion.div
      style={{
        width, height, borderRadius: radius,
        background: 'linear-gradient(90deg, #1A1D27 0%, #22263A 50%, #1A1D27 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
    />
  );
}

export function PostSkeleton() {
  return (
    <div style={{
      background: '#1A1D27', borderRadius: 12, padding: 20,
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', gap: 16,
    }}>
      {/* Vote column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 36 }}>
        <Shimmer width={36} height={28} />
        <Shimmer width={28} height={18} />
        <Shimmer width={36} height={28} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shimmer width={32} height={32} radius={999} />
          <Shimmer width={100} height={14} />
          <Shimmer width={70} height={12} />
        </div>
        <Shimmer width="80%" height={20} radius={8} />
        <Shimmer width="100%" height={14} />
        <Shimmer width="90%" height={14} />
        <Shimmer width="60%" height={14} />
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <Shimmer width={60} height={24} radius={8} />
          <Shimmer width={80} height={24} radius={8} />
        </div>
      </div>
    </div>
  );
}

export function CommunityCardSkeleton() {
  return (
    <div style={{
      background: '#1A1D27', borderRadius: 12, padding: 20,
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <Shimmer width={48} height={48} radius={12} />
      <Shimmer width="70%" height={18} />
      <Shimmer width="100%" height={14} />
      <Shimmer width="90%" height={14} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Shimmer width={80} height={24} radius={24} />
        <Shimmer width={70} height={32} radius={8} />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Shimmer width={40} height={40} radius={999} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Shimmer width="30%" height={14} />
        <Shimmer width="70%" height={14} />
      </div>
      <Shimmer width={40} height={12} />
    </div>
  );
}
