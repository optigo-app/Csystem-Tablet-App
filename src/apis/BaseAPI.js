
// BaseAPI.js
class ApiError extends Error {
  constructor(message, functionName, response) {
    super(message);
    this.name = "ApiError";
    this.functionName = functionName;
    this.timestamp = new Date();
    this.response = response;
  }

  getResponseData() {
    return this.response && this.response.json ? this.response.json() : null;
  }
}

class BaseAPI {

  static BASE_URL = (() => {
    const host = window?.location?.hostname;
    if (host.includes("localhost") || host.includes("nzen") || host.includes("calllog.web")) {
      return "http://newnextjs.web/api/report";
    }
    return process.env.NODE_ENV === "production" ? "https://apilx.optigoapps.com/api/report" : "http://newnextjs.web/api/report";
  })();

  static SOCKET_BASE_URL = (() => {
    const host = window?.location?.hostname;
    if (host.includes("localhost") || host.includes("nzen") || host.includes("calllog.web")) {
      return "http://newnextjs.web";
    }
    return process.env.NODE_ENV === "production" ? "https://apilx.optigoapps.com/api/report" : "http://newnextjs.web";
  })();

  static config = {};

  static serviceConfigs = {};

  /**
   * Initialize configuration for a specific service or general config
   * @param {Object} configValues - Configuration values
   * @param {String} serviceName - Optional service name for service-specific config
   * @returns {Object} The resulting configuration
   */

  static initialize(configValues = {}, serviceName = null) {
    if (serviceName) {
      this.serviceConfigs[serviceName] = {
        ...configValues,
      };
      return this.serviceConfigs[serviceName];
    } else {
      this.config = {
        ...configValues,
      };
      return this.config;
    }
  }

  /**
   * Get configuration for a specific service or default config
   * @param {String} serviceName - Optional service name
   * @returns {Object} Configuration object
   */
  static getConfig(serviceName = null) {
    return serviceName && this.serviceConfigs[serviceName] ? this.serviceConfigs[serviceName] : this.config;
  }

  /**
   * Get HTTP headers using appropriate configuration
   * @param {String} yearCode - Optional year code override
   * @param {String} serviceName - Optional service name
   * @returns {Object} Headers object
   */
  static getHeaders(yearCode, serviceName = null) {
    const config = this.getConfig(serviceName);

    return {
      "Content-Type": "application/json",
      YearCode: yearCode || config.YEAR_CODE,
      version: config.VERSION_NO,
      sv: config.SV,
      sp: config.SP,
    };
  }

  /**
   * Make API request using appropriate service configuration
   * @param {Object} options - Request options
   * @returns {Promise} Promise resolving to API response
   */
  static async requestToApi({ mode, params, yearCode, functionName, serviceName = "CallLog", socketEvent }) {
    const config = this.getConfig(serviceName);

    const body = {
      con: JSON.stringify({
        id: "",
        mode,
        appuserid: config.APP_USER_ID || this.config.APP_USER_ID,
        ...(socketEvent && { socketEvent })
      }),
      p: JSON.stringify(params),
      f: `${serviceName} (${functionName})`,
    };

    try {
      const response = await fetch(this.BASE_URL, {
        method: "POST",
        headers: this.getHeaders(yearCode, serviceName),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new ApiError(data.message || `Failed to ${functionName.toLowerCase()}`, functionName, response);
      }

      return data?.Data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`Error during "${error.functionName}" operation:`, error);
        throw error;
      } else {
        console.error(`Unexpected error during "${functionName}" operation:`, error);
        throw new ApiError(error.message, functionName);
      }
    }
  }

  /**
   * Get authentication token
   * @param {String} userId - User ID
   * @returns {Promise} Promise resolving to token data
   */
  static async getToken(userId) {
    try {
      const response = await this.requestToApi({
        mode: "gettoken",
        params: { appuserid: userId },
        functionName: "gettoken",
      });

      return response;
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  }

  static async login(userId, companyCode, password) {
    try {

      const body = {
        con: JSON.stringify({
          id: "",
          mode: "login",
          appuserid: userId,
        }),
        p: JSON.stringify({
          companycode: companyCode,
          psw: password,
        }),
        f: "amrut@eg.com (ConversionDetail)",
      };


      const response = await fetch(this.BASE_URL, {
        method: "POST",
        headers: {
          yearcode: "",
          version: "_Ticketv4",
          sv: process.env.NODE_ENV === "production" ? "1" : "0",
          sp: "14",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  }

}

export { BaseAPI, ApiError };
