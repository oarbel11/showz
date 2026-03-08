import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../services/api';
import { io } from 'socket.io-client';
import { Search, MoreHorizontal, Send, Image as ImageIcon, Check, CheckCheck } from 'lucide-react';

const ROLE_LABELS = {
  actor: 'שחקן/ית', director: 'במאי/ת', producer: 'מפיק/ה', writer: 'תסריטאי/ת',
  cinematographer: 'צלם/ת', editor: 'עורך/ת', agent: 'סוכן/ת', other: 'אחר',
};

export default function MessagesView() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load conversations
  useEffect(() => {
    chatApi.conversations()
      .then(data => {
        setConversations(data.conversations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('new_message', (message) => {
      // Don't duplicate messages we sent ourselves (already added optimistically)
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          // Update the optimistic message with server data (mark as delivered)
          return prev.map(m => m.id === message.id ? { ...message, delivered: true } : m);
        }
        return [...prev, { ...message, delivered: true }];
      });
      // Update conversations list with last message
      setConversations(prev => prev.map(c => {
        if (c.id === message.conversation_id) {
          return { ...c, last_message: message.content, last_message_at: message.created_at };
        }
        return c;
      }));
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [token]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConv) return;
    chatApi.messages(selectedConv.id)
      .then(data => setMessages(data.messages.map(m => ({ ...m, delivered: true }))))
      .catch(console.error);

    if (socketRef.current) {
      socketRef.current.emit('join_conversation', selectedConv.id);
    }
  }, [selectedConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !selectedConv) return;
    const content = messageText.trim();

    // Optimistic: add message immediately with a temp ID
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: tempId,
      conversation_id: selectedConv.id,
      sender_id: user.id,
      sender_name: user.name,
      sender_avatar: user.avatar,
      content,
      created_at: new Date().toISOString(),
      delivered: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Update conversation sidebar immediately
    setConversations(prev => prev.map(c => {
      if (c.id === selectedConv.id) {
        return { ...c, last_message: content, last_message_at: optimisticMsg.created_at };
      }
      return c;
    }));

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        conversationId: selectedConv.id,
        content,
      });
      // Mark as delivered after a short delay (server echo will update with real ID)
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, delivered: true } : m));
      }, 1000);
    } else {
      // Fallback to REST API
      chatApi.sendMessage(selectedConv.id, content)
        .then(data => {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...data.message, delivered: true } : m));
        })
        .catch(console.error);
    }

    setMessageText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 h-[calc(100vh-6rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex h-full overflow-hidden">
        {/* Conversations Sidebar */}
        <div className={`w-full md:w-80 border-l border-gray-200 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">הודעות</h2>
            <div className="mt-4 relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש באנשי קשר..."
                className="w-full bg-white border border-gray-300 rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400 animate-pulse-soft">טוען שיחות...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-lg mb-1">אין הודעות עדיין</p>
                <p className="text-sm">עבור לעמוד קולגות כדי להתחיל שיחה</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConv?.id === conv.id ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 overflow-hidden">
                    {conv.otherUser?.avatar ? (
                      <img src={conv.otherUser.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      conv.otherUser?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-medium truncate text-gray-800">{conv.otherUser?.name || 'משתמש'}</h4>
                      <span className="text-xs text-gray-400">{formatTime(conv.last_message_at)}</span>
                    </div>
                    <p className="text-sm truncate text-gray-500">{conv.last_message || 'שיחה חדשה'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#F8F9FA] ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button className="md:hidden text-gray-400 mr-2" onClick={() => setSelectedConv(null)}>←</button>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                    {selectedConv.otherUser?.avatar ? (
                      <img src={selectedConv.otherUser.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedConv.otherUser?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedConv.otherUser?.name}</h3>
                    <p className="text-xs text-gray-500">{ROLE_LABELS[selectedConv.otherUser?.role] || ''}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <p>התחילו שיחה! 👋</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end mr-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto overflow-hidden ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                          {msg.sender_avatar ? (
                            <img src={msg.sender_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.sender_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div className={`rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-bl-sm' : 'bg-white border border-gray-200 rounded-br-sm'}`}>
                          <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.content}</p>
                          <span className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-indigo-200 justify-end' : 'text-gray-400'}`}>
                            {formatTime(msg.created_at)}
                            {isMe && (
                              msg.delivered
                                ? <CheckCheck className="w-3 h-3 text-indigo-200" />
                                : <Check className="w-3 h-3 text-indigo-300 opacity-50" />
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="הקלד הודעה..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none min-h-[44px] max-h-32"
                      rows="1"
                    ></textarea>
                  </div>
                  <button
                    onClick={handleSend}
                    className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition-colors shrink-0 shadow-sm flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-xl mb-2">בחרו שיחה</p>
                <p className="text-sm">או התחילו שיחה חדשה מעמוד הקולגות</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
