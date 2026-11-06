import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

// Socket.io connects via Vite proxy (/socket.io) — works on both desktop & mobile
const getSocketUrl = () => {
  // Use the current page origin so the Vite proxy handles it on any device
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
};
const SOCKET_URL = getSocketUrl();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        setConnected(true);
        newSocket.emit('register', user._id);
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) socket.close();
      setSocket(null);
      setConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
