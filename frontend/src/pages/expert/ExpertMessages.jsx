import { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../services/api';
import Avatar from '../../components/Avatar';
import BackButton from '../../components/BackButton';
import { FaPaperPlane, FaUserCircle, FaComments, FaCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ExpertMessages = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false); // Fake typing indicator state for visuals if needed
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket && activeChat) {
      const handleNewMessage = (payload) => {
        if (payload.conversationId === activeChat._id || payload.senderId === getOtherUser(activeChat)?._id) {
          setMessages(prev => [...prev, payload.message || payload]);
        }
      };

      socket.on('new_message_notification', handleNewMessage);
      socket.on('receive_message', handleNewMessage);

      return () => {
        socket.off('new_message_notification', handleNewMessage);
        socket.off('receive_message', handleNewMessage);
      };
    }
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const convList = data.data || data || [];
      setConversations(convList);
      if (convList.length > 0 && !activeChat) {
        openChat(convList[0]);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (conv) => {
    setActiveChat(conv);
    try {
      const token = localStorage.getItem('token');
      const other = getOtherUser(conv);
      const { data } = await axios.get(`${API_URL}/chat/messages/${other?._id || conv._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const convData = data.data || data;
      setMessages(convData.messages || []);
    } catch (err) {
      console.error('Open chat error:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const token = localStorage.getItem('token');
      const other = getOtherUser(activeChat);

      const { data } = await axios.post(
        `${API_URL}/chat/send`,
        {
          receiverId: other?._id,
          conversationId: activeChat._id,
          text: newMessage.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdMsg = data.data || { senderId: user._id, text: newMessage, createdAt: new Date() };
      setMessages(prev => [...prev, createdMsg]);
      setNewMessage('');
      
      // Update local conversation lastMessage
      setConversations(prev => prev.map(c => c._id === activeChat._id ? { ...c, lastMessage: newMessage } : c));
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to deliver message');
    }
  };

  const getOtherUser = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find(p => (p._id || p).toString() !== user?._id?.toString());
  };

  return (
    <div className="page-fade-in max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/expert/dashboard" label="Back to Expert Dashboard" />
      </div>

      <div className="card-saas glass-card flex flex-col md:flex-row h-[75vh] overflow-hidden">
        
        {/* Left Sidebar: Conversations */}
        <div className="w-full md:w-1/3 border-r border-surface-100 flex flex-col bg-surface-50/40">
          <div className="p-4 border-b border-surface-100 bg-white">
            <h2 className="card-heading text-sm uppercase tracking-wider flex items-center gap-2">
              <FaComments className="text-brand-700" /> Farmer Inquiries ({conversations.length})
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-saas divide-y divide-surface-100">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(n => <div key={n} className="h-16 rounded-xl skeleton-shimmer"></div>)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-xs">
                <FaUserCircle className="text-3xl mx-auto mb-2 text-surface-300" />
                No active farmer conversations yet.
              </div>
            ) : (
              conversations.map((conv, index) => {
                const other = getOtherUser(conv);
                const isSelected = activeChat?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => openChat(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-brand-50/60 transition-colors text-left stagger-${(index % 8) + 1} ${isSelected ? 'bg-brand-50 border-l-4 border-brand-700' : ''}`}
                  >
                    <Avatar src={other?.profileImage} name={other?.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-surface-900 truncate">{other?.name || 'Farmer'}</p>
                      <p className="text-[11px] text-surface-500 truncate mt-0.5">{conv.lastMessage || 'Open chat conversation'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Chat Feed */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-100 flex items-center gap-3 bg-white">
                <Avatar src={getOtherUser(activeChat)?.profileImage} name={getOtherUser(activeChat)?.name} size="sm" />
                <div>
                  <p className="font-bold text-xs text-surface-900">{getOtherUser(activeChat)?.name || 'Farmer'}</p>
                  <p className="text-[10px] text-brand-700 font-semibold">{getOtherUser(activeChat)?.location || 'Registered Client'}</p>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50/50 scrollbar-saas">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end msg-slide-in-right' : 'justify-start msg-slide-in-left'}`}>
                      <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm text-xs ${
                        isMe 
                          ? 'bg-brand-800 text-white rounded-br-none' 
                          : 'bg-white text-surface-900 border border-surface-200 rounded-bl-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-surface-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start msg-slide-in-left">
                    <div className="bg-white border border-surface-200 p-3 rounded-2xl rounded-bl-none flex gap-1">
                      <FaCircle className="text-[6px] text-surface-400 typing-dot-1" />
                      <FaCircle className="text-[6px] text-surface-400 typing-dot-2" />
                      <FaCircle className="text-[6px] text-surface-400 typing-dot-3" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-surface-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your expert advisory or recommendations..."
                  className="input-saas flex-1"
                />
                <button type="submit" className="btn-saas-primary !px-5">
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-surface-400 text-xs">
              Select a conversation to reply to farmers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertMessages;
