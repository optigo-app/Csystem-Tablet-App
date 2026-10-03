// apiService.js - API client matching Flutter's ApiService implementation
import { SharedPrefsHelper } from "../utils/helpers";

class ApiException extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiException";
    this.status = status;
  }
}

const API_URL = (() => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("localhost") || host.includes("nzen") || host.includes("calllog.web")) {
      return "https://apilx.optigoapps.com/api/report";
    }
  }
  return "https://apilx.optigoapps.com/api/report";
})();

const appId = "6";

export const ApiService = {
  apiUrl: API_URL,
  appId,

  async deviceLoginIdPass(companyCode, userId, password) {
    try {
      const param = {
        companycode: companyCode,
        psw: password,
      };

      const conData = {
        id: "",
        mode: "login",
        appuserid: userId,
      };

      const body = {
        con: JSON.stringify(conData),
        p: JSON.stringify(param),
        f: "(ConversionDetail)",
      };

      const headers = {
        "Content-Type": "application/json",
        sv: "1",
        sp: "14",
        version: "_Ticketv4",
        yearcode: "",
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiException(`Server error: ${response.status}`, response.status);
      }

      const jsonResponse = await response.json();

      if (String(jsonResponse.Status) !== "200") {
        throw new ApiException(jsonResponse.Message || "Unknown API error", jsonResponse.Status);
      }

      return jsonResponse;
    } catch (e) {
      console.error("API error in deviceLoginIdPass:", e);
      throw e;
    }
  },

  async dashboard() {
    try {
      const loginToken = SharedPrefsHelper.getString("login_token") || "";
      const userId = SharedPrefsHelper.getString("appUserId") || "";

      const param = {};

      const conData = {
        mode: "dashboard_data",
        id: "",
        appuserid: userId,
      };

      const body = {
        con: JSON.stringify(conData),
        p: JSON.stringify(param),
        f: "Ticket (dashboard_data)",
      };

      const headers = {
        "Content-Type": "application/json",
        sv: "1",
        sp: "14",
        version: "_Ticketv4",
        YearCode: loginToken,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiException(`Server error: ${response.status}`, response.status);
      }

      const jsonResponse = await response.json();

      if (String(jsonResponse.Status) !== "200") {
        throw new ApiException(jsonResponse.Message || "Unknown API error", jsonResponse.Status);
      }

      return jsonResponse;
    } catch (e) {
      console.error("API error in dashboard:", e);
      throw e;
    }
  },

  async deviceStatus() {
    try {
      const loginToken = SharedPrefsHelper.getString("login_token") || "";

      const param = {
        AppId: appId,
      };

      const conData = {
        id: "",
        mode: "DeviceStatus",
        y: "",
        appuserid: "darshan@eg.com",
        IPAddress: "::127.0.0.1",
      };

      const body = {
        con: JSON.stringify(conData),
        p: JSON.stringify(param),
        f: "(DeviceStatus)",
      };

      const headers = {
        "Content-Type": "application/json",
        sv: "1",
        sp: "14",
        version: "v4",
        Authorization: `Bearer ${loginToken}`,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiException(`Server error: ${response.status}`, response.status);
      }

      const jsonResponse = await response.json();

      if (String(jsonResponse.Status) !== "200") {
        throw new ApiException(jsonResponse.Message || "Unknown API error", jsonResponse.Status);
      }

      return jsonResponse;
    } catch (e) {
      console.error("API error in deviceStatus:", e);
      throw e;
    }
  },

  async logoutAccount() {
    try {
      const loginToken = SharedPrefsHelper.getString("login_token") || "";

      const param = {
        AppId: appId,
      };

      const conData = {
        id: "",
        mode: "LogOut",
        y: "",
        appuserid: "darshan@eg.com",
        IPAddress: "::127.0.0.1",
      };

      const body = {
        con: JSON.stringify(conData),
        p: JSON.stringify(param),
        f: "(LogOut)",
      };

      const headers = {
        "Content-Type": "application/json",
        sv: "1",
        sp: "14",
        version: "_Ticketv4",
        Authorization: `Bearer ${loginToken}`,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiException(`Server error: ${response.status}`, response.status);
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (e) {
      console.error("API error in logoutAccount:", e);
      throw e;
    }
  },

  async deleteAccount() {
    try {
      const loginToken = SharedPrefsHelper.getString("login_token") || "";

      const param = {
        AppId: appId,
      };

      const conData = {
        id: "",
        mode: "DeleteAccount",
        y: "",
        appuserid: "darshan@eg.com",
        IPAddress: "::127.0.0.1",
      };

      const body = {
        con: JSON.stringify(conData),
        p: JSON.stringify(param),
        f: "(DeleteAccount)",
      };

      const headers = {
        "Content-Type": "application/json",
        sv: "1",
        sp: "14",
        version: "v4",
        Authorization: `Bearer ${loginToken}`,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiException(`Server error: ${response.status}`, response.status);
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (e) {
      console.error("API error in deleteAccount:", e);
      throw e;
    }
  },
};

export { ApiException };
export default ApiService;
