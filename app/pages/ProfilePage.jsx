import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { authService, communitiesService, filesService, postsService, usersService } from '../services';
import { FileChip } from '../components/shared/FileChip';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, setIsAuthenticated, setCurrentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(currentUser);
  const [stats, setStats] = useState({ posts: 0, communitiesLed: 0, uploads: 0 });
  const [myPosts, setMyPosts] = useState([]);
  const [myFiles, setMyFiles] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      try {
        const [user, posts, files, communities] = await Promise.all([
          usersService.getCurrentUser(),
          postsService.getMyPosts(),
          filesService.getUserFiles(currentUser.id),
          communitiesService.getAllCommunities().catch(() => []),
        ]);

        setProfile(user);
        setCurrentUser(user);
        setMyPosts(posts);
        setMyFiles(files);
        setStats({
          posts: posts.length,
          communitiesLed: communities.filter(community => community.captainId === user.id).length,
          uploads: files.length,
        });
      } catch (error) {
        showError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, setCurrentUser, showError]);

  const handleSaveProfile = async () => {
    if (!profile?.username?.trim() || !profile?.email?.trim()) {
      showError('Username and email are required');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await usersService.updateCurrentUser({
        username: profile.username,
        email: profile.email,
      }, currentUser.id);
      setProfile(updatedUser);
      setCurrentUser(updatedUser);
      showSuccess('Profile updated', 'Your account details are saved.');
    } catch (error) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently?');
    if (!confirmed) {
      return;
    }

    try {
      await usersService.deleteCurrentUser(currentUser.id);
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      navigate('/auth');
    } catch (error) {
      showError(error.message || 'Failed to delete account');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showSuccess('Logged out', 'See you next time!');
    navigate('/');
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsService.deletePost(postId);
      setMyPosts(prev => prev.filter(post => post.id !== postId));
      setStats(prev => ({ ...prev, posts: Math.max(prev.posts - 1, 0) }));
      showSuccess('Post deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete post');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await filesService.deleteFile(fileId);
      setMyFiles(prev => prev.filter(file => file.id !== fileId));
      setStats(prev => ({ ...prev, uploads: Math.max(prev.uploads - 1, 0) }));
      showSuccess('File deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete file');
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#F1F5F9' }}>
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#F1F5F9', marginBottom: '24px' }}>Profile</h1>

      <div style={{
        background: '#1A1D27',
        borderRadius: '8px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(108,99,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#6C63FF', fontSize: '32px' }}>
              {currentUser.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 style={{ color: '#F1F5F9', fontSize: '20px', fontWeight: 600, margin: 0, marginBottom: '4px' }}>
              {profile?.username}
            </h2>
            <p style={{ color: '#94A3B8', margin: 0 }}>
              {profile?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
          <input
            type="text"
            value={profile?.username || ''}
            onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))}
            style={{ padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}
          />
          <input
            type="email"
            value={profile?.email || ''}
            onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
            style={{ padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}
          />
          <button
            onClick={handleSaveProfile}
            disabled={saving || loading}
            style={{ padding: '12px 16px', background: '#6C63FF', border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(108,99,255,0.1)',
            borderRadius: '8px',
          }}>
            <div style={{ color: '#6C63FF', fontWeight: 600, marginBottom: '4px' }}>Posts</div>
            <div style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 700 }}>{stats.posts}</div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(34,197,94,0.1)',
            borderRadius: '8px',
          }}>
            <div style={{ color: '#22C55E', fontWeight: 600, marginBottom: '4px' }}>Communities Led</div>
            <div style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 700 }}>{stats.communitiesLed}</div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(56,189,248,0.1)',
            borderRadius: '8px',
          }}>
            <div style={{ color: '#38BDF8', fontWeight: 600, marginBottom: '4px' }}>Uploads</div>
            <div style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 700 }}>{stats.uploads}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#F1F5F9', marginBottom: 12 }}>My Posts</h3>
          {myPosts.length === 0 ? (
            <div style={{ color: '#64748B' }}>No posts yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myPosts.map(post => (
                <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 8, background: '#252D3D' }}>
                  <div>
                    <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{post.title}</div>
                    <div style={{ color: '#64748B', fontSize: 12 }}>{new Date(post.createdAt).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleDeletePost(post.id)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#F1F5F9', marginBottom: 12 }}>Uploaded Files</h3>
          {myFiles.length === 0 ? (
            <div style={{ color: '#64748B' }}>No uploaded files.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {myFiles.map(file => (
                <FileChip key={file.id} file={file} onDelete={() => handleDeleteFile(file.id)} />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#EF4444',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '16px',
          }}
        >
          <LogOut size={16} /> Log Out
        </button>
        <button
          onClick={handleDeleteAccount}
          style={{ width: '100%', marginTop: 12, padding: '12px 16px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#EF4444', fontWeight: 600, cursor: 'pointer', fontSize: '16px' }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
