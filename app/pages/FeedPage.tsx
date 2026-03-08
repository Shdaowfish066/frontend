import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, TrendingUp, Users, FileText, ThumbsUp } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PostCard } from '../components/posts/PostCard';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { PostSkeleton } from '../components/shared/SkeletonCard';
import { EmptyState } from '../components/shared/EmptyState';
import { ToastShowcase } from '../components/toasts/ToastShowcase';
import { Post } from '../store/AppContext';

export default function FeedPage() {
  const { posts, communities, currentUser } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editPost, setEditPost] = useState<Post | undefined>();
  const [loading] = useState(false);

  const joinedCommunities = communities.filter(c => c.joined);
  const userPosts = posts.filter(p => p.authorId === currentUser.id);
  const totalVotes = userPosts.reduce((sum, p) => sum + (p.votes > 0 ? p.votes : 0), 0);

  const handleEdit = (post: Post) => {
    setEditPost(post);
    setShowCreate(true);
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Center feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 24, letterSpacing: '-0.5px' }}>
            ✨ Your Feed
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
            Stay up to date with posts from your communities
          </p>
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState type="posts" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Toast showcase */}
            <ToastShowcase />
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <PostCard post={post} onEdit={handleEdit} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:block" style={{
        width: 280, flexShrink: 0, overflowY: 'auto',
        padding: '24px 16px 24px 0', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Quick stats */}
        <div style={{
          background: '#1A1D27', borderRadius: 12, padding: '18px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Stats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: <FileText size={14} />, label: 'Your Posts', value: userPosts.length, color: '#6C63FF' },
              { icon: <ThumbsUp size={14} />, label: 'Total Votes', value: totalVotes, color: '#22C55E' },
              { icon: <Users size={14} />, label: 'Communities', value: joinedCommunities.length, color: '#38BDF8' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B' }}>
                  <span style={{ color }}>{icon}</span>
                  <span style={{ fontSize: 13 }}>{label}</span>
                </div>
                <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 15 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending communities */}
        <div style={{
          background: '#1A1D27', borderRadius: 12, padding: '18px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <TrendingUp size={14} color="#F59E0B" />
            <h3 style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trending
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {communities.slice(0, 5).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#475569', fontSize: 12, width: 16, textAlign: 'right' }}>#{i + 1}</span>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'white',
                }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <p style={{ color: '#64748B', fontSize: 11 }}>{c.memberCount.toLocaleString()} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Joined communities */}
        {joinedCommunities.length > 0 && (
          <div style={{
            background: '#1A1D27', borderRadius: 12, padding: '18px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              My Communities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {joinedCommunities.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0,
                  }} />
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setEditPost(undefined); setShowCreate(true); }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 100,
          background: 'linear-gradient(135deg,#6C63FF,#5B53F5)',
          border: 'none', borderRadius: '50%', width: 56, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'white',
          boxShadow: '0 8px 24px rgba(108,99,255,0.5), 0 0 0 4px rgba(108,99,255,0.1)',
        }}
      >
        <Plus size={22} />
      </motion.button>

      <CreatePostModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setEditPost(undefined); }}
        editPost={editPost ? {
          id: editPost.id, title: editPost.title, content: editPost.content,
          anonymous: editPost.anonymous, files: editPost.files,
        } : undefined}
      />
    </div>
  );
}