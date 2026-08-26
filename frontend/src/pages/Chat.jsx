import { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { getConversations, getMessages, sendMessage } from '../services/chatService';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import { FaPaperPlane, FaImage, FaCircle, FaComments, FaSearch, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { socket, connected } = useContext(SocketContext);
  const [searchParams] = useSearchParams();
  const directReceiverId = searchParams.get('receiverId');

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (newMsg) => {
      if (activePartner && (newMsg.senderId === activePartner._id || newMsg.senderId === user?._id)) {
        setMessages((prev) => [...prev, newMsg]);
      }
      fetchConversations();
    });

    socket.on('user_typing', (data) => {
      if (activePartner && data.senderId === activePartner._id) {
        setIsPartnerTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [socket, activePartner, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getConversations();
      const list = res.data || [];
      setConversations(list);

      if (directReceiverId) {
        // Find existing or initialize partner for direct chat
        const found = list.find((c) =>
          c.participants?.some((p) => p._id === directReceiverId)
        );
        if (found) {
          const partner = found.participants.find((p) => p._id !== user?._id);
          selectPartner(partner);
        } else {
          // Direct open with receiver ID
          selectPartner({ _id: directReceiverId, name: 'Agricultural Specialist' });
        }
      } else if (list.length > 0 && !activePartner) {
        const firstPartner = list[0].participants?.find((p) => p._id !== user?._id);
        if (firstPartner) selectPartner(firstPartner);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPartner = async (partner) => {
    setActivePartner(partner);
    setIsPartnerTyping(false);
    try {
      const res = await getMessages(partner._id);
      setMessages(res.data?.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && activePartner) {
      socket.emit('typing', {
        senderId: user?._id,
        receiverId: activePartner._id,
        isTyping: true
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          senderId: user?._id,
          receiverId: activePartner._id,
          isTyping: false
        });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !activePartner) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('receiverId', activePartner._id);
      if (inputText.trim()) formData.append('text', inputText.trim());
      if (selectedImage) formData.append('image', selectedImage);

      const res = await sendMessage(formData);
      const newMsg = res.data;

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setSelectedImage(null);

      // Emit socket event to notify receiver
      if (socket) {
        socket.emit('send_message', {
          receiverId: activePartner._id,
          message: newMsg
        });
      }

      fetchConversations();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-fade-in max-w-7xl mx-auto px-4 py-8">
      <div className="card-saas p-0 overflow-hidden shadow-premium flex flex-col md:flex-row h-[750px]">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-surface-200 flex flex-col bg-white">
          <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/70">
            <div>
              <h2 className="font-bold text-sm text-surface-900 font-display flex items-center gap-2">
                <FaComments className="text-brand-700" /> Messages
              </h2>
              <p className="text-[11px] text-surface-400 mt-0.5 font-medium">Farmer & Agronomist Network</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-surface-600 bg-white px-2.5 py-1 rounded-full border border-surface-200 shadow-sm">
              <FaCircle className={`text-[8px] ${connected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span>{connected ? 'Live' : 'Connecting'}</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-surface-100">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-14 bg-surface-100 rounded-2xl skeleton-shimmer"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-xs font-medium">
                No active conversations yet. Start a discussion from an Agronomist profile or farmer listing!
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.participants?.find((p) => p._id !== user?._id) || {};
                const isSelected = activePartner?._id === partner._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => selectPartner(partner)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-brand-700' : 'hover:bg-surface-50'
                    }`}
                  >
                    <Avatar src={partner.profileImage} name={partner.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-surface-900 truncate font-display">{partner.name || 'User'}</span>
                        <span className="text-[10px] text-surface-400 font-medium">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-surface-500 truncate font-medium">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Message Thread */}
        <div className="flex-1 flex flex-col bg-surface-50/50">
          {activePartner ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-surface-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar src={activePartner.profileImage} name={activePartner.name} size="md" />
                  <div>
                    <h3 className="font-bold text-sm text-surface-900 font-display">{activePartner.name}</h3>
                    <p className="text-[11px] text-emerald-700 font-bold">{activePartner.role || 'Agricultural Specialist'}</p>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-surface-400 text-xs font-medium">
                    This is the start of your message thread with <span className="font-bold text-surface-700">{activePartner.name}</span>.
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                    return (
                      <div key={msg._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                            isMine
                              ? 'bg-gradient-to-tr from-brand-800 to-emerald-700 text-white rounded-br-none'
                              : 'bg-white text-surface-900 border border-surface-200 rounded-bl-none'
                          }`}
                        >
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Attached crop"
                              className="rounded-xl max-h-48 w-full object-cover mb-2 border border-white/20"
                            />
                          )}
                          {msg.text && <p className="font-medium">{msg.text}</p>}
                          <span
                            className={`block text-[9px] mt-1 text-right font-medium ${
                              isMine ? 'text-emerald-200' : 'text-surface-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {isPartnerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-surface-500 rounded-2xl rounded-bl-none px-4 py-2 text-xs border border-surface-200 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-surface-400 ml-1 font-medium">{activePartner.name} is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-4 bg-white border-t border-surface-200">
                {selectedImage && (
                  <div className="mb-2 flex items-center gap-2 bg-emerald-50 p-2.5 rounded-xl text-xs text-brand-900 border border-emerald-200">
                    <FaImage className="text-brand-600" />
                    <span className="truncate flex-1 font-semibold">{selectedImage.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="text-red-500 font-bold hover:text-red-700 text-xs px-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl text-surface-500 hover:text-brand-700 hover:bg-emerald-50 transition-colors"
                    title="Attach Image"
                  >
                    <FaImage className="text-base" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className="hidden"
                  />

                  <input
                    type="text"
                    placeholder="Type an advisory query, crop health question, or response..."
                    value={inputText}
                    onChange={handleInputChange}
                    className="input-saas flex-1 text-xs"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !selectedImage)}
                    className="btn-saas-primary text-xs !py-2.5 !px-4 shadow-sm"
                  >
                    <FaPaperPlane className="text-xs" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-surface-400">
              <FaComments className="text-5xl text-emerald-200 mb-3" />
              <h3 className="card-heading text-base text-surface-700 mb-1 font-display">Select a Conversation</h3>
              <p className="text-xs max-w-sm font-medium">
                Choose a contact from the sidebar or reach out directly to an agronomist specialist.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
