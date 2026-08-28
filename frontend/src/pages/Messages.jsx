import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { fetchConversations, fetchMessages, createConversation, sendMessageRest } from '../services/conversationApi';
import { getSocket, disconnectSocket } from '../services/socket';
import { API_URL } from '../services/api';
import ProfileAvatar from '../components/ProfileAvatar';
import './Messages.css';

/* ───── helpers ───── */
function relativeTime(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return 'Yesterday';
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fullTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function shouldShowTimestamp(messages, index) {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt);
  const curr = new Date(messages[index].createdAt);
  return (curr - prev) > 5 * 60 * 1000; // 5 min gap
}

function isConsecutive(messages, index) {
  if (index === 0) return false;
  return messages[index].senderId === messages[index - 1].senderId
    && !shouldShowTimestamp(messages, index);
}

/* ───── skeleton components ───── */
function ConversationSkeleton() {
  return (
    <div className="conversation-skeleton">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-avatar pulse" />
          <div className="skeleton-text">
            <div className="skeleton-line skeleton-line-name pulse" />
            <div className="skeleton-line skeleton-line-msg pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="message-skeleton">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`skeleton-bubble ${i % 3 === 0 ? 'skeleton-mine' : 'skeleton-theirs'}`}>
          <div className="skeleton-bubble-inner pulse" />
        </div>
      ))}
    </div>
  );
}

/* ───── empty states ───── */
function EmptyInbox() {
  return (
    <div className="empty-state">
      <i className="fa-regular fa-comments empty-state-icon" />
      <h3>No messages yet</h3>
      <p>Start a conversation from a user's profile or service listing.</p>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="empty-state">
      <i className="fa-regular fa-paper-plane empty-state-icon" />
      <h3>Start the conversation</h3>
      <p>Send a message to get things going.</p>
    </div>
  );
}

function NoChatSelected() {
  return (
    <div className="empty-state">
      <i className="fa-regular fa-message empty-state-icon" />
      <h3>Select a conversation</h3>
      <p>Choose a message from the sidebar to start chatting.</p>
    </div>
  );
}

/* ───── MessageInput ───── */
function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '44px';
    const scrollH = ta.scrollHeight;
    if (scrollH > 44) {
      ta.style.height = Math.min(scrollH, 120) + 'px';
      ta.style.overflowY = scrollH > 120 ? 'auto' : 'hidden';
    } else {
      ta.style.height = '44px';
      ta.style.overflowY = 'hidden';
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => { adjustHeight(); }, [text]);

  return (
    <div className="msg-input-area">
      <textarea
        ref={textareaRef}
        className="msg-textarea"
        placeholder="Type a message…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        aria-label="Message input"
      />
      <button
        className="msg-send-btn"
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        aria-label="Send message"
      >
        <i className="fa-solid fa-paper-plane" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
const Messages = () => {
  const { currentUser, currentUserId } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const inputFocusRef = useRef(null);

  const targetUserId = searchParams.get('userId');
  const userIdNum = currentUser ? Number(currentUserId) : null;

  // Active conversation object
  const activeConv = conversations.find(c => c.id === activeConvId);

  /* ─── handle Escape key to close chat ─── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveConvId(null);
        setMobileShowChat(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ─── load conversations ─── */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!currentUser) return;

    const load = async () => {
      setLoadingConvs(true);
      try {
        const convos = await fetchConversations();
        setConversations(convos);

        // If URL has ?userId, find or create conversation with that user
        if (targetUserId && Number(targetUserId) !== userIdNum) {
          const existing = convos.find(c => c.otherUserId === Number(targetUserId));
          if (existing) {
            setActiveConvId(existing.id);
            setMobileShowChat(true);
          } else {
            // Create a new conversation
            const { id } = await createConversation(Number(targetUserId));
            // Re-fetch conversations to get the full data
            const updated = await fetchConversations();
            setConversations(updated);
            setActiveConvId(id);
            setMobileShowChat(true);
          }
          // Clear the userId param
          setSearchParams({}, { replace: true });
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConvs(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, targetUserId]);

  /* ─── load messages for active conv ─── */
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMsgs(true);
      try {
        const { messages: msgs, hasMore: more } = await fetchMessages(activeConvId);
        setMessages(msgs);
        setHasMore(more);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMsgs(false);
      }
    };

    loadMessages();
  }, [activeConvId]);

  /* ─── auto-scroll (only within the messages container, not the whole window) ─── */
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  /* ─── socket.io ─── */
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('new_message', (msg) => {
      if (msg.conversationId === activeConvId) {
        setMessages(prev => {
          // 1. If message with same real ID already exists, ignore
          if (prev.some(m => m.id === msg.id)) return prev;

          // 2. If this matches an optimistic temp message by clientMsgId, replace it
          if (msg.clientMsgId && prev.some(m => m.id === msg.clientMsgId)) {
            return prev.map(m => m.id === msg.clientMsgId ? msg : m);
          }

          // 3. Fallback: if sent by us and we have a matching temp message, replace it
          if (msg.senderId === userIdNum && prev.some(m => typeof m.id === 'string' && m.id.startsWith('temp-') && m.content === msg.content)) {
            let replaced = false;
            return prev.map(m => {
              if (!replaced && typeof m.id === 'string' && m.id.startsWith('temp-') && m.content === msg.content) {
                replaced = true;
                return msg;
              }
              return m;
            });
          }

          return [...prev, msg];
        });
      }
    });

    socket.on('conversation_updated', (update) => {
      setConversations(prev => {
        return prev.map(c => {
          if (c.id === update.conversationId) {
            const isActive = update.conversationId === activeConvId;
            return {
              ...c,
              lastMessage: update.lastMessage,
              lastMessageTime: update.lastMessageTime,
              lastMessageSenderId: update.lastMessageSenderId,
              unreadCount: isActive && update.lastMessageSenderId !== userIdNum
                ? c.unreadCount // Will be marked read immediately
                : update.lastMessageSenderId !== userIdNum
                  ? c.unreadCount + 1
                  : c.unreadCount,
            };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      });
    });

    return () => {
      socket.off('new_message');
      socket.off('conversation_updated');
    };
  }, [currentUser, activeConvId, userIdNum]);

  // Join/leave conversation room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConvId) return;

    socket.emit('join_conversation', activeConvId);
    socket.emit('mark_read', { conversationId: activeConvId });

    // Mark as read locally
    setConversations(prev =>
      prev.map(c => c.id === activeConvId ? { ...c, unreadCount: 0 } : c)
    );

    return () => {
      socket.emit('leave_conversation', activeConvId);
    };
  }, [activeConvId]);

  /* ─── send message ─── */
  const handleSend = useCallback(async (content) => {
    if (!activeConvId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId: activeConvId,
      senderId: userIdNum,
      content,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    // Optimistic UI
    setMessages(prev => [...prev, optimisticMsg]);

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('send_message', { conversationId: activeConvId, content, clientMsgId: tempId }, (response) => {
        if (response?.success) {
          // Replace temp message with real one, or remove tempId if real message was already added via new_message
          setMessages(prev => {
            if (prev.some(m => m.id === response.message.id)) {
              return prev.filter(m => m.id !== tempId);
            }
            return prev.map(m => m.id === tempId ? response.message : m);
          });
        }
      });
    } else {
      // REST fallback
      try {
        const real = await sendMessageRest(activeConvId, content);
        setMessages(prev => prev.map(m => m.id === tempId ? real : m));
      } catch (err) {
        console.error('Failed to send message:', err);
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    }
  }, [activeConvId, userIdNum]);

  /* ─── load older messages ─── */
  const loadOlder = async () => {
    if (!hasMore || messages.length === 0) return;
    const container = messagesContainerRef.current;
    const prevHeight = container?.scrollHeight || 0;

    const { messages: older, hasMore: more } = await fetchMessages(activeConvId, messages[0].id);
    setMessages(prev => [...older, ...prev]);
    setHasMore(more);

    // Maintain scroll position
    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - prevHeight;
      }
    });
  };

  /* ─── select conversation ─── */
  const selectConversation = (convId) => {
    setActiveConvId(convId);
    setMobileShowChat(true);
  };

  /* ─── filtered conversations ─── */
  const filtered = conversations.filter(c =>
    c.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  /* ─── cleanup ─── */
  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  if (!currentUser) {
    return <div className="messages-loading">Please log in to view messages.</div>;
  }

  return (
    <div className="messages-page">
      {/* ─── SIDEBAR ─── */}
      <aside className={`msg-sidebar ${mobileShowChat ? 'mobile-hidden' : ''}`}>
        <div className="msg-sidebar-header">
          <h2>Messages</h2>
        </div>

        <div className="msg-search-bar">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Search conversations"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="msg-conversation-list">
          {loadingConvs ? (
            <ConversationSkeleton />
          ) : filtered.length === 0 ? (
            conversations.length === 0 ? <EmptyInbox /> : (
              <div className="no-results">No conversations match your search.</div>
            )
          ) : (
            filtered.map(conv => (
              <button
                key={conv.id}
                className={`conv-item ${conv.id === activeConvId ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => selectConversation(conv.id)}
              >
                <ProfileAvatar
                  userId={conv.otherUserId}
                  name={conv.otherUserName}
                  hasProfilePicture={conv.otherHasPicture}
                  size="medium"
                />
                <div className="conv-info">
                  <div className="conv-top-row">
                    <span className="conv-name">{conv.otherUserName}</span>
                    <span className="conv-time">{relativeTime(conv.lastMessageTime)}</span>
                  </div>
                  <div className="conv-bottom-row">
                    <span className="conv-preview">
                      {conv.lastMessageSenderId === userIdNum && conv.lastMessage ? 'You: ' : ''}
                      {conv.lastMessage || 'No messages yet'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="conv-unread-badge" aria-label={`${conv.unreadCount} unread`}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ─── CHAT WINDOW ─── */}
      <main className={`msg-main ${!mobileShowChat ? 'mobile-hidden' : ''}`}>
        {activeConv ? (
          <>
            <div className="msg-chat-header">
              <button
                className="msg-back-btn"
                onClick={() => setMobileShowChat(false)}
                aria-label="Back to conversations"
              >
                <i className="fa-solid fa-arrow-left" />
              </button>
              <ProfileAvatar
                userId={activeConv.otherUserId}
                name={activeConv.otherUserName}
                hasProfilePicture={activeConv.otherHasPicture}
                size="small"
              />
              <div className="msg-chat-header-info">
                <h3>{activeConv.otherUserName}</h3>
              </div>
            </div>

            <div className="msg-chat-body" ref={messagesContainerRef}>
              {hasMore && (
                <button className="load-older-btn" onClick={loadOlder}>
                  Load earlier messages
                </button>
              )}

              {loadingMsgs ? (
                <MessageSkeleton />
              ) : messages.length === 0 ? (
                <EmptyChat />
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.senderId === userIdNum;
                  const consecutive = isConsecutive(messages, i);
                  const showTime = shouldShowTimestamp(messages, i);

                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <div className="msg-timestamp-divider">
                          <span>{fullTime(msg.createdAt)}</span>
                        </div>
                      )}
                      <div className={`msg-row ${isMine ? 'mine' : 'theirs'} ${consecutive ? 'consecutive' : ''}`}>
                        <div className="msg-bubble">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <NoChatSelected />
        )}
      </main>
    </div>
  );
};

export default Messages;
