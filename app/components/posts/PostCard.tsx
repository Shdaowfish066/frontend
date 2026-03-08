import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { MessageCircle, MoreHorizontal, Flag, Edit, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, useApp } from '../../store/AppContext';
import { useToast } from '../../store/ToastContext';
import { VoteScore } from '../shared/VoteScore';
import { FileChip } from '../shared/FileChip';
import { AnonymousBadge } from '../shared/RoleBadge';
import { ConfirmModal } from '../shared/ConfirmModal';

type Props = {
  post: Post;
  onEdit?: (post: Post) => void;
  compact?: boolean;
};

export function PostCard({ post, onEdit, compact = false }: Props) {
  const navigate = useNavigate();
  const { votePost, deletePost, reportContent, currentUser } = useApp();
  const { showVote, showSuccess, showError } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);

  const isOwner = post.authorId === currentUser.id;

  const handleVote = (vote: 1 | -1) => {
    votePost(post.id, vote);
    showVote();
  };

  const handleDelete = () => {
    deletePost(post.id);
    showSuccess('Post deleted', 'Your post has been removed.');
    setConfirmDelete(false);
  };

  const handleReport = () => {
    reportContent('Post', post.id, 'Reported by user');
    setMenuOpen(false);
    showSuccess('Report submitted', 'Our team will review this post.');
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          background: '#1A1D27',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '18px 20px',
          display: 'flex',
          gap: 16,
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,0.3)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(108,99,255,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
        }}
        onClick={() => navigate(`/post/${post.id}`)}
      >
        {/* Vote column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 2 }}>
          <VoteScore
            votes={post.votes}
            userVote={post.userVote}
            vertical
            onUpvote={() => handleVote(1)}
            onDownvote={() => handleVote(-1)}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            {post.anonymous ? (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(100,116,139,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>👻</div>
            ) : (
              <img src={post.authorAvatar} alt={post.authorName} style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '1.5px solid rgba(108,99,255,0.3)', flexShrink: 0,
              }} />
            )}
            {post.anonymous ? (
              <AnonymousBadge />
            ) : (
              <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>{post.authorName}</span>
            )}
            <span style={{ color: '#334155', fontSize: 11 }}>•</span>
            <span style={{ color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            color: '#F1F5F9', fontSize: 15, fontWeight: 600, marginBottom: 8,
            lineHeight: 1.4, letterSpacing: '-0.2px',
          }}>
            {post.title}
          </h3>

          {/* Content preview */}
          {!compact && (
            <p style={{
              color: '#94A3B8', fontSize: 14, lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', marginBottom: post.files.length ? 10 : 0,
            }}>
              {post.content}
            </p>
          )}

          {/* File chips */}
          {post.files.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {post.files.map(f => <FileChip key={f.id} file={f} showDownload={false} />)}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => navigate(`/post/${post.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#64748B', fontSize: 12, padding: '4px 8px',
                borderRadius: 6, transition: 'color 0.2s',
              }}
            >
              <MessageCircle size={14} />
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </button>

            {/* 3-dot menu */}
            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#64748B', padding: 4, borderRadius: 6,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <MoreHorizontal size={16} />
              </motion.button>

              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 28, zIndex: 20,
                    background: '#22263A', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '6px', minWidth: 140,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}>
                    {isOwner && (
                      <>
                        <button
                          onClick={() => { setMenuOpen(false); onEdit?.(post); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#94A3B8', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                          }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#EF4444', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                    {!isOwner && (
                      <button
                        onClick={handleReport}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#F59E0B', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                        }}
                      >
                        <Flag size={14} /> Report
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete Post?"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete Post"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
