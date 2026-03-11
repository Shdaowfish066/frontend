import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { commentsService, postsService, reportsService, votesService } from '../services';
import { MessageCircle, Trash2 } from 'lucide-react';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { FileChip } from '../components/shared/FileChip';
import { VoteScore } from '../components/shared/VoteScore';

export default function FeedPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ownedPostIds, setOwnedPostIds] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const [allPosts, myPosts] = await Promise.all([
          postsService.getAllPosts(),
          postsService.getMyPosts().catch(() => []),
        ]);

        const enrichedPosts = await Promise.all(
          allPosts.map(async (post) => {
            const [score, comments] = await Promise.all([
              votesService.getPostScore(post.id).catch(() => ({ score: 0 })),
              commentsService.getPostComments(post.id).catch(() => []),
            ]);

            return {
              ...post,
              score: score.score ?? 0,
              commentCount: comments.length,
            };
          }),
        );

        setPosts(enrichedPosts);
        setOwnedPostIds(myPosts.map(post => post.id));
      } catch (error) {
        showError(error.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [showError]);

  const handleVote = async (postId, direction) => {
    try {
      const currentVote = userVotes[postId] || 0;
      const nextVote = currentVote === direction ? 0 : direction;

      await votesService.voteOnPost(postId, nextVote);
      const score = await votesService.getPostScore(postId);

      setUserVotes(prev => ({
        ...prev,
        [postId]: nextVote,
      }));

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, score: score.score ?? post.score ?? 0 };
        }
        return post;
      }));

    } catch (error) {
      showError(error.message || 'Failed to vote');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await postsService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setOwnedPostIds(prev => prev.filter(id => id !== postId));
      showSuccess('Post deleted', 'The post has been removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete post');
    }
  };

  const handleReport = async (postId) => {
    try {
      await reportsService.createReport({ postId, reason: 'Reported from feed' });
      showSuccess('Report submitted', 'The post has been sent for review.');
    } catch (error) {
      showError(error.message || 'Failed to report post');
    }
  };

  const handleCreated = (createdPost) => {
    setOwnedPostIds(prev => [createdPost.id, ...prev]);
    setPosts(prev => [
      {
        ...createdPost,
        score: 0,
        commentCount: 0,
      },
      ...prev,
    ]);
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#F1F5F9' }}>
        <p>Please log in to view posts</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#F1F5F9', margin: 0 }}>Feed</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 16px',
            background: '#6C63FF',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Create Post
        </button>
      </div>
      
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />

      {loading ? (
        <div style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>No posts yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map(post => (
            <div
              key={post.id}
              style={{
                padding: '16px',
                background: '#1A1D27',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Voting Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  minWidth: '50px',
                }}>
                  <VoteScore
                    votes={post.score || 0}
                    userVote={userVotes[post.id] || 0}
                    vertical
                    onUpvote={() => handleVote(post.id, 1)}
                    onDownvote={() => handleVote(post.id, -1)}
                  />
                </div>

                {/* Post Content */}
                <div style={{ flex: 1 }}>
                  <h2
                    onClick={() => navigate(`/app/post/${post.id}`)}
                    style={{
                      color: '#F1F5F9',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 600,
                    }}
                  >
                    {post.title}
                  </h2>
                  <p style={{ color: '#94A3B8', marginBottom: '12px', margin: '8px 0' }}>
                    {post.content && post.content.substring(0, 150)}
                    {post.content && post.content.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748B' }}>
                    {post.isAnonymous ? (
                      <span>By Anonymous</span>
                    ) : (
                      <button
                        onClick={() => navigate(`/app/u/${encodeURIComponent(post.authorName)}`)}
                        style={{ background: 'transparent', border: 'none', padding: 0, color: '#94A3B8', cursor: 'pointer' }}
                      >
                        By {post.authorName || 'Unknown'}
                      </button>
                    )}
                    <span>•</span>
                    <span>{new Date(post.created_at || post.createdAt).toLocaleDateString()}</span>
                  </div>
                  {post.files?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      {post.files.map(file => (
                        <FileChip key={file.id} file={file} />
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <button
                    onClick={() => navigate(`/app/post/${post.id}`)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageCircle size={18} />
                    <span style={{ fontSize: '12px' }}>{post.commentCount || 0}</span>
                  </button>
                  {ownedPostIds.includes(post.id) ? (
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(239,68,68,0.4)',
                        borderRadius: 6,
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReport(post.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        color: '#F1F5F9',
                        cursor: 'pointer',
                        padding: '6px 10px',
                      }}
                    >
                      Report
                    </button>
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
