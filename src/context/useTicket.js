import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./UseAuth";
import { useSocketEvent } from "../hooks/useSocketListener";
import { useNavigate } from "react-router-dom";

export const TicketContext = React.createContext();

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshComment, setRefreshComment] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTicketDirty, setIsTicketDirty] = useState(false);

  const setNotificationInstance = useCallback((fn) => {
    notificationRef.current = fn;
  }, []);

  const showNotify = useCallback((payload) => {
    if (notificationRef.current) {
      notificationRef.current(payload);
    } else {
      console.warn("Notification instance not registered yet");
    }
  }, []);

  const handleRefresh = () => {
    setRefreshComment(!refresh);
  };

  useEffect(() => {
    const channel = new BroadcastChannel("notification_channel");
    channel.onmessage = (event) => {
      if (event?.data?.type !== "NOTIFICATION_CLICK") return;
      const payload = event.data.payload;
      if (payload?.group === "TICKET") {
        if (window.location.pathname !== "/ticket") {
          navigate("/ticket");
        }
        setSelectedTicket(payload);
      }
    };
    return () => channel.close();
  }, [navigate]);

  // 🔹 SOCKET EVENT HANDLERS  ✅
  useSocketEvent("CreateTicket", (data) => {
    if (data?.CreatedBy === user?.fullName) return;

    setTickets((prev) => {
      const exists = prev.some((t) => t.TicketNo === data.TicketNo);
      if (exists) return prev;
      return [data, ...prev];
    });
  });

  useSocketEvent("TicketComment", (data) => {
    setTickets((prev) =>
      prev.map((t) => (t.TicketNo === data?.TicketNo ? { ...t, ...data } : t)),
    );
    setSelectedTicket((prev) => {
      if (prev?.TicketNo === data?.TicketNo) {
        return { ...prev, ...data };
      }
      return prev;
    });
    setRefreshComment((prev) => !prev);
  });

  useSocketEvent("CloseTicket", (data) => {
    setTickets((prev) =>
      prev.map((t) => (t.TicketNo === data.TicketNo ? { ...t, ...data } : t)),
    );
    setSelectedTicket((prev) => {
      if (prev?.TicketNo === data?.TicketNo) {
        return { ...prev, ...data };
      }
      return prev;
    });
  });

  useSocketEvent("UpdateTicket", (data) => {
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t?.TicketNo === data?.TicketNo);
      if (idx === -1) return [data, ...prev];
      const updated = [...prev];
      updated[idx] = { ...prev[idx], ...data };
      const [ticket] = updated.splice(idx, 1);
      return [ticket, ...updated];
    });
    setSelectedTicket((prev) => {
      if (prev?.TicketNo === data?.TicketNo) {
        return { ...prev, ...data };
      }
      return prev;
    });
    setRefreshComment((prev) => !prev);
  });

  return (
    <TicketContext.Provider
      value={{
        tickets,
        setTickets,
        selectedTicket,
        setSelectedTicket,
        loading,
        setLoading,
        refresh,
        setRefresh,
        refreshComment,
        handleRefresh,
        setNotificationInstance,
        showNotify,
        isInitialLoading,
        setIsInitialLoading,
        isTicketDirty,
        setIsTicketDirty,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicket must be used within a TicketProvider");
  }
  return context;
};
