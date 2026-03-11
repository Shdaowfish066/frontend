import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import {
  buildUsersById,
  groupConversations,
  messagesService,
  normalizeMessage,
  usersService,
  wsService,
} from '../services';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const { conversations, setConversations, currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const requestedUserId = searchParams.get('user');

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const usersResponse = await usersService.getAllUsers();
        const map = buildUsersById(usersResponse);
        const [inbox, sent] = await Promise.all([
          messagesService.getInbox(),
          messagesService.getSent(),
        ]);
        const conversationList = groupConversations([...inbox, ...sent], currentUser?.id, map);

        setUsers(usersResponse);
        setUsersById(map);
        setConversations(conversationList);
        if (requestedUserId) {
          setActiveUserId(Number(requestedUserId));
        } else if (!activeUserId) {
          setActiveUserId(conversationList[0]?.participantId || usersResponse[0]?.id || null);
        }
      } catch (error) {
        showError(error.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadConversations();
    }
  }, [activeUserId, currentUser, requestedUserId, setConversations, showError]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!activeUserId) {
        setMessages([]);
        return;
      }

      try {
        const conversationMessages = await messagesService.getConversation(activeUserId);
        setMessages(conversationMessages);

        const unreadIncoming = conversationMessages.filter(message => message.recipientId === currentUser?.id && !message.isRead);
        if (unreadIncoming.length > 0) {
          await Promise.all(unreadIncoming.map(message => messagesService.markAsRead(message.id).catch(() => null)));
          setMessages(prev => prev.map(message => (
            unreadIncoming.some(item => item.id === message.id) ? { ...message, isRead: true } : message
          )));
        }
      } catch (error) {
        showError(error.message || 'Failed to load conversation');
      }
    };

    if (currentUser) {
      loadConversation();
    }
  }, [activeUserId, currentUser, showError]);

  useEffect(() => {
    if (!activeUserId) {
      wsService.disconnect();
      return undefined;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    const handleMessage = (rawMessage) => {
      const message = normalizeMessage(rawMessage);
      if (!message) {
        return;
      }

      if (message.senderId !== Number(activeUserId) && message.recipientId !== Number(activeUserId)) {
        return;
      }

      setMessages(prev => prev.some(item => item.id === message.id) ? prev : [...prev, message]);
      setConversations(prev => {
        const merged = groupConversations(
          [...prev.flatMap(conversation => conversation.messages || []), message],
          currentUser?.id,
          usersById,
        );
        return merged;
      });
    };

    wsService.on('message', handleMessage);
    wsService.connect(token, activeUserId).catch(() => null);

    return () => {
      wsService.off('message', handleMessage);
      wsService.disconnect();
    };
  }, [activeUserId, currentUser?.id, setConversations, usersById]);

  const refreshConversations = async () => {
    const [inbox, sent] = await Promise.all([
      messagesService.getInbox(),
      messagesService.getSent(),
    ]);
    setConversations(groupConversations([...inbox, ...sent], currentUser?.id, usersById));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeUserId) return;

    try {
      if (wsService.isConnected()) {
        wsService.sendMessage({ content: messageText });
      } else {
        const sentMessage = await messagesService.sendMessage(activeUserId, messageText);
        setMessages(prev => [...prev, sentMessage]);
      }

      setMessageText('');
      await refreshConversations();
    } catch (error) {
      showError(error.message || 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesService.deleteMessage(messageId);
      setMessages(prev => prev.filter(message => message.id !== messageId));
      await refreshConversations();
      showSuccess('Message deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete message');
    }
  };

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to view messages</div>;
  }

  const activeUser = users.find(user => user.id === Number(activeUserId)) || null;
  const activeConversation = conversations.find(conversation => conversation.participantId === Number(activeUserId));

  return (
    <div style={{ display: 'flex', height: '100%', gap: '16px', padding: '24px' }}>
      {/* Conversations list */}
      <div style={{ width: '300px', background: '#1A1D27', borderRadius: '8px', overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
        {loading ? (
          <div style={{ padding: '16px', color: '#64748B' }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '16px', color: '#64748B' }}>No users available yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {users.map(user => {
              const conversation = conversations.find(item => item.participantId === user.id);
              return (
              <button
                key={user.id}
                onClick={() => setActiveUserId(user.id)}
                style={{
                  padding: '16px', border: 'none', background: Number(activeUserId) === user.id ? 'rgba(108,99,255,0.1)' : 'transparent',
                  borderLeft: Number(activeUserId) === user.id ? '3px solid #6C63FF' : 'none',
                  cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ fontWeight: 600, color: '#F1F5F9' }}>{user.username}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{conversation?.lastMessage || 'No messages yet'}</div>
                {conversation?.unreadCount > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#F59E0B' }}>{conversation.unreadCount} unread</div>
                )}
              </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1A1D27', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        {activeUser ? (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, color: '#F1F5F9' }}>
              {activeUser.username}
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                    maxWidth: '60%', padding: '12px 16px',
                    background: msg.senderId === currentUser.id ? '#6C63FF' : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px', color: '#F1F5F9', fontSize: '14px',
                  }}
                >
                  <div style={{ marginBottom: 6 }}>{msg.content}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Delete</button>
                  </div>
                </div>
              ))}
              {activeConversation && messages.length === 0 && (
                <div style={{ color: '#64748B' }}>No messages in this conversation yet.</div>
              )}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#F1F5F9', fontSize: '14px',
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '12px 24px', background: '#6C63FF', border: 'none',
                  borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
