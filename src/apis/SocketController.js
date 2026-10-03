import { io } from "socket.io-client";

class SocketService {
  socket = null;
  isConnected = false;
  connectPromise = null;

  static SOCKET_BASE_URL = (() => {
    if (typeof window === "undefined") {
      return process.env.NODE_ENV === "production"
        ? "https://apilx.optigoapps.com"
        : "http://newnextjs.web";
    }

    const host = window.location.hostname;

    // local / dev environments
    const DEV_HOSTS = [
      "localhost",
      "127.0.0.1",
      "nzen",
      "calllog.web",
    ];

    const isDevHost = DEV_HOSTS.some((item) =>
      host.includes(item)
    );

    if (isDevHost) {
      return "http://newnextjs.web";
    }

    // production fallback
    return "https://apilx.optigoapps.com";
  })();

  init() {
    if (this.socket) return this.socket;
    const url = SocketService.SOCKET_BASE_URL;

    if (!url) {
      console.error("❌ SOCKET_BASE_URL missing");
      return null;
    }

    // protocol validation
    const isValid =
      url.startsWith("http://") ||
      url.startsWith("https://");

    if (!isValid) {
      console.error(
        "❌ Invalid socket URL:",
        url
      );
      return null;
    }

    this.socket = io(url, {
      path: "/socket.io",
      transports: ["polling", "websocket"], // allow fallback handshake
      reconnection: true,
      reconnectionAttempts: Infinity, // retry forever
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // 20s timeout before connect_error
      autoConnect: true,
    });

    // ✅ Promise to wait until socket is connected
    this.connectPromise = new Promise((resolve) => {
      this.socket.on("connect", () => {
        this.isConnected = true;
        console.log(
          "%c✅ SOCKET CONNECTED",
          "color: #22c55e; font-weight: 700; font-size: 100px;"
        );
        console.log(
          `%cSocket ID: ${this.socket.id}`,
          "color: #0ea5e9; font-size: 80px; font-weight: 600;"
        );
        resolve(this.socket);
      });
    });

    // --- Core event listeners ---
    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.warn(
        "%c⚠️ Socket disconnected:",
        "color: #ef4444; font-weight: 700; font-size: 18px;"
      );
      console.log(
        `%cReason: ${reason}`,
        "color: #0ea5e9; font-size: 14px; font-weight: 600;"
      );
      if (reason === "io server disconnect") {
        // Manual reconnect if server kicked us
        this.socket.connect();
      }
    });

    this.socket.on("reconnect", (attempt) => {
      console.log(
        `%c🔁 Socket reconnected (attempt ${attempt})`,
        "color: #22c55e; font-weight: 700; font-size: 18px;"
      );
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      console.log(
        `%c⏳ Reconnecting (attempt ${attempt})...`,
        "color: #0ea5e9; font-size: 14px; font-weight: 600;"
      );
    });

    this.socket.on("connect_error", (err) => {
      this.isConnected = false;
      console.error(
        "%c❌ Socket connection error:",
        "color: #ef4444; font-weight: 700; font-size: 18px;"
      );
      console.log(
        `%cReason: ${err.message}`,
        "color: #0ea5e9; font-size: 14px; font-weight: 600;"
      );
    });

    return this.socket;
  }

  // Wait until socket is connected before using
  async ready() {
    if (this.isConnected && this.socket) return this.socket;
    if (!this.connectPromise) this.init();
    return this.connectPromise;
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  async emit(event, data) {
    const sock = await this.ready();
    if (!sock.connected) {
      console.warn(
        "%c⚠️ Socket not ready. Queueing emit...",
        "color: #ef4444; font-weight: 700; font-size: 18px;"
      );
      setTimeout(() => this.emit(event, data), 500);
      return;
    }
    sock.emit(event, data, (ack) => {
      // Optional: handle server acknowledgment
      if (ack?.status === "ok") {
        console.log(
          `%c📤 [${event}] acknowledged`,
          "color: #22c55e; font-weight: 700; font-size: 18px;"
        );
      } else if (ack) {
        console.warn(
          `%c⚠️ [${event}] server ack:`,
          "color: #ef4444; font-weight: 700; font-size: 18px;"
        );
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
