import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { communitiesService, usersService } from '../services';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { EmptyState } from '../components/shared/EmptyState';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [community, setCommunity] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const communityData = await communitiesService.getCommunity(id);
        setCommunity(communityData);

        const captainData = await usersService.getUser(communityData.captainId).catch(() => null);
        setCaptain(captainData);

        try {
          const [memberData, postData] = await Promise.all([
            communitiesService.listMembers(id),
            communitiesService.listCommunityPosts(id),
          ]);
          setMembers(memberData);
          setPosts(postData);
          setIsMember(true);
          const transferTarget = memberData.find(member => member.userId !== communityData.captainId);
          setSelectedCaptainId(transferTarget ? String(transferTarget.userId) : '');
        } catch (membershipError) {
          if (membershipError.message?.toLowerCase().includes('member')) {
            setMembers([]);
            setPosts([]);
            setIsMember(false);
          } else {
            throw membershipError;
          }
        }
      } catch (error) {
        showError(error.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id, showError]);

  const isCaptain = currentUser?.id === community?.captainId;

  const handleJoin = async () => {
    try {
      await communitiesService.joinCommunity(id);
      const [memberData, postData] = await Promise.all([
        communitiesService.listMembers(id),
        communitiesService.listCommunityPosts(id),
      ]);
      setMembers(memberData);
      setPosts(postData);
      setIsMember(true);
      showSuccess('Joined community!');
    } catch (error) {
      showError(error.message || 'Failed to join community');
    }
  };

  const handleLeave = async () => {
    try {
      await communitiesService.leaveCommunity(id);
      setMembers([]);
      setPosts([]);
      setIsMember(false);
      showSuccess('Left community');
    } catch (error) {
      showError(error.message || 'Failed to leave community');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await communitiesService.deleteCommunityPost(id, postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      showSuccess('Community post deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete community post');
    }
  };

  const handleTransferCaptaincy = async () => {
    try {
      await communitiesService.transferCaptaincy(id, selectedCaptainId);
      setCommunity(prev => ({ ...prev, captainId: Number(selectedCaptainId) }));
      const newCaptain = members.find(member => member.userId === Number(selectedCaptainId));
      if (newCaptain) {
        setCaptain({ id: newCaptain.userId, username: newCaptain.username });
      }
      showSuccess('Captaincy transferred');
    } catch (error) {
      showError(error.message || 'Failed to transfer captaincy');
    }
  };

  const handleDeleteCommunity = async () => {
    try {
      await communitiesService.deleteCommunity(id);
      showSuccess('Community deleted');
      navigate('/app/communities');
    } catch (error) {
      showError(error.message || 'Failed to delete community');
    }
  };

  const handleCommunityPostCreated = (createdPost) => {
    setPosts(prev => [createdPost, ...prev]);
  };

  const handleOpenPost = async (postId) => {
    try {
      const post = await communitiesService.getCommunityPost(id, postId);
      setSelectedPost(post);
    } catch (error) {
      showError(error.message || 'Failed to load community post');
    }
  };

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to view communities</div>;
  }

  if (loading) return <div style={{ padding: '24px', color: '#64748B' }}>Loading...</div>;
  if (!community) return <div style={{ padding: '24px', color: '#F1F5F9' }}>Community not found</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: '#1A1D27',
        borderRadius: '8px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '24px',
      }}>
        <h1 style={{ color: '#F1F5F9', fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
          {community.name}
        </h1>
        <p style={{ color: '#94A3B8', marginBottom: '16px' }}>{community.description}</p>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#64748B' }}>
          <div>
            Captain:{' '}
            <button
              onClick={() => captain?.username && navigate(`/app/u/${encodeURIComponent(captain.username)}`)}
              style={{ background: 'transparent', border: 'none', padding: 0, color: '#F1F5F9', cursor: captain?.username ? 'pointer' : 'default' }}
            >
              {captain?.username || `User #${community.captainId}`}
            </button>
          </div>
          <div>Members: <span style={{ color: '#F1F5F9' }}>{community.memberCount}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {!isMember ? (
            <button onClick={handleJoin} style={{ padding: '10px 14px', background: '#22C55E', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600 }}>Join Community</button>
          ) : (
            <>
              <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 14px', background: '#6C63FF', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600 }}>Create Community Post</button>
              {!isCaptain && (
                <button onClick={handleLeave} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#F1F5F9', cursor: 'pointer' }}>Leave Community</button>
              )}
            </>
          )}
          {isCaptain && (
            <button onClick={handleDeleteCommunity} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}>Delete Community</button>
          )}
        </div>
      </div>

      {isMember && (
        <div style={{ background: '#1A1D27', borderRadius: '8px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
          <h2 style={{ color: '#F1F5F9', marginBottom: 16, fontSize: '20px', fontWeight: 600 }}>Members</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: isCaptain ? 20 : 0 }}>
            {members.map(member => (
              <button
                key={member.userId}
                onClick={() => navigate(`/app/u/${encodeURIComponent(member.username)}`)}
                style={{ padding: '8px 12px', borderRadius: 999, background: member.role === 'captain' ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)', color: '#F1F5F9', border: 'none', cursor: 'pointer' }}
              >
                {member.username} · {member.role}
              </button>
            ))}
          </div>
          {isCaptain && members.some(member => member.userId !== community.captainId) && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select value={selectedCaptainId} onChange={e => setSelectedCaptainId(e.target.value)} style={{ padding: '10px 12px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}>
                {members.filter(member => member.userId !== community.captainId).map(member => (
                  <option key={member.userId} value={member.userId}>{member.username}</option>
                ))}
              </select>
              <button onClick={handleTransferCaptaincy} style={{ padding: '10px 14px', background: '#F59E0B', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600 }}>Transfer Captaincy</button>
            </div>
          )}
        </div>
      )}

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        communityId={community?.id}
        onCreated={handleCommunityPostCreated}
      />

      {selectedPost && (
        <div style={{ background: '#1A1D27', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <h2 style={{ color: '#F1F5F9', margin: 0 }}>{selectedPost.title}</h2>
            <button onClick={() => setSelectedPost(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>Close</button>
          </div>
          <div style={{ color: '#94A3B8', marginBottom: 12 }}>{selectedPost.content}</div>
          <div style={{ color: '#64748B', fontSize: 12 }}>
            <button onClick={() => navigate(`/app/u/${encodeURIComponent(selectedPost.authorName)}`)} style={{ background: 'transparent', border: 'none', padding: 0, color: '#64748B', cursor: 'pointer' }}>{selectedPost.authorName}</button> • {new Date(selectedPost.createdAt).toLocaleString()}
          </div>
        </div>
      )}

      <h2 style={{ color: '#F1F5F9', marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Posts</h2>

      {!isMember ? (
        <div style={{ color: '#94A3B8' }}>Join this community to view its members and posts.</div>
      ) : posts.length === 0 ? (
        <EmptyState type="posts" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map(post => (
            <div key={post.id} style={{ background: '#1A1D27', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>{post.title}</div>
                  <div style={{ color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>{post.content}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    <button onClick={() => navigate(`/app/u/${encodeURIComponent(post.authorName)}`)} style={{ background: 'transparent', border: 'none', padding: 0, color: '#64748B', cursor: 'pointer' }}>By {post.authorName}</button> • {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, height: 'fit-content' }}>
                  <button onClick={() => handleOpenPost(post.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}>View</button>
                  {(post.authorId === currentUser?.id || isCaptain) && (
                    <button onClick={() => handleDeletePost(post.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#EF4444', cursor: 'pointer', height: 'fit-content' }}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
