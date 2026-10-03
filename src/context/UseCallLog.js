import {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";
import { useSocketEvent } from "../hooks/useSocketListener";

const isValidCallPayload = (data) => {
  if (!data || typeof data !== "object") return false;
  if (
    data.stat === 0 ||
    data.stat_code === 1001 ||
    (data.stat_code && data.stat_code !== 1000) ||
    data.rd?.[0]?.stat === 0 ||
    data.rd?.[0]?.stat_code === 1001
  ) {
    return false;
  }
  if (!data.sr || isNaN(Number(data.sr)) || Number(data.sr) <= 0) {
    return false;
  }
  return true;
};

const CallLogContext = createContext(null);

export function CallLogProvider(props) {
  const [callLog, setCallLog] = useState([]);
  const [CurrentCall, setCurrentCall] = useState(null);

  // Add Call Events
  useSocketEvent("AddCall", (data) => {
    if (!isValidCallPayload(data)) return;
   console.log(data,"AddCall")
  });

  // Accept Call Events
  useSocketEvent("AcceptCall", (data) => {
    if (!isValidCallPayload(data)) return;
      console.log(data,"AcceptCall")

  });

  // Forwarded Call Events
  useSocketEvent("ForwardedCall", (data) => {
    if (!isValidCallPayload(data)) return;
          console.log(data,"ForwardedCall")
  });

  const contextValue = useMemo(
    () => ({
      callLog,
      setCallLog,
      CurrentCall,
      setCurrentCall,
    }),
    [callLog, CurrentCall],
  );
  return (
    <CallLogContext.Provider value={contextValue}>
      {props.children}
    </CallLogContext.Provider>
  );
}

export function useCallLog() {
  if (!useContext(CallLogContext)) {
    throw new Error("useCallLog must be used within a CallLogProvider");
  }
  return useContext(CallLogContext);
}
