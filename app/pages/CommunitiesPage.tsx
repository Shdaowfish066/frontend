import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Plus, Users, Calendar, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { CaptainBadge } from '../components/shared/RoleBadge';
import { EmptyState } from '../components/shared/EmptyState';

const COMMUNITY_COLORS = ['#6C63FF', '#22C55E', '#38BDF8', '#F59E0B', '#EF4444', '#A78BFA', '#EC4899'];

export default function CommunitiesPage() {
  const { communities, joinCommunity, leaveCommunity, createCommunity, currentUser } = useApp();
  const { showSuccess, showCelebration } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', color: COMMUNITY_COLORS[0] });

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = (e: React.MouseEvent, id: string, joined: boolean) => {
    e.stopPropagation();
    if (joined) {
      leaveCommunity(id);
      showSuccess('Left community', 'You have left this community.');
    } else {
      joinCommunity(id);
      showSuccess('Joined!', 'Welcome to the community.');
    }
  };

  const handleCreate = () => {
    if (!createForm.name.trim()) return;
    const community = createCommunity({ name: createForm.name.trim(), description: createForm.description.trim(), color: createForm.color });
    showCelebration(community.name);
    setShowCreate(false);
    setCreateForm({ name: '', description: '', color: COMMUNITY_COLORS[0] });
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 24, letterSpacing: '-0.5px' }}>Communities</h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>{communities.length} communities · {communities.filter(c => c.joined).length} joined</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg,#6C63FF,#5B53F5)',
            border: 'none', borderRadius: 10, padding: '10px 18px',
            color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
          }}
        >
          <Plus size={16} /> Create Community
        </motion.button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search communities…"
          style={{
            width: '100%', background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '12px 14px 12px 40px', color: '#F1F5F9', fontSize: 14,
            outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#6C63FF'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState type="communities" />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {filtered.map((community, i) => {
            const isCaptain = community.captainId === currentUser.id;
            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: `0 12px 40px ${community.color}25` }}
                onClick={() => navigate(`/communities/${community.id}`)}
                style={{
                  background: '#1A1D27',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${community.color}60`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {/* Color bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: community.color, borderRadius: '12px 12px 0 0',
                }} />

                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 14,
                  background: `${community.color}20`,
                  border: `2px solid ${community.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: community.color,
                }}>
                  {community.name[0]}
                </div>

                {/* Name + badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <h3 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{community.name}</h3>
                  {isCaptain && <CaptainBadge />}
                </div>

                {/* Description */}
                <p style={{
                  color: '#64748B', fontSize: 13, lineHeight: 1.5, marginBottom: 16,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {community.description}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8', fontSize: 12 }}>
                      <Users size={12} /> {community.memberCount.toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: 11 }}>
                      <Calendar size={11} /> {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={e => handleJoin(e, community.id, community.joined)}
                    style={{
                      border: community.joined ? `1px solid ${community.color}60` : `1px solid ${community.color}`,
                      background: community.joined ? `${community.color}15` : community.color,
                      borderRadius: 24, padding: '5px 14px',
                      color: community.joined ? community.color : 'white',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {community.joined ? 'Joined ✓' : 'Join'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#22263A', borderRadius: 16, padding: '28px', maxWidth: 480, width: '100%',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18 }}>Create Community</h2>
                <button onClick={() => setShowCreate(false)} style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
                  padding: 8, cursor: 'pointer', color: '#64748B', display: 'flex',
                }}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name *</label>
                  <input
                    value={createForm.name}
                    onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. DevCraft"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                      padding: '11px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="What's this community about?"
                    rows={3}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                      padding: '11px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none',
                      resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accent Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COMMUNITY_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setCreateForm(p => ({ ...p, color: c }))}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                          outline: createForm.color === c ? `3px solid white` : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setShowCreate(false)} style={{
                  flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '11px', color: '#64748B', cursor: 'pointer', fontSize: 14,
                }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={!createForm.name.trim()}
                  style={{
                    flex: 2, background: createForm.name.trim() ? '#6C63FF' : 'rgba(108,99,255,0.3)',
                    border: 'none', borderRadius: 8, padding: '11px',
                    color: 'white', cursor: createForm.name.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  👑 Create Community
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
