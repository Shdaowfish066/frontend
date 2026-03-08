import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Send, Trash2, Edit, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { VoteScore } from '../components/shared/VoteScore';
import { FileCard } from '../components/shared/FileChip';
import { AnonymousBadge } from '../components/shared/RoleBadge';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { CreatePostModal } from '../components/posts/CreatePostModal';

export default function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, votePost, addComment, deleteComment, voteComment, currentUser, reportContent } = useApp();
  const { showVote, showComment, showSuccess } = useToast();
  const [commentText, setCommentText] = useState('');
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState(false);

  const post = posts.find(p => p.id === id);

  if (!post) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#64748B', fontSize: 16 }}>Post not found.</p>
        <button onClick={() => navigate('/')} style={{
          marginTop: 16, background: '#6C63FF', border: 'none', borderRadius: 8,
          padding: '10px 20px', color: 'white', cursor: 'pointer', fontWeight: 500,
        }}>
          Back to Feed
        </button>
      </div>
    );
  }

  const handleVote = (vote: 1 | -1) => {
    votePost(post.id, vote);
    showVote();
  };

  const handleCommentVote = (commentId: string, vote: 1 | -1) => {
    voteComment(post.id, commentId, vote);
    showVote();
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
    showComment();
  };

  const handleDeleteComment = () => {
    if (confirmDeleteComment) {
      deleteComment(post.id, confirmDeleteComment);
      setConfirmDeleteComment(null);
      showSuccess('Comment deleted');
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px', paddingBottom: 80 }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#64748B', fontSize: 14, marginBottom: 20, padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Post */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#1A1D27', borderRadius: 14, padding: '28px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          marginBottom: 24,
        }}
      >
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {post.anonymous ? (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(100,116,139,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>👻</div>
          ) : (
            <img src={post.authorAvatar} alt="" style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '2px solid rgba(108,99,255,0.4)',
            }} />
          )}
          <div>
            {post.anonymous ? <AnonymousBadge /> : (
              <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>{post.authorName}</span>
            )}
            <div style={{ color: '#475569', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
          {post.authorId === currentUser.id && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingPost(true)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#94A3B8',
                fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Edit size={13} /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 22, lineHeight: 1.4, marginBottom: 16, letterSpacing: '-0.5px' }}>
          {post.title}
        </h1>

        {/* Content */}
        <div style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>

        {/* File attachments */}
        {post.files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <p style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Attachments
            </p>
            {post.files.map(f => <FileCard key={f.id} file={f} />)}
          </div>
        )}

        {/* Vote bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <VoteScore
            votes={post.votes}
            userVote={post.userVote}
            onUpvote={() => handleVote(1)}
            onDownvote={() => handleVote(-1)}
          />
          <span style={{ color: '#64748B', fontSize: 13 }}>
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </motion.div>

      {/* Comment input */}
      <div style={{
        background: '#1A1D27', borderRadius: 12, padding: '16px 20px',
        border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <img src={currentUser.avatar} alt="" style={{
            width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(108,99,255,0.3)', flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment(); }}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                padding: '10px 12px', color: '#F1F5F9', fontSize: 14, lineHeight: 1.5,
                outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6C63FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                style={{
                  background: commentText.trim() ? '#6C63FF' : 'rgba(108,99,255,0.2)',
                  border: 'none', borderRadius: 8, padding: '8px 16px',
                  color: 'white', cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <Send size={13} /> Comment
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {post.comments.length === 0 ? (
          <EmptyState type="comments" />
        ) : (
          post.comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#1A1D27', borderRadius: 10, padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <img src={comment.authorAvatar} alt="" style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.1)', flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>{comment.authorName}</span>
                    <span style={{ color: '#475569', fontSize: 11 }}>
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <VoteScore
                        votes={comment.votes} userVote={comment.userVote} size="sm"
                        onUpvote={() => handleCommentVote(comment.id, 1)}
                        onDownvote={() => handleCommentVote(comment.id, -1)}
                      />
                      {comment.authorId === currentUser.id && (
                        <button
                          onClick={() => setConfirmDeleteComment(comment.id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#EF4444', padding: 4, borderRadius: 4, display: 'flex',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {comment.authorId !== currentUser.id && (
                        <button
                          onClick={() => reportContent('Post', comment.id, 'Reported comment')}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#64748B', padding: 4, borderRadius: 4, display: 'flex',
                          }}
                        >
                          <Flag size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.6 }}>{comment.content}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmModal
        open={!!confirmDeleteComment}
        title="Delete Comment?"
        description="Are you sure you want to delete this comment? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteComment}
        onCancel={() => setConfirmDeleteComment(null)}
      />

      <CreatePostModal
        open={editingPost}
        onClose={() => setEditingPost(false)}
        editPost={editingPost ? {
          id: post.id, title: post.title, content: post.content,
          anonymous: post.anonymous, files: post.files,
        } : undefined}
      />
    </div>
  );
}
