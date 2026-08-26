import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { FaBell, FaCheck, FaEnvelope, FaShoppingBag, FaCalendarCheck } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext) || {};
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data.notifications || data.data || []);
      setUnreadCount(
        data.unreadCount !== undefined
          ? data.unreadCount
          : (Array.isArray(data) ? data.filter(n => !n.isRead).length : 0)
      );
    } catch (e) {
      // Graceful fallback
    }
  }, [user]);

  // Initial load on mount & when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time notification updates via Socket
  useEffect(() => {
    if (!socket || !user) return;

    const handleUpdate = () => {
      fetchNotifications();
    };

    socket.on('notification_update', handleUpdate);
    socket.on('new_message_notification', handleUpdate);

    return () => {
      socket.off('notification_update', handleUpdate);
      socket.off('new_message_notification', handleUpdate);
    };
  }, [socket, user, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const markOneRead = async (notif) => {
    if (!notif.isRead && notif._id && !notif._id.startsWith('msg_')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
    setNotifications(prev => prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - (notif.isRead ? 0 : 1)));
  };

  const iconFor = (type) => {
    if (type === 'Message') return FaEnvelope;
    if (type === 'Order') return FaShoppingBag;
    if (type === 'Consultation') return FaCalendarCheck;
    return FaBell;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-surface-600 hover:text-brand-700 hover:bg-emerald-50/80 rounded-xl transition-all border border-transparent hover:border-emerald-200/60"
        aria-label="Notifications"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card shadow-2xl border border-surface-200 overflow-hidden z-50 animate-scale-up">
          <div className="px-4 py-3 border-b border-surface-100 flex justify-between items-center bg-surface-50/80">
            <h3 className="font-bold text-surface-900 text-xs font-display">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-brand-700 font-bold hover:underline flex items-center gap-1"
              >
                <FaCheck className="text-[10px]" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-saas">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-xs font-medium">No new notifications</div>
            ) : (
              notifications.map(n => {
                const Icon = iconFor(n.type);
                return (
                  <Link
                    key={n._id}
                    to={n.link || (user?.role === 'Expert' ? '/expert/messages' : '/chat')}
                    onClick={() => {
                      markOneRead(n);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-emerald-50/40 border-b border-surface-100 last:border-0 transition-colors ${
                      !n.isRead ? 'bg-emerald-50/60' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        n.type === 'Message'
                          ? 'bg-blue-100 text-blue-700'
                          : n.type === 'Order'
                          ? 'bg-emerald-100 text-brand-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Icon className="text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-surface-900 truncate font-display">{n.title}</p>
                      <p className="text-[11px] text-surface-600 line-clamp-2 mt-0.5 font-medium">{n.message}</p>
                      <p className="text-[10px] text-surface-400 mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 bg-brand-600 rounded-full shrink-0 mt-2"></span>}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
