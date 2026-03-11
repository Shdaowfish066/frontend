import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { filesService, postsService, usersService } from '../services';
import { FileChip } from '../components/shared/FileChip';
import { EmptyState } from '../components/shared/EmptyState';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser } = useApp();
  const { showError } = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await usersService.getUserByUsername(username);
        const [authorPosts, uploadedFiles] = await Promise.all([
          postsService.getPostsByAuthor(profile.id).catch(() => []),
          filesService.getUserFiles(profile.id).catch(() => []),
        ]);
        setUser(profile);
        setPosts(authorPosts);
        setFiles(uploadedFiles);
      } catch (error) {
        showError(error.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [showError, username]);

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to view profiles</div>;
  }

  if (loading) {
    return <div style={{ padding: '24px', color: '#64748B' }}>Loading profile...</div>;
  }

  if (!user) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>User not found</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ background: '#1A1D27', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#F1F5F9', margin: 0, marginBottom: 8 }}>{user.username}</h1>
            <div style={{ color: '#94A3B8', marginBottom: 8 }}>{user.email}</div>
            <div style={{ display: 'flex', gap: 16, color: '#64748B', fontSize: 13 }}>
              <span>{posts.length} posts</span>
              <span>{files.length} uploads</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {currentUser.id !== user.id && (
            <button
              onClick={() => navigate(`/app/messages?user=${user.id}`)}
              style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#6C63FF', color: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              Message User
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#F1F5F9', marginBottom: 16 }}>Posts</h2>
        {posts.length === 0 ? (
          <EmptyState type="posts" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => navigate(`/app/post/${post.id}`)}
                style={{ textAlign: 'left', background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, cursor: 'pointer' }}
              >
                <div style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: 8 }}>{post.title}</div>
                <div style={{ color: '#94A3B8', marginBottom: 8 }}>{post.content.slice(0, 180)}{post.content.length > 180 ? '...' : ''}</div>
                <div style={{ color: '#64748B', fontSize: 12 }}>{new Date(post.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ color: '#F1F5F9', marginBottom: 16 }}>Uploads</h2>
        {files.length === 0 ? (
          <div style={{ color: '#64748B' }}>No uploads yet.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {files.map(file => (
              <FileChip key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}