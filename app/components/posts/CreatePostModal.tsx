import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Paperclip, HelpCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp, FileAttachment } from '../../store/AppContext';
import { useToast } from '../../store/ToastContext';
import { FileChip } from '../shared/FileChip';

type Props = {
  open: boolean;
  onClose: () => void;
  communityId?: string;
  editPost?: { id: string; title: string; content: string; anonymous: boolean; files: FileAttachment[] };
};

export function CreatePostModal({ open, onClose, communityId, editPost }: Props) {
  const { createPost, updatePost } = useApp();
  const { showSuccess, showUpload, upgradeToSuccess } = useToast();
  const [title, setTitle] = useState(editPost?.title || '');
  const [content, setContent] = useState(editPost?.content || '');
  const [anonymous, setAnonymous] = useState(editPost?.anonymous || false);
  const [files, setFiles] = useState<FileAttachment[]>(editPost?.files || []);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editPost;

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (isEdit) {
      updatePost(editPost.id, { title, content, anonymous, files });
      showSuccess('Post Updated!', 'Your changes have been saved.');
    } else {
      createPost({ title, content, anonymous, files, communityId });
      showSuccess('Post Published!', 'Your post is now live on the feed.');
    }
    onClose();
    setTitle('');
    setContent('');
    setAnonymous(false);
    setFiles([]);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (rawFiles: File[]) => {
    rawFiles.forEach(f => {
      const toastId = showUpload(f.name);
      const attachment: FileAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: f.name, size: f.size, type: f.type,
      };
      setTimeout(() => {
        setFiles(prev => [...prev, attachment]);
        upgradeToSuccess(toastId);
      }, 1500 + Math.random() * 1000);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '40px 24px', overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#22263A',
              borderRadius: 16,
              width: '100%',
              maxWidth: 640,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18 }}>
                {isEdit ? 'Edit Post' : 'Create Post'}
              </h2>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
                padding: 8, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center',
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Post title…"
                  maxLength={200}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '12px 14px',
                    color: '#F1F5F9', fontSize: 16, fontWeight: 600, outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Content */}
              <div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What's on your mind? Share your thoughts…"
                  rows={8}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '12px 14px',
                    color: '#F1F5F9', fontSize: 14, lineHeight: 1.6,
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Anonymous toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#94A3B8', fontSize: 14 }}>Post Anonymously</span>
                  <div
                    style={{ position: 'relative', cursor: 'help' }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <HelpCircle size={14} color="#475569" />
                    {showTooltip && (
                      <div style={{
                        position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
                        background: '#22263A', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '8px 12px', width: 200, zIndex: 10,
                        color: '#94A3B8', fontSize: 12, lineHeight: 1.4,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      }}>
                        Your name won't be visible to other users on this post.
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAnonymous(v => !v)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {anonymous
                    ? <ToggleRight size={28} color="#6C63FF" />
                    : <ToggleLeft size={28} color="#475569" />
                  }
                </button>
              </div>

              {/* File upload */}
              <div>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, padding: '20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: isDragging ? 'rgba(108,99,255,0.05)' : 'transparent',
                  }}
                >
                  <Upload size={20} color={isDragging ? '#6C63FF' : '#475569'} />
                  <p style={{ color: isDragging ? '#6C63FF' : '#64748B', fontSize: 13 }}>
                    {isDragging ? 'Drop files here!' : 'Drag & drop files, or click to upload'}
                  </p>
                  <p style={{ color: '#475569', fontSize: 11 }}>Any file type supported</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />

                {files.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {files.map(f => (
                      <div key={f.id} style={{ position: 'relative' }}>
                        <FileChip file={f} showDownload={false} />
                        <button
                          onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                          style={{
                            position: 'absolute', top: -6, right: -6,
                            background: '#EF4444', border: 'none', borderRadius: '50%',
                            width: 16, height: 16, cursor: 'pointer', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 10,
            }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  padding: '12px', color: '#64748B', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!title.trim()}
                style={{
                  flex: 2, background: title.trim() ? '#6C63FF' : 'rgba(108,99,255,0.3)',
                  border: 'none', borderRadius: 8, padding: '12px',
                  color: 'white', cursor: title.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 600,
                  boxShadow: title.trim() ? '0 4px 16px rgba(108,99,255,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isEdit ? 'Save Changes' : '✦ Publish Post'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
