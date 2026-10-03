import { useContext, createContext, useState, useEffect } from "react";
import { BaseAPI } from "../apis/BaseAPI";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocketEvent } from "../hooks/useSocketListener";

const AuthContext = createContext(null);

const SERVICE_CONFIG = {
  TICKET: {
    SERVICE_NAME: "Ticket",
    VERSION_NO: "_Ticketv4",
    SP: "14",
  },
  CALL_LOG: {
    SERVICE_NAME: "CallLog",
    VERSION_NO: "v4",
    SP: "14",
  },
};

const PUBLIC_ROUTES = [
  "",
  "/",
  "/login",
  "/passwordlogin",
  "/expired",
  "/expiredscreen",
  "/disabled",
  "/disabledscreen",
  "/noconnectionscreen",
  "/no-connection",
  "/home",
  "/homescreen",
]; // public and app managed pages

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [detectedSession, setDetectedSession] = useState(null);
  const [services, setServices] = useState({
    ticket: false,
    callLog: false,
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [CompanyInfo, SetCompanyInfo] = useState(null);
  const [UserRights, setUserRights] = useState(() => {
    const stored = sessionStorage.getItem("UserRights");
    return stored ? JSON.parse(stored) : [];
  });
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_accounts_list") || "[]");
    } catch {
      return [];
    }
  });

  const clearState = () => {
    setUser(null);
    setToken(null);
    setServices({
      ticket: false,
      callLog: false,
    });
  };

  const removeSavedAccount = (companyCode, email) => {
    const updated = savedAccounts.filter(
      (acc) =>
        !(
          acc.companyCode?.toLowerCase() === companyCode?.toLowerCase() &&
          acc.email?.toLowerCase() === email?.toLowerCase()
        ),
    );
    setSavedAccounts(updated);
    localStorage.setItem("saved_accounts_list", JSON.stringify(updated));
  };

  const getToken = async (userId) => {
    try {
      const res = await BaseAPI.getToken(userId);
      if (res?.rd1?.[0] && res?.rd?.[0]) {
        const user = {
          ...res.rd1[0],
          fullName: `${res.rd1[0].firstname} ${res.rd1[0].lastname}`,
        };
        SetCompanyInfo({ ...res?.rd?.[0], ...res?.rd1[0] });
        setUser(user);
        setToken(res.rd[0]);
        const rights = res?.rd3 ?? [];
        setUserRights(rights);
        sessionStorage.setItem("UserRights", JSON.stringify(rights));

        // Save account metadata in saved accounts list
        try {
          const activeSkey = Cookies.get("skey");
          if (activeSkey) {
            localStorage.setItem("app_active_skey", activeSkey);
            const savedList = JSON.parse(
              localStorage.getItem("saved_accounts_list") || "[]",
            );
            const newAccount = {
              companyCode:
                res.rd[0]?.companycode || res.rd1[0]?.companycode || "",
              email: userId || user.email || user.userid || "",
              skey: activeSkey,
              firstname: user.firstname || "",
              lastname: user.lastname || "",
              designation: user.designation || "",
              lastActive: Date.now(),
            };

            const filtered = savedList.filter(
              (acc) =>
                !(
                  acc.companyCode.toLowerCase() ===
                    newAccount.companyCode.toLowerCase() &&
                  acc.email.toLowerCase() === newAccount.email.toLowerCase()
                ),
            );
            filtered.push(newAccount);
            localStorage.setItem(
              "saved_accounts_list",
              JSON.stringify(filtered),
            );
          }
        } catch (e) {
          console.error("Failed to update saved accounts list:", e);
        }

        return res;
      }
      throw new Error("Invalid token response");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const updateVersion = async (version) => {
    setIsUpdate(true);
    try {
      await BaseAPI.UpdateVersion(version);
      setIsUpdate(false);
    } catch (error) {
      console.error("Error updating version:", error);
      setIsUpdate(false);
    }
  };

  const initializeService = (service, credentials) => {
    if (!credentials) return false;

    const config = {
      YEAR_CODE: credentials.yc,
      SV: credentials.sv,
      SP: service.SP,
      APP_USER_ID: credentials.userId,
      VERSION_NO: service.VERSION_NO,
    };

    BaseAPI.initialize(config, service.SERVICE_NAME);
    return true;
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data === "CHECK_COOKIE") {
              const activeCookie = Cookies.get("skey");
              const appActiveSkey = localStorage.getItem("app_active_skey");
              if (!activeCookie || activeCookie !== appActiveSkey) {
                console.log(
                  "Session cookie missing or mismatch in background check",
                );
                clearState();
                localStorage.removeItem("app_active_skey");
              }
            }
          };

          window.swChannel = messageChannel;
          const targetWorker =
            registration.active || registration.waiting || registration.installing;
          if (targetWorker) {
            targetWorker.postMessage("START_TIMER", [messageChannel.port2]);
          }
        })
        .catch((err) => {
          console.error("Service worker error:", err);
        });

      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Global SW message received:", event.data);
      });
    }

    return () => {
      if (
        window.swChannel?.port1 &&
        typeof window.swChannel.port1.close === "function"
      ) {
        window.swChannel.port1.close();
      }
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for skey in URL query parameters first
        const params = new URLSearchParams(window.location.search);
        const urlSkey = params.get("skey");

        if (urlSkey) {
          console.log("Found skey in URL, setting cookie...");
          const cookieOptions = { path: "/", sameSite: "Lax" };
          Cookies.set("skey", urlSkey, cookieOptions);

          // Clean the query parameter from the URL to keep it tidy
          params.delete("skey");
          const newSearch = params.toString();
          const newPath =
            window.location.pathname + (newSearch ? `?${newSearch}` : "");
          window.history.replaceState({}, "", newPath);
        }

        const activeCookie = Cookies.get("skey");
        const appActiveSkey = localStorage.getItem("app_active_skey");
        const isSessionActive = activeCookie && activeCookie === appActiveSkey;

        const cookieUser = isSessionActive ? {} : null;

        if (cookieUser) {
          // Initialize both services
          const ticketInitialized = initializeService(
            SERVICE_CONFIG.TICKET,
            cookieUser,
          );
          const callLogInitialized = initializeService(
            SERVICE_CONFIG.CALL_LOG,
            cookieUser,
          );

          setServices({
            ticket: ticketInitialized,
            callLog: callLogInitialized,
          });

          await getToken(cookieUser.userId);
        } else {
          console.log("No active app session found");
          clearState();

          // Fetch detected session details if skey cookie exists
          if (activeCookie) {
            try {
              const decoded = {}; // parses the activeCookie
              if (decoded && decoded.userId) {
                // Initialize services temporarily to make API call
                initializeService(SERVICE_CONFIG.TICKET, decoded);
                initializeService(SERVICE_CONFIG.CALL_LOG, decoded);

                const res = await BaseAPI.getToken(decoded.userId);
                if (res?.rd1?.[0] && res?.rd?.[0]) {
                  setDetectedSession({
                    email: decoded.userId,
                    companyCode:
                      res.rd[0]?.companycode || res.rd1[0]?.companycode || "",
                    firstname: res.rd1[0]?.firstname || "",
                    lastname: res.rd1[0]?.lastname || "",
                    designation: res.rd1[0]?.designation || "",
                    skey: activeCookie,
                  });
                }
              }
            } catch (e) {
              console.error("Failed to fetch detected session info:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error in initialization:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");
    const isPublic = PUBLIC_ROUTES.includes(currentPath || "/");

    const loginToken = localStorage.getItem("login_token");
    if (!user && !loginToken && !isPublic) {
      navigate("/login", { replace: true });
    }
  }, [user, isInitialized, location.pathname, navigate]);

  // Add Call Events
  useSocketEvent("versionupdate", (data) => {
    // updateVersion(data.version);
    console.log(data);
  });

  const contextData = {
    user,
    token,
    isInitialized,
    services,
    clearState,
    getToken,
    initializeService,
    CompanyInfo,
    UserRights,
    updateVersion,
    isUpdate,
    detectedSession,
    setDetectedSession,
    savedAccounts,
    removeSavedAccount,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}

// Hook for consuming the Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
