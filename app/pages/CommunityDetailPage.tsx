import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Users, Crown, UserMinus, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { PostCard } from '../components/posts/PostCard';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { CaptainBadge, MemberBadge } from '../components/shared/RoleBadge';
import { EmptyState } from '../components/shared/EmptyState';
import { Post } from '../store/AppContext';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { communities, posts, joinCommunity, leaveCommunity, currentUser } = useApp();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');
  const [showCreate, setShowCreate] = useState(false);
  const [editPost, setEditPost] = useState<Post | undefined>();

  const community = communities.find(c => c.id === id);
  if (!community) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: '#64748B' }}>Community not found.</p>
      <button onClick={() => navigate('/communities')} style={{
        marginTop: 16, background: '#6C63FF', border: 'none', borderRadius: 8,
        padding: '10px 20px', color: 'white', cursor: 'pointer',
      }}>Back to Communities</button>
    </div>
  );

  const communityPosts = posts.filter(p => p.communityId === community.id);
  const isCaptain = community.captainId === currentUser.id;
  const isMember = community.members.some(m => m.id === currentUser.id);

  // Generate a gradient based on community name
  const gradientIndex = community.name.charCodeAt(0) % 5;
  const gradients = [
    `linear-gradient(135deg, ${community.color}40, ${community.color}10)`,
    `linear-gradient(135deg, ${community.color}30, rgba(56,189,248,0.2))`,
    `linear-gradient(135deg, rgba(108,99,255,0.3), ${community.color}20)`,
    `linear-gradient(135deg, ${community.color}25, rgba(34,197,94,0.15))`,
    `linear-gradient(135deg, rgba(56,189,248,0.2), ${community.color}30)`,
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Back */}
      <div style={{ padding: '16px 24px 0' }}>
        <button onClick={() => navigate('/communities')} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 14,
        }}>
          <ArrowLeft size={16} /> Communities
        </button>
      </div>

      {/* Banner */}
      <div style={{
        height: 160, background: gradients[gradientIndex],
        borderBottom: `1px solid ${community.color}30`,
        display: 'flex', alignItems: 'flex-end',
        padding: '0 28px 20px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flex: 1 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: community.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white',
            border: '3px solid #0F1117',
            boxShadow: `0 8px 24px ${community.color}60`,
          }}>
            {community.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 22 }}>{community.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8', fontSize: 13 }}>
                <Users size={13} /> {community.memberCount.toLocaleString()} members
              </span>
              <span style={{ color: '#64748B', fontSize: 12 }}>
                Captain: <span style={{ color: '#F59E0B' }}>👑 {community.captainName}</span>
              </span>
              <span style={{ color: '#64748B', fontSize: 12 }}>
                Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          {/* Join/Leave button */}
          <div style={{ flexShrink: 0 }}>
            {!isMember ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { joinCommunity(community.id); showSuccess('Joined!', `Welcome to ${community.name}.`); }}
                style={{
                  background: community.color, border: 'none', borderRadius: 10,
                  padding: '10px 20px', color: 'white', fontWeight: 600, cursor: 'pointer',
                  fontSize: 14, boxShadow: `0 4px 16px ${community.color}50`,
                }}
              >
                Join Community
              </motion.button>
            ) : !isCaptain && (
              <button
                onClick={() => { leaveCommunity(community.id); showSuccess('Left', `You left ${community.name}.`); navigate('/communities'); }}
                style={{
                  background: 'transparent', border: `1px solid rgba(239,68,68,0.4)`,
                  borderRadius: 10, padding: '10px 20px', color: '#EF4444',
                  fontWeight: 500, cursor: 'pointer', fontSize: 14,
                }}
              >
                Leave
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {community.description && (
        <div style={{ padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6 }}>{community.description}</p>
        </div>
      )}

      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 28px', position: 'sticky', top: 0, background: '#0F1117', zIndex: 10,
      }}>
        {(['posts', 'members'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '14px 20px', color: activeTab === tab ? '#F1F5F9' : '#64748B',
              fontWeight: activeTab === tab ? 600 : 400, fontSize: 14,
              textTransform: 'capitalize', position: 'relative',
            }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="community-tab"
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                  background: community.color, borderRadius: 2,
                }}
              />
            )}
          </button>
        ))}

        {isMember && activeTab === 'posts' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEditPost(undefined); setShowCreate(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: community.color, border: 'none', borderRadius: 8,
                padding: '8px 14px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> New Post
            </motion.button>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 28px' }}>
        {/* Non-member gate */}
        {!isMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'relative', minHeight: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Blurred post previews */}
            <div style={{ position: 'absolute', inset: 0, filter: 'blur(12px)', opacity: 0.4 }}>
              {communityPosts.slice(0, 2).map(p => (
                <div key={p.id} style={{
                  background: '#1A1D27', borderRadius: 12, padding: 20, margin: '0 0 12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <p style={{ color: '#94A3B8' }}>{p.title}</p>
                </div>
              ))}
            </div>
            {/* Overlay */}
            <div style={{
              position: 'relative', zIndex: 2, textAlign: 'center',
              background: 'rgba(15,17,23,0.85)', borderRadius: 16,
              padding: '40px 32px', border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}><Lock size={40} color={community.color} /></div>
              <h3 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                🔒 This community is private
              </h3>
              <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>
                Join to see posts and participate in discussions.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { joinCommunity(community.id); showSuccess('Joined!', `Welcome to ${community.name}.`); }}
                style={{
                  background: community.color, border: 'none', borderRadius: 10,
                  padding: '12px 28px', color: 'white', fontWeight: 600, cursor: 'pointer',
                  fontSize: 15, boxShadow: `0 4px 16px ${community.color}50`,
                }}
              >
                Request to Join
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Posts tab */}
        {isMember && activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 740 }}>
            {communityPosts.length === 0 ? (
              <EmptyState type="posts" />
            ) : (
              communityPosts.map(p => (
                <PostCard key={p.id} post={p} onEdit={post => { setEditPost(post); setShowCreate(true); }} />
              ))
            )}
          </div>
        )}

        {/* Members tab */}
        {isMember && activeTab === 'members' && (
          <div style={{ maxWidth: 600 }}>
            {community.members.length === 0 ? (
              <EmptyState type="members" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {community.members.map(member => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: '#1A1D27', borderRadius: 10, padding: '14px 16px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <img src={member.avatar} alt={member.username} style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: member.role === 'captain' ? '2px solid #FBBF24' : '2px solid rgba(255,255,255,0.1)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500 }}>{member.username}</span>
                    </div>
                    {member.role === 'captain' ? <CaptainBadge /> : <MemberBadge />}
                    {isCaptain && member.id !== currentUser.id && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{
                          background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#EF4444', fontSize: 12,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <UserMinus size={12} /> Remove
                        </button>
                        {member.role !== 'captain' && (
                          <button style={{
                            background: 'transparent', border: '1px solid rgba(251,191,36,0.3)',
                            borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#FBBF24', fontSize: 12,
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <Crown size={12} /> Make Captain
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreatePostModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setEditPost(undefined); }}
        communityId={community.id}
        editPost={editPost ? {
          id: editPost.id, title: editPost.title, content: editPost.content,
          anonymous: editPost.anonymous, files: editPost.files,
        } : undefined}
      />
    </div>
  );
}