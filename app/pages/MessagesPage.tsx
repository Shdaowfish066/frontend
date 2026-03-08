import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip } from 'lucide-react';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { EmptyState } from '../components/shared/EmptyState';
import { MessageSkeleton } from '../components/shared/SkeletonCard';

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748B' }}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const { conversations, sendMessage, currentUser } = useApp();
  const { showSuccess, showUpload, upgradeToSuccess } = useToast();
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id || null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<any>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length]);

  const handleSend = () => {
    if (!messageText.trim() || !activeConvId) return;
    sendMessage(activeConvId, messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (v: string) => {
    setMessageText(v);
    setIsTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !activeConvId) return;
    const file = e.target.files[0];
    const toastId = showUpload(file.name);
    setTimeout(() => {
      sendMessage(activeConvId, ``, {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name, size: file.size, type: file.type,
      });
      upgradeToSuccess(toastId);
    }, 1500);
  };

  const formatMsgTime = (iso: string) => {
    const d = new Date(iso);
    return isToday(d) ? format(d, 'h:mm a') : format(d, 'MMM d, h:mm a');
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Conversation list */}
      <div style={{
        width: 300, borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18 }}>Messages</h2>
        </div>

        {loading ? (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        ) : conversations.length === 0 ? (
          <EmptyState type="messages" />
        ) : (
          conversations.map(conv => (
            <motion.div
              key={conv.id}
              whileHover={{ background: 'rgba(255,255,255,0.04)' }}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: activeConvId === conv.id ? 'rgba(108,99,255,0.1)' : 'transparent',
                borderLeft: activeConvId === conv.id ? '3px solid #6C63FF' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {/* Avatar with online indicator */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={conv.participantAvatar} alt="" style={{
                  width: 42, height: 42, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, borderRadius: '50%',
                  background: conv.online ? '#22C55E' : '#475569',
                  border: '2px solid #0F1117',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500 }}>{conv.participantName}</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                  </span>
                </div>
                <p style={{
                  color: '#64748B', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', marginTop: 2,
                }}>
                  {conv.lastMessage}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState type="messages" />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{ position: 'relative' }}>
                <img src={activeConv.participantAvatar} alt="" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '2px solid rgba(108,99,255,0.3)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 10, height: 10, borderRadius: '50%',
                  background: activeConv.online ? '#22C55E' : '#475569',
                  border: '2px solid #0F1117',
                }} />
              </div>
              <div>
                <p style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 15 }}>{activeConv.participantName}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                    background: activeConv.online ? '#22C55E' : '#475569',
                  }} />
                  <span style={{ color: activeConv.online ? '#22C55E' : '#64748B' }}>
                    {activeConv.online ? 'Online' : 'Offline'}
                  </span>
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeConv.messages.map((msg, i) => {
                const isMe = msg.senderId === currentUser.id;
                const showTime = i === 0 || (new Date(msg.createdAt).getTime() - new Date(activeConv.messages[i - 1].createdAt).getTime()) > 300000;
                return (
                  <React.Fragment key={msg.id}>
                    {showTime && (
                      <div style={{ textAlign: 'center', color: '#475569', fontSize: 11, margin: '8px 0' }}>
                        {formatMsgTime(msg.createdAt)}
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{
                        display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-end', gap: 8,
                      }}
                    >
                      {!isMe && (
                        <img src={activeConv.participantAvatar} alt="" style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          border: '1.5px solid rgba(255,255,255,0.1)',
                        }} />
                      )}
                      <div style={{ maxWidth: '65%' }}>
                        {msg.file ? (
                          <div style={{
                            background: isMe ? 'rgba(108,99,255,0.2)' : '#1A1D27',
                            border: `1px solid ${isMe ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: 10, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 8, background: 'rgba(108,99,255,0.15)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C63FF', fontSize: 18,
                            }}>📎</div>
                            <div>
                              <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500 }}>{msg.file.name}</p>
                              <p style={{ color: '#64748B', fontSize: 11 }}>{(msg.file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            background: isMe ? '#6C63FF' : '#1A1D27',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            padding: '10px 14px',
                            boxShadow: isMe ? '0 4px 12px rgba(108,99,255,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                          }}>
                            <p style={{ color: '#F1F5F9', fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}

              {/* Typing indicator */}
              {activeConv.online && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <img src={activeConv.participantAvatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
                  <div style={{ background: '#1A1D27', borderRadius: '16px 16px 16px 4px', overflow: 'hidden' }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0,
            }}>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '10px', cursor: 'pointer', color: '#64748B',
                  display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6C63FF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >
                <Paperclip size={18} />
              </button>
              <textarea
                value={messageText}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                  padding: '11px 14px', color: '#F1F5F9', fontSize: 14,
                  outline: 'none', resize: 'none', fontFamily: 'inherit',
                  lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!messageText.trim()}
                style={{
                  background: messageText.trim() ? '#6C63FF' : 'rgba(108,99,255,0.2)',
                  border: 'none', borderRadius: 10, padding: '10px',
                  cursor: messageText.trim() ? 'pointer' : 'not-allowed', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                  boxShadow: messageText.trim() ? '0 4px 12px rgba(108,99,255,0.4)' : 'none',
                }}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}