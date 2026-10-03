// helpers.js - Model parsing, time calculations, and storage helpers matching Flutter app logic

export const AppColors = {
	primaryColor: "#670FC5",
	primaryColorLight: "#EFEEFE",
	startColor: "#B2069B",
	endColor: "#3909C2",
	white: "#FFFFFF",
	white70: "rgba(255, 255, 255, 0.7)",
	black: "#1A1A1A",
	overlayColor: "rgba(0, 0, 0, 0.51)",

	bg: "#F5F6FA",
	surface: "#FFFFFF",
	border: "#E2E6F0",
	textPri: "#1A1D2E",
	textSec: "#7A85A3",
	textMuted: "#B4B2A9",

	callFg: "#16A34A",
	callBg: "#E6F1FB",
	callBorder: "#B5D4F4",

	tickFg: "#670FC5",
	tickBg: "#EEEDFE",

	greenFg: "#16A34A",
	greenBg: "#DCFCE7",
	orangeFg: "#EA580C",
	orangeBg: "#FFEDD5",
	redFg: "#DC2626",
	redBg: "#FEE2E2",
	liveGreen: "#22C55E",

	darkGrey: "#515254",
	grey05: "#F8F8F8",
	grey10: "#F3F4F6",
	grey20: "#F1F1F1",
	grey25: "#D7D7D7",
	grey40: "#A1A1A1",
	grey50: "#909090",
	grey70: "#666666",
};

export const SharedPrefsHelper = {
	getString: (key) => {
		try {
			return localStorage.getItem(key);
		} catch {
			return null;
		}
	},
	setString: (key, value) => {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			console.error("SharedPrefs setString error:", e);
		}
	},
	getBool: (key, defaultValue = false) => {
		try {
			const val = localStorage.getItem(key);
			return val !== null ? val === "true" : defaultValue;
		} catch {
			return defaultValue;
		}
	},
	setBool: (key, value) => {
		try {
			localStorage.setItem(key, String(value));
		} catch (e) {
			console.error("SharedPrefs setBool error:", e);
		}
	},
	remove: (key) => {
		try {
			localStorage.removeItem(key);
		} catch (e) {
			console.error("SharedPrefs remove error:", e);
		}
	},
	clear: () => {
		try {
			localStorage.removeItem("login_token");
			localStorage.removeItem("appUserId");
			localStorage.removeItem("login_details");
		} catch (e) {
			console.error("SharedPrefs clear error:", e);
		}
	},
};

const safeStr = (v) => (v !== null && v !== undefined ? String(v) : "");

// Parse date without timezone conversion, exactly matching Flutter's DateTime.tryParse + local DateTime constructor
export const parseDate = (dateTimeStr) => {
	if (!dateTimeStr) return new Date();
	if (dateTimeStr instanceof Date) return new Date(dateTimeStr.getTime());

	const s = String(dateTimeStr).trim();
	if (!s) return new Date();

	// 1. ISO format: YYYY-MM-DD or YYYY/MM/DD with optional time and optional .millis / Z
	const isoMatch = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
	if (isoMatch) {
		const year = Number.parseInt(isoMatch[1], 10);
		const month = Number.parseInt(isoMatch[2], 10) - 1;
		const day = Number.parseInt(isoMatch[3], 10);
		const hour = isoMatch[4] ? Number.parseInt(isoMatch[4], 10) : 0;
		const minute = isoMatch[5] ? Number.parseInt(isoMatch[5], 10) : 0;
		const second = isoMatch[6] ? Number.parseInt(isoMatch[6], 10) : 0;
		return new Date(year, month, day, hour, minute, second);
	}

	// 2. DD-MM-YYYY or DD/MM/YYYY format
	const dmyMatch = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
	if (dmyMatch) {
		const day = Number.parseInt(dmyMatch[1], 10);
		const month = Number.parseInt(dmyMatch[2], 10) - 1;
		const year = Number.parseInt(dmyMatch[3], 10);
		const hour = dmyMatch[4] ? Number.parseInt(dmyMatch[4], 10) : 0;
		const minute = dmyMatch[5] ? Number.parseInt(dmyMatch[5], 10) : 0;
		const second = dmyMatch[6] ? Number.parseInt(dmyMatch[6], 10) : 0;
		return new Date(year, month, day, hour, minute, second);
	}

	const d = new Date(s);
	return Number.isNaN(d.getTime()) ? new Date() : d;
};

export const getElapsed = (date) => {
	const now = Date.now();
	const arrival = date instanceof Date ? date.getTime() : new Date(date).getTime();
	const diff = now - arrival;
	return diff < 0 ? 0 : diff;
};

export const getTimerColors = (seconds) => {
	if (seconds < 600) {
		return { fg: AppColors.greenFg, bg: AppColors.greenBg };
	}
	if (seconds < 1200) {
		return { fg: AppColors.orangeFg, bg: AppColors.orangeBg };
	}
	return { fg: AppColors.redFg, bg: AppColors.redBg };
};

export const formatTimerText = (milliseconds) => {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const d = Math.floor(totalSeconds / 86400);
	const h = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
	const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
	const s = String(totalSeconds % 60).padStart(2, "0");

	if (d > 0) return `${d}d ${h}:${m}:${s}`;
	if (Math.floor(totalSeconds / 3600) > 0) return `${h}:${m}:${s}`;
	return `${m}:${s}`;
};

export const formatUserTimerText = (milliseconds) => {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const d = Math.floor(totalSeconds / 86400);
	const h = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
	const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");

	if (d > 0) return `${d}d ${h}:${m}`;
	if (Math.floor(totalSeconds / 3600) > 0) return `${h}:${m}`;
	return m;
};

export const getInitials = (name) => {
	const trimmed = safeStr(name).trim();
	if (!trimmed) return "--";

	const parts = trimmed.split(" ").filter((p) => p.length > 0);
	if (parts.length === 0) return "--";
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}
	return trimmed.substring(0, Math.min(2, trimmed.length)).toUpperCase();
};

export const formatTime12h = (date) => {
	const dt = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(dt.getTime())) return "";

	let hour = dt.getHours();
	const minute = String(dt.getMinutes()).padStart(2, "0");
	const ampm = hour >= 12 ? "PM" : "AM";
	hour = hour % 12;
	if (hour === 0) hour = 12;

	return `${hour}:${minute} ${ampm}`;
};

export const parseQItem = (json, defaultType = null) => {
	if (!json || typeof json !== "object") return null;

	const rawType = safeStr(json.Type || json.type);
	const isCall = defaultType === "call" || rawType.toUpperCase() === "CALL" || Boolean(json.CallTypeId || json.callType || json.callBy || json.CallLogid || json.callLogId);

	const customerName = safeStr(json.CustomerName || json.customerName || json.callBy || json.clientName || json.ClientName || json.Name || json.name).trim();

	const subject = safeStr(json.Subject || json.subject || json.mainSubject || json.MainSubject).trim();

	const ticketNo = json.TicketNo || json.ticketNo || json.ticketNumber || json.TicketId || json.ticketId ? String(json.TicketNo || json.ticketNo || json.ticketNumber || json.TicketId || json.ticketId) : null;

	const projectCode = json.ProjectCode || json.projectCode || json.ProjectID || json.projectId ? String(json.ProjectCode || json.projectCode || json.ProjectID || json.projectId) : null;

	const reason = safeStr(json.Descr || json.description || json.descr || json.calldetails || json.Details || json.details).trim();

	const dateStr = json.DateTime || json.dateTime || json.datetime || json.EntryDate || json.entryDate || json.date || json.Date;
	const arrivedAt = parseDate(dateStr);

	// Multi-fallback name extraction so real data is never marked "Unknown"
	const name = isCall ? customerName || subject || (projectCode ? `@${projectCode}` : "") : subject || (ticketNo ? `Ticket #${ticketNo}` : "") || customerName || (projectCode ? `@${projectCode}` : "");

	const rawId = json.Id || json.id || json.CallLogid || json.callLogId || json.TicketNo || json.ticketNo;
	const id = `${isCall ? "call" : "ticket"}_${rawId || `${Date.now()}_${Math.random()}`}`;

	return {
		id,
		name: name || (isCall ? "Unknown Caller" : "Unknown"),
		reason: reason || "—",
		customerName,
		subject,
		rawDescr: reason,
		type: isCall ? "call" : "ticket",
		arrivedAt,
		ticketNo,
		projectCode,
		raw: json,
	};
};

export const parseUItem = (json) => {
	const lastCallDate = parseDate(json.LastCallDate || json.lastCallDate);
	const lastTicketDate = parseDate(json.LastTicketDate || json.lastTicketDate);

	return {
		createdBy: json.CreatedBy || json.createdBy || 0,
		empName: json.EmpName || json.empName || "",
		totalCallRecords: json.TotalCallRecords || json.totalCallRecords || 0,
		lastCallDate,
		lastTicketDate,
		totalTicketRecords: json.TotalTicketRecords || json.totalTicketRecords || 0,
	};
};

export const isValidEmail = (email) => {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
};
