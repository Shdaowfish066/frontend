import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Check, X, Calendar, FileText, ThumbsUp, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { PostCard } from '../components/posts/PostCard';
import { EmptyState } from '../components/shared/EmptyState';

export default function ProfilePage() {
  const { currentUser, posts, communities } = useApp();
  const { showSuccess } = useToast();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: currentUser.username, email: currentUser.email });

  const userPosts = posts.filter(p => p.authorId === currentUser.id && !p.anonymous);
  const joinedCommunities = communities.filter(c => c.joined);
  const totalVotes = userPosts.reduce((sum, p) => sum + Math.max(p.votes, 0), 0);

  const handleSave = () => {
    // In a real app, update the user
    setEditing(false);
    showSuccess('Profile Updated!', 'Your changes have been saved.');
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Cover banner */}
      <div style={{
        height: 180,
        background: 'linear-gradient(135deg, rgba(108,99,255,0.5), rgba(56,189,248,0.3), rgba(34,197,94,0.2))',
        position: 'relative',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: 20, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(108,99,255,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 200, width: 80, height: 80, borderRadius: '50%', background: 'rgba(56,189,248,0.1)' }} />
      </div>

      {/* Profile section */}
      <div style={{ padding: '0 28px', position: 'relative' }}>
        {/* Avatar */}
        <div style={{
          position: 'relative', marginTop: -48, marginBottom: 16, display: 'inline-block',
        }}>
          <img
            src={currentUser.avatar}
            alt="avatar"
            style={{
              width: 96, height: 96, borderRadius: '50%',
              border: '4px solid #6C63FF',
              boxShadow: '0 0 0 4px #0F1117, 0 0 24px rgba(108,99,255,0.5)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#22C55E', border: '3px solid #0F1117',
          }} />
        </div>

        {/* Name / edit */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  value={editForm.username}
                  onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                  style={{
                    background: '#1A1D27', border: '1px solid #6C63FF',
                    borderRadius: 8, padding: '9px 12px', color: '#F1F5F9', fontSize: 16, outline: 'none',
                  }}
                />
                <input
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  style={{
                    background: '#1A1D27', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '9px 12px', color: '#94A3B8', fontSize: 14, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} style={{
                    background: '#22C55E', border: 'none', borderRadius: 8, padding: '8px 14px',
                    color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}><Check size={14} /> Save</button>
                  <button onClick={() => setEditing(false)} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '8px 14px', color: '#64748B', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}><X size={14} /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>{currentUser.username}</h1>
                <p style={{ color: '#64748B', fontSize: 14 }}>{currentUser.email}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 12, marginTop: 4 }}>
                  <Calendar size={12} />
                  Member since {formatDistanceToNow(new Date(currentUser.createdAt), { addSuffix: true })}
                </p>
              </>
            )}
          </div>
          {!editing && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 16px', color: '#94A3B8',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
            >
              <Edit2 size={14} /> Edit Profile
            </motion.button>
          )}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap',
        }}>
          {[
            { icon: <FileText size={16} />, label: 'Posts', value: userPosts.length, color: '#6C63FF' },
            { icon: <ThumbsUp size={16} />, label: 'Votes Given', value: totalVotes, color: '#22C55E' },
            { icon: <Users size={16} />, label: 'Communities', value: joinedCommunities.length, color: '#38BDF8' },
          ].map(({ icon, label, value, color }) => (
            <div
              key={label}
              style={{
                background: '#1A1D27', borderRadius: 12, padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 140px',
                boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
              }}>
                {icon}
              </div>
              <div>
                <p style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 22 }}>{value}</p>
                <p style={{ color: '#64748B', fontSize: 12 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Posts */}
        <div>
          <h2 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>My Posts</h2>
          {userPosts.length === 0 ? (
            <EmptyState type="posts" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 740 }}>
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}