import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface OnlineUser {
  email: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: OnlineUser[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user?.email) return;

    const API_URL = process.env.REACT_APP_API_URL;

    // ⛔ якщо API не заданий — просто не підключаємось
    if (!API_URL) {
      console.warn("[socket] API URL not set, skipping socket");
      return;
    }

    try {
      console.log("[socket] connecting to:", API_URL);

      const socket = io(API_URL, {
        auth: { email: user.email },
        transports: ["websocket"],
        withCredentials: true,
      });

      socketRef.current = socket;

      socket.on("online-users-update", (users: any[]) => {
        if (!Array.isArray(users)) return;
        setOnlineUsers(
          users.filter(
            (u) => u && typeof u.email === "string"
          )
        );
      });

      socket.on("connect_error", (err) => {
        console.warn("[socket] connect error:", err.message);
      });

      socket.on("disconnect", () => {
        setOnlineUsers([]);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setOnlineUsers([]);
      };
    } catch (e) {
      console.warn("[socket] init failed", e);
    }
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
