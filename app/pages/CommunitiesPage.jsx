import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { communitiesService, usersService } from '../services';

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { communities, setCommunities, currentUser } = useApp();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [membershipState, setMembershipState] = useState({});
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    const loadCommunities = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await communitiesService.getAllCommunities();
        const captainIds = Array.from(new Set(response.map(community => community.captainId).filter(Boolean)));

        const captainEntries = await Promise.all(
          captainIds.map(async (captainId) => {
            if (captainId === currentUser.id) {
              return [captainId, currentUser];
            }

            try {
              const captain = await usersService.getUser(captainId);
              return [captainId, captain];
            } catch {
              return [captainId, null];
            }
          }),
        );

        const membershipEntries = await Promise.all(
          response.map(async (community) => {
            try {
              const members = await communitiesService.listMembers(community.id);
              return [community.id, members.some(member => member.userId === currentUser.id) ? 'joined' : 'left'];
            } catch {
              return [community.id, 'left'];
            }
          }),
        );

        const captainMap = Object.fromEntries(captainEntries);
        const membershipMap = Object.fromEntries(membershipEntries);

        setMembershipState(membershipMap);
        setCommunities(response.map(community => ({
          ...community,
          captainName: captainMap[community.captainId]?.username || `User #${community.captainId}`,
        })));
      } catch (error) {
        showError('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };
    loadCommunities();
  }, [currentUser, setCommunities, showError]);

  const handleJoinCommunity = async (communityId) => {
    try {
      await communitiesService.joinCommunity(communityId);
      setMembershipState(prev => ({ ...prev, [communityId]: 'joined' }));
      setCommunities(prev => prev.map(c => (
        c.id === communityId ? { ...c, memberCount: (c.memberCount || 0) + 1 } : c
      )));
      showSuccess('Joined community!');
    } catch (error) {
      showError(error.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await communitiesService.leaveCommunity(communityId);
      setMembershipState(prev => ({ ...prev, [communityId]: 'left' }));
      setCommunities(prev => prev.map(c => (
        c.id === communityId ? { ...c, memberCount: Math.max((c.memberCount || 1) - 1, 0) } : c
      )));
      showSuccess('Left community');
    } catch (error) {
      showError(error.message || 'Failed to leave community');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError('Community name is required');
      return;
    }

    setCreating(true);
    try {
      const community = await communitiesService.createCommunity(form.name, form.description);
      setCommunities(prev => [{
        ...community,
        captainName: currentUser.username,
      }, ...prev]);
      setMembershipState(prev => ({ ...prev, [community.id]: 'joined' }));
      setForm({ name: '', description: '' });
      showSuccess('Community created!', 'You are now the captain.');
    } catch (error) {
      showError(error.message || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to join communities</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#F1F5F9', marginBottom: '24px' }}>Communities</h1>

      <form onSubmit={handleCreateCommunity} style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: '2fr 3fr auto',
        marginBottom: 24,
        padding: 20,
        background: '#1A1D27',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <input
          type="text"
          placeholder="Community name"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          style={{ padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          style={{ padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}
        />
        <button
          type="submit"
          disabled={creating}
          style={{ padding: '12px 16px', background: '#6C63FF', border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {loading ? (
        <div style={{ color: '#64748B' }}>Loading communities...</div>
      ) : communities.length === 0 ? (
        <div style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>No communities yet</div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {communities.map(community => (
            <div key={community.id} style={{ padding: '20px', background: '#1A1D27', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ color: '#F1F5F9', marginBottom: '8px' }}>{community.name}</h2>
              <p style={{ color: '#94A3B8', marginBottom: '12px', fontSize: '14px' }}>{community.description}</p>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                {community.memberCount} members • Captain: {community.captainName}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/app/communities/${community.id}`)}
                  style={{
                    padding: '8px 16px', background: '#6C63FF', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Open
                </button>
                <button
                  onClick={() => handleJoinCommunity(community.id)}
                  style={{
                    padding: '8px 16px', background: membershipState[community.id] === 'joined' ? '#64748B' : '#22C55E',
                    border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {membershipState[community.id] === 'joined' ? 'Joined' : 'Join'}
                </button>
                <button
                  onClick={() => handleLeaveCommunity(community.id)}
                  style={{
                    padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#F1F5F9', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
