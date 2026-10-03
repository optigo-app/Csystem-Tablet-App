import React, { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();

const DEFAULT_PREFS = {
  browserEnabled: false,
  inAppEnabled: true,
  soundEnabled: true,
  onNewCall: true,
  onTicketCreate: true,
  onTicketUpdate: true,
  onComment: true,
};

const loadPrefs = () => {
  try {
    const stored = localStorage.getItem("notif_prefs");
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
};

export const NotificationProvider = ({ children }) => {
  const [promptOpen, setPromptOpen] = useState(false);
  const [enabledOpen, setEnabledOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(loadPrefs);

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      const t = setTimeout(() => setPromptOpen(true), 3000);
      return () => clearTimeout(t);
    }

    if (Notification.permission === "granted") {
      setEnabledOpen(true);
      setNotifPrefs((prev) => {
        if (!prev.browserEnabled) {
          const next = { ...prev, browserEnabled: true };
          try {
            localStorage.setItem("notif_prefs", JSON.stringify(next));
          } catch {}
          return next;
        }
        return prev;
      });
    } else if (Notification.permission === "denied") {
      setNotifPrefs((prev) => {
        if (prev.browserEnabled) {
          const next = { ...prev, browserEnabled: false };
          try {
            localStorage.setItem("notif_prefs", JSON.stringify(next));
          } catch {}
          return next;
        }
        return prev;
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return "unsupported";
    try {
      const status = await Notification.requestPermission();
      if (status === "granted") {
        try {
          new Notification("Notifications enabled!", {
            body: "You'll receive real-time updates.",
          });
        } catch (e) {
          console.log("Test notification error:", e);
        }
        setEnabledOpen(true);
        updatePref("browserEnabled", true);
      } else {
        updatePref("browserEnabled", false);
      }
      setPromptOpen(false);
      return status;
    } catch (err) {
      console.error("requestPermission error:", err);
      return "denied";
    }
  };

  const updatePref = (key, value) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("notif_prefs", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        promptOpen,
        enabledOpen,
        setPromptOpen,
        setEnabledOpen,
        requestPermission,
        notifPrefs,
        updatePref,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationManager = () => useContext(NotificationContext);
