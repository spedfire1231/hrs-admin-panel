import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface OnlineUser {
  email: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: OnlineUser[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // ⛔ чекаємо поки auth 100% готовий
    if (loading) return;
    if (!user?.email) return;

    console.log('[socket] creating with email:', user.email);

    const socket = io(process.env.REACT_APP_API_URL!, {
      auth: { email: user.email },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('online-users-update', (users: any[]) => {
      const safe = Array.isArray(users)
        ? users.filter(u => u && typeof u.email === 'string')
        : [];
      setOnlineUsers(safe);
    });

    socket.on('disconnect', () => {
      setOnlineUsers([]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loading, user?.email]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
