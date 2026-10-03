// socketService.js - Real-time Socket.io service matching Flutter's SocketService
import { io } from "socket.io-client";
import { SharedPrefsHelper } from "../utils/helpers";

class SocketService {
  static instance = null;

  constructor() {
    this.socket = null;
    this.serverUrl = "https://apilx.optigoapps.com";
    this.roomId = "";
    this.isInitialized = false;

    // Callbacks
    this.onNewCall = null;
    this.onremoveCall = null;
    this.onNewTicket = null;
    this.onSignal = null;
  }

  checkInitializeSocket() {
    return this.isInitialized;
  }

  initializeSocket() {
    if (this.isInitialized && this.socket?.connected) {
      console.log("[SocketService] Already initialized & connected.");
      return;
    }

    console.log("[SocketService] Initializing socket connection...");

    try {
      const loginDetailsStr = SharedPrefsHelper.getString("login_details");
      const loginDetails = loginDetailsStr ? JSON.parse(loginDetailsStr) : {};
      if (loginDetails?.roomId) {
        this.roomId = loginDetails.roomId;
      }
    } catch (e) {
      console.error("[SocketService] Error parsing login_details:", e);
    }

    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log(`%c[SocketService] Connected. Socket ID: ${this.socket.id}`, "color: #22c55e; font-weight: bold;");
        if (this.roomId) {
          this.socket.emit("joinRoom", this.roomId);
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.warn("[SocketService] Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("[SocketService] Connection error:", error);
      });

      this.socket.on("connectToRoom", (data) => {
        console.log("[SocketService] Connected to room:", data);
      });

      // Events matching Flutter app
      this.socket.on("AddCall", (data) => {
        console.log("[SocketService] AddCall event received:", data);
        if (this.onNewCall) {
          this.onNewCall(data);
        }
      });

      this.socket.on("AcceptCall", (data) => {
        console.log("[SocketService] AcceptCall event received:", data);
        if (this.onremoveCall) {
          this.onremoveCall(data);
        }
      });

      this.socket.on("CreateTicket", (data) => {
        console.log("[SocketService] CreateTicket event received:", data);
        if (this.onNewTicket) {
          this.onNewTicket(data);
        }
      });

      this.socket.on("TicketComment", (data) => {
        console.log("[SocketService] TicketComment event received:", data);
        if (this.onNewTicket) {
          this.onNewTicket(data);
        }
      });

      this.socket.on("ReceiveSignal", (data) => {
        console.log("[SocketService] ReceiveSignal data:", data);
        if (this.onSignal) {
          this.onSignal(data);
        }
      });

      this.isInitialized = true;
    } catch (err) {
      console.error("[SocketService] Initialization failed:", err);
    }
  }

  sendSignal(signal) {
    if (this.socket?.connected) {
      const payload = {
        roomno: this.roomId,
        tmode: "SendSignal",
        tvar: signal,
      };
      this.socket.emit("SendSignal", payload);
    } else {
      console.warn("[SocketService] Socket is not connected to send signal.");
    }
  }

  dispose() {
    if (this.isInitialized) {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.onNewCall = null;
      this.onremoveCall = null;
      this.onNewTicket = null;
      this.onSignal = null;
      this.isInitialized = false;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
