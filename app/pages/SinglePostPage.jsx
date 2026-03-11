import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import {
  buildUsersById,
  commentsService,
  filesService,
  postsService,
  reportsService,
  usersService,
  votesService,
} from '../services';
import { FileChip } from '../components/shared/FileChip';
import { VoteScore } from '../components/shared/VoteScore';

export default function SinglePostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [myPostIds, setMyPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [postVote, setPostVote] = useState(0);
  const [commentVotes, setCommentVotes] = useState({});
  const [editingPost, setEditingPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const [postData, allUsers, myPosts] = await Promise.all([
          postsService.getPost(id),
          usersService.getAllUsers().catch(() => []),
          postsService.getMyPosts().catch(() => []),
        ]);

        const usersById = buildUsersById([...(allUsers || []), currentUser].filter(Boolean));
        const [scoreData, rawComments] = await Promise.all([
          votesService.getPostScore(id).catch(() => ({ score: 0 })),
          commentsService.getPostComments(id, usersById).catch(() => []),
        ]);

        const enrichedComments = await Promise.all(
          rawComments.map(async (comment) => {
            const score = await votesService.getCommentScore(comment.id).catch(() => ({ score: 0 }));
            return { ...comment, votes: score.score ?? 0 };
          }),
        );

        setPost({
          ...postData,
          score: scoreData.score ?? 0,
        });
        setPostForm({ title: postData.title, content: postData.content });
        setComments(enrichedComments);
        setMyPostIds(myPosts.map(item => item.id));
      } catch (error) {
        showError(error.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadPost();
    }
  }, [currentUser, id, showError]);

  const canManagePost = myPostIds.includes(Number(id));

  const handlePostVote = async (direction) => {
    try {
      const nextVote = postVote === direction ? 0 : direction;
      await votesService.voteOnPost(id, nextVote);
      const score = await votesService.getPostScore(id);
      setPostVote(nextVote);
      setPost(prev => ({ ...prev, score: score.score ?? prev.score ?? 0 }));
    } catch (error) {
      showError(error.message || 'Failed to vote on post');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      showError('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      const newComment = await commentsService.createComment(id, commentText);
      const authorName = currentUser?.username || newComment.authorName;
      setComments(prev => [...prev, { ...newComment, authorName, votes: 0 }]);
      setCommentText('');
      showSuccess('Comment posted!');
    } catch (error) {
      showError(error.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const updated = await postsService.updatePost(id, postForm.title, postForm.content);
      setPost(prev => ({ ...prev, ...updated }));
      setEditingPost(false);
      showSuccess('Post updated', 'Your changes have been saved.');
    } catch (error) {
      showError(error.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await postsService.deletePost(id);
      showSuccess('Post deleted', 'The post has been removed.');
      navigate('/app');
    } catch (error) {
      showError(error.message || 'Failed to delete post');
    }
  };

  const handleReportPost = async () => {
    try {
      await reportsService.createReport({ postId: Number(id), reason: 'Reported from post detail' });
      showSuccess('Report submitted', 'The post has been sent for review.');
    } catch (error) {
      showError(error.message || 'Failed to report post');
    }
  };

  const handleCommentVote = async (commentId, direction) => {
    try {
      const currentVote = commentVotes[commentId] || 0;
      const nextVote = currentVote === direction ? 0 : direction;
      await votesService.voteOnComment(commentId, nextVote);
      const score = await votesService.getCommentScore(commentId);

      setCommentVotes(prev => ({ ...prev, [commentId]: nextVote }));
      setComments(prev => prev.map(comment => (
        comment.id === commentId ? { ...comment, votes: score.score ?? comment.votes ?? 0 } : comment
      )));
    } catch (error) {
      showError(error.message || 'Failed to vote on comment');
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleSaveComment = async (commentId) => {
    try {
      const updated = await commentsService.updateComment(commentId, editingCommentText);
      setComments(prev => prev.map(comment => (
        comment.id === commentId ? { ...comment, content: updated.content } : comment
      )));
      setEditingCommentId(null);
      setEditingCommentText('');
      showSuccess('Comment updated', 'Your comment has been edited.');
    } catch (error) {
      showError(error.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      showSuccess('Comment deleted', 'The comment has been removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete comment');
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      await reportsService.createReport({ commentId, reason: 'Reported from post detail' });
      showSuccess('Report submitted', 'The comment has been sent for review.');
    } catch (error) {
      showError(error.message || 'Failed to report comment');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await filesService.deleteFile(fileId);
      setPost(prev => ({
        ...prev,
        files: (prev.files || []).filter(file => file.id !== fileId),
      }));
      showSuccess('File deleted', 'The attachment has been removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete file');
    }
  };

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to view posts</div>;
  }

  if (loading) return <div style={{ padding: '24px', color: '#64748B' }}>Loading...</div>;
  if (!post) return <div style={{ padding: '24px', color: '#F1F5F9' }}>Post not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ background: '#1A1D27', borderRadius: '8px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        {editingPost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <input
              value={postForm.title}
              onChange={e => setPostForm(prev => ({ ...prev, title: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F1F5F9' }}
            />
            <textarea
              value={postForm.content}
              onChange={e => setPostForm(prev => ({ ...prev, content: e.target.value }))}
              style={{ width: '100%', minHeight: 140, padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F1F5F9', fontFamily: 'inherit' }}
            />
          </div>
        ) : (
          <>
            <h1 style={{ color: '#F1F5F9', marginBottom: '16px' }}>{post.title}</h1>
            <div style={{ color: '#94A3B8', marginBottom: '16px' }}>{post.content}</div>
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <VoteScore
            votes={post.score || 0}
            userVote={postVote}
            onUpvote={() => handlePostVote(1)}
            onDownvote={() => handlePostVote(-1)}
          />
          {canManagePost ? (
            <>
              <button
                onClick={() => setEditingPost(prev => !prev)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}
              >
                {editingPost ? 'Cancel Edit' : 'Edit Post'}
              </button>
              {editingPost && (
                <button
                  onClick={handleUpdatePost}
                  style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#6C63FF', color: 'white', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={handleDeletePost}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}
              >
                Delete Post
              </button>
            </>
          ) : (
            <button
              onClick={handleReportPost}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}
            >
              Report Post
            </button>
          )}
        </div>
        {post.files?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {post.files.map(file => (
              <FileChip
                key={file.id}
                file={file}
                onDelete={canManagePost ? () => handleDeleteFile(file.id) : undefined}
              />
            ))}
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          By {post.isAnonymous ? 'Anonymous' : (
            <button
              onClick={() => navigate(`/app/u/${encodeURIComponent(post.authorName)}`)}
              style={{ background: 'transparent', border: 'none', padding: 0, color: '#94A3B8', cursor: 'pointer' }}
            >
              {post.authorName}
            </button>
          )} • {new Date(post.createdAt).toLocaleDateString()} • {post.score || 0} votes
        </div>
      </div>

      <div style={{ background: '#1A1D27', borderRadius: '8px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ color: '#F1F5F9', marginBottom: '16px' }}>Comments ({comments.length})</h2>

        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%', padding: '12px 16px', background: '#252D3D',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
              color: '#F1F5F9', fontSize: '14px', minHeight: '100px', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handlePostComment}
            disabled={submittingComment}
            style={{
              marginTop: '12px', padding: '8px 16px', background: '#6C63FF',
              border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, 
              cursor: submittingComment ? 'not-allowed' : 'pointer',
              opacity: submittingComment ? 0.7 : 1,
            }}
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map(comment => (
            <div key={comment.id} style={{ padding: '16px', background: '#252D3D', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '4px' }}>
                    <button
                      onClick={() => navigate(`/app/u/${encodeURIComponent(comment.authorName)}`)}
                      style={{ background: 'transparent', border: 'none', padding: 0, color: '#F1F5F9', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {comment.authorName}
                    </button>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                      <textarea
                        value={editingCommentText}
                        onChange={e => setEditingCommentText(e.target.value)}
                        style={{ width: '100%', minHeight: 80, padding: '10px 12px', background: '#1A1D27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleSaveComment(comment.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#6C63FF', color: 'white', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingCommentId(null)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#94A3B8', marginBottom: '8px' }}>{comment.content}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '12px', color: '#64748B' }}>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <span>{comment.votes || 0} votes</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <VoteScore
                    votes={comment.votes || 0}
                    userVote={commentVotes[comment.id] || 0}
                    vertical
                    size="sm"
                    onUpvote={() => handleCommentVote(comment.id, 1)}
                    onDownvote={() => handleCommentVote(comment.id, -1)}
                  />
                  {comment.authorId === currentUser?.id ? (
                    <>
                      <button onClick={() => handleStartEditComment(comment)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDeleteComment(comment.id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>Delete</button>
                    </>
                  ) : (
                    <button onClick={() => handleReportComment(comment.id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F1F5F9', cursor: 'pointer' }}>Report</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
