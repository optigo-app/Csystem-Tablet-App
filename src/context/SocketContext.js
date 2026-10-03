import React, { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "../apis/SocketController";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket] = useState(() => socketService.init());

  useEffect(() => {
    return () => socket.disconnect();
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
