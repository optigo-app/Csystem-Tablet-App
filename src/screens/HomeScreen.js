import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
// HomeScreen.js - Replicating Flutter's 3-panel Live Queue HomeScreen with MUI
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AutoScrollContainer from "../components/AutoScrollContainer";
import { OperatorCardTooltip, QueueCardTooltip } from "../components/CardDetailTooltip";
import LogoutDialog from "../components/LogoutDialog";
import NotifToast from "../components/NotifToast";
import StaggeredDotsWave from "../components/StaggeredDotsWave";
import { ApiService } from "../services/apiService";
import { socketService } from "../services/socketService";
import { soundService } from "../services/soundService";
import { AppColors, SharedPrefsHelper, formatTimerText, formatUserTimerText, getElapsed, getInitials, getTimerColors, parseQItem, parseUItem } from "../utils/helpers";

export default function HomeScreen() {
	const navigate = useNavigate();
	const isNarrow = useMediaQuery("(max-width: 820px)");
	const [activeTab, setActiveTab] = useState(0); // 0 = Live Queue, 1 = Call List, 2 = Ticket List

	// Data state
	const [items, setItems] = useState([]);
	const [uItems, setUItems] = useState([]);
	const [loading, setLoading] = useState(true);

	// Notification toast state
	const [notifMsg, setNotifMsg] = useState("");
	const [notifFg, setNotifFg] = useState(AppColors.callFg);
	const [notifBg, setNotifBg] = useState(AppColors.callBg);
	const [notifVisible, setNotifVisible] = useState(false);
	const notifHideTimerRef = useRef(null);

	// Logout dialog
	const [logoutOpen, setLogoutOpen] = useState(false);
	const [logoutLoading, setLogoutLoading] = useState(false);

	// Known item IDs tracking for audio alerts
	const knownIdsRef = useRef(new Set());
	const [timerTick, setTimerTick] = useState(0);

	// Trigger floating notification
	const triggerNotif = useCallback((type) => {
		if (notifHideTimerRef.current) clearTimeout(notifHideTimerRef.current);

		const isCall = type === "call";
		setNotifMsg(isCall ? "📞 New call added" : "🎫 New ticket added");
		setNotifFg(isCall ? AppColors.callFg : AppColors.tickFg);
		setNotifBg(isCall ? AppColors.callBg : AppColors.tickBg);
		setNotifVisible(true);

		notifHideTimerRef.current = setTimeout(() => {
			setNotifVisible(false);
		}, 2500);
	}, []);

	// Fetch Dashboard Data from API
	const loadData = useCallback(async (isInitial = false) => {
		try {
			const response = await ApiService.dashboard();
			const rd = response?.Data?.rd || [];
			const rd1 = response?.Data?.rd1 || [];

			const parsedItems = rd
				.map((e) => parseQItem(e))
				.filter((item) => {
					if (!item) return false;
					if (item.arrivedAt.getFullYear() <= 1900) return false;
					// Filter out empty ghost / corrupted records with no meaningful content
					const isGhost = (!item.name || item.name === "Unknown" || item.name === "Unknown Caller" || item.name === "Unknown Ticket") && !item.ticketNo && !item.projectCode && (!item.reason || item.reason === "—");
					return !isGhost;
				})
				.sort((a, b) => b.arrivedAt - a.arrivedAt);

			const parsedUItems = rd1
				.map((e) => parseUItem(e))
				.filter((item) => item.lastCallDate.getFullYear() > 1900)
				.sort((a, b) => b.lastCallDate - a.lastCallDate);

			// Detect missed items on refresh to play audio
			if (!isInitial && knownIdsRef.current.size > 0) {
				for (const it of parsedItems) {
					if (!knownIdsRef.current.has(it.id)) {
						soundService.playSound(it.type);
						break;
					}
				}
			}

			knownIdsRef.current.clear();
			for (const it of parsedItems) {
				knownIdsRef.current.add(it.id);
			}

			setItems(parsedItems);
			setUItems(parsedUItems);
			setLoading(false);
		} catch (err) {
			console.error("[HomeScreen] API error:", err);
			setLoading(false);
		}
	}, []);

	// Initial setup & Timers
	useEffect(() => {
		// 1. Check login
		const token = SharedPrefsHelper.getString("login_token");
		if (!token) {
			navigate("/passwordLogin", { replace: true });
			return;
		}

		// 2. Setup Socket
		socketService.initializeSocket();

		socketService.onNewCall = (data) => {
			console.log("[HomeScreen] New call event:", data);
			try {
				const newItem = parseQItem(data, "call");
				triggerNotif("call");
				if (data?.topicRaisedBy === "client" || !data?.topicRaisedBy) {
					soundService.playSound("call");
				}
				loadData();
				if (newItem && (newItem.customerName || newItem.projectCode || (newItem.reason && newItem.reason !== "—"))) {
					setItems((prev) => {
						if (prev.some((x) => x.id === newItem.id)) return prev;
						return [newItem, ...prev];
					});
					knownIdsRef.current.add(newItem.id);
				}
			} catch (e) {
				console.error("Error handling new call:", e);
			}
		};

		socketService.onremoveCall = (data) => {
			console.log("[HomeScreen] Remove call event:", data);
			try {
				const idToRemove = `CALL_${data?.Id || data?.id}`;
				setItems((prev) => prev.filter((x) => x.id !== idToRemove && x.id !== data?.Id));
				knownIdsRef.current.delete(idToRemove);
			} catch (e) {
				console.error("Error removing call:", e);
			}
		};

		socketService.onNewTicket = (data) => {
			console.log("[HomeScreen] New ticket event:", data);
			try {
				const newItem = parseQItem(data, "ticket");
				triggerNotif("ticket");
				soundService.playSound("ticket");
				loadData();
				if (newItem && (newItem.subject || newItem.ticketNo || newItem.customerName || (newItem.reason && newItem.reason !== "—"))) {
					setItems((prev) => {
						if (prev.some((x) => x.id === newItem.id)) return prev;
						return [newItem, ...prev];
					});
					knownIdsRef.current.add(newItem.id);
				}
			} catch (e) {
				console.error("Error handling new ticket:", e);
			}
		};

		socketService.onSignal = (data) => {
			const tvar = data?.tvar ? String(data.tvar).toLowerCase() : "";
			if (tvar === "devicedisabled") {
				navigate("/disabledScreen", { replace: true });
			} else if (tvar === "forcelogout" || tvar === "accountdeleted") {
				SharedPrefsHelper.clear();
				navigate("/passwordLogin", { replace: true });
			}
		};

		// 3. Initial Load
		loadData(true);

		// 4. Live UI Timer (every 1 second for live countdown and elapsed timer ticks)
		const uiTimer = setInterval(() => {
			setTimerTick((t) => (t + 1) % 10000);
		}, 1000);

		// 5. Periodic API fallback sync every 3 minutes
		const refreshTimer = setInterval(
			() => {
				loadData();
			},
			3 * 60 * 1000,
		);

		return () => {
			clearInterval(uiTimer);
			clearInterval(refreshTimer);
			if (notifHideTimerRef.current) clearTimeout(notifHideTimerRef.current);
			socketService.onNewCall = null;
			socketService.onremoveCall = null;
			socketService.onNewTicket = null;
			socketService.onSignal = null;
		};
	}, [loadData, navigate, triggerNotif]);

	// Handle Logout
	const handleLogout = async () => {
		setLogoutLoading(true);
		try {
			await ApiService.logoutAccount();
		} catch (e) {
			console.error("[Logout] Error:", e);
		} finally {
			SharedPrefsHelper.clear();
			setLogoutLoading(false);
			setLogoutOpen(false);
			navigate("/passwordLogin", { replace: true });
		}
	};

	const callItems = items.filter((x) => x.type === "call");
	const ticketItems = items.filter((x) => x.type === "ticket");

	if (loading) {
		return (
			<Box
				sx={{
					width: "100%",
					height: "100%",
					backgroundColor: AppColors.bg,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<StaggeredDotsWave color={AppColors.callFg} size={42} />
			</Box>
		);
	}

	const HEADER_HEIGHT = { xs: 44, sm: 46, md: 48, lg: 52 };

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				maxHeight: "100vh",
				backgroundColor: "var(--bg)",
				display: "flex",
				justifyContent: "center",
				overflow: "hidden",
				boxSizing: "border-box",
			}}
		>
			<Box
				sx={{
					width: "100%",
					maxWidth: { xs: "100%", lg: "1680px", xl: "1800px" },
					height: "100%",
					display: "flex",
					flexDirection: "column",
					p: { xs: "6px", sm: "8px", md: "10px", lg: "12px" },
					gap: { xs: "6px", sm: "8px", md: "10px", lg: "12px" },
					overflow: "hidden",
					position: "relative",
					boxSizing: "border-box",
				}}
			>
				<NotifToast message={notifMsg} fg={notifFg} bg={notifBg} visible={notifVisible} onClose={() => setNotifVisible(false)} />

				<LogoutDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} loading={logoutLoading} />

				{/* ── MOBILE / TABLET TAB SWITCHER BAR (Visible on screens < 820px) ── */}
				{isNarrow && (
					<Box
						sx={{
							display: "flex",
							p: "4px",
							backgroundColor: "#FFFFFF",
							borderRadius: "12px",
							border: "1px solid #E2E8F0",
							gap: 0.5,
							flexShrink: 0,
							boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
						}}
					>
						{[
							{ label: "Live Queue", count: uItems.length, color: "#15803D", bg: "#DCFCE7" },
							{ label: "Call List", count: callItems.length, color: "#15803D", bg: "#DCFCE7" },
							{ label: "Ticket List", count: ticketItems.length, color: "#7E22CE", bg: "#F3E8FF" },
						].map((tab, i) => (
							<ButtonBase
								key={tab.label}
								onClick={() => setActiveTab(i)}
								sx={{
									flex: 1,
									py: "8px",
									px: "6px",
									borderRadius: "9px",
									backgroundColor: activeTab === i ? (i === 2 ? "#FAF5FF" : "#F0FDF4") : "transparent",
									border: activeTab === i ? (i === 2 ? "1.5px solid #D8B4FE" : "1.5px solid #86EFAC") : "1.5px solid transparent",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 0.85,
									transition: "all 0.15s ease",
								}}
							>
								<Typography
									sx={{
										fontSize: { xs: 13, sm: 14 },
										fontWeight: activeTab === i ? 800 : 600,
										color: activeTab === i ? "#0F172A" : "#64748B",
										whiteSpace: "nowrap",
									}}
								>
									{tab.label}
								</Typography>
								<Box
									sx={{
										fontSize: { xs: 11, sm: 12 },
										fontWeight: 900,
										px: 0.8,
										py: 0.15,
										borderRadius: "12px",
										backgroundColor: tab.bg,
										color: tab.color,
										lineHeight: 1.2,
									}}
								>
									{tab.count}
								</Box>
							</ButtonBase>
						))}
					</Box>
				)}

				{/* ── 3-PANEL RESPONSIVE CONTAINER ── */}
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "row",
						gap: { xs: "6px", sm: "8px", md: "10px", lg: "12px" },
						overflow: "hidden",
						minHeight: 0,
					}}
				>
					{/* ────────────────── LEFT PANEL (Operator / User Stats) ────────────────── */}
					<Paper
						elevation={0}
						className="panel-card-shadow"
						sx={{
							flex: 1,
							minWidth: 0,
							height: "100%",
							backgroundColor: "#FFFFFF",
							borderRadius: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
							border: "1px solid #E2E8F0",
							display: isNarrow ? (activeTab === 0 ? "flex" : "none") : "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						{/* Header with Live Queue indicator, Refresh, and Logout */}
						<Box
							sx={{
								height: HEADER_HEIGHT,
								minHeight: HEADER_HEIGHT,
								maxHeight: HEADER_HEIGHT,
								px: { xs: 1.5, sm: 1.75, md: 2, lg: 2.25 },
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								borderBottom: "1.5px solid #F1F5F9",
								backgroundColor: "#FFFFFF",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 0.85, md: 1, lg: 1.1 } }}>
								<Box className="pulse-dot" sx={{ width: 9, height: 9 }} />
								<Typography
									sx={{
										fontSize: { xs: 15, sm: 16, md: 17, lg: 18.5 },
										fontWeight: 800,
										color: "#0F172A",
										letterSpacing: -0.3,
										whiteSpace: "nowrap",
									}}
								>
									Live Queue
								</Typography>
							</Box>

							<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
								<IconButton
									size="small"
									onClick={() => loadData()}
									sx={{
										width: { xs: 30, sm: 32, md: 34, lg: 36 },
										height: { xs: 30, sm: 32, md: 34, lg: 36 },
										borderRadius: "9px",
										color: "#334155",
										backgroundColor: "#F8FAFC",
										border: "1px solid #E2E8F0",
										"&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
									}}
									title="Refresh Queue"
								>
									<RefreshIcon sx={{ fontSize: { xs: 18, sm: 19, md: 20, lg: 21 } }} />
								</IconButton>
								<IconButton
									size="small"
									onClick={() => setLogoutOpen(true)}
									sx={{
										width: { xs: 30, sm: 32, md: 34, lg: 36 },
										height: { xs: 30, sm: 32, md: 34, lg: 36 },
										borderRadius: "9px",
										color: "#334155",
										backgroundColor: "#F8FAFC",
										border: "1px solid #E2E8F0",
										"&:hover": {
											backgroundColor: "#FEE2E2",
											color: "#DC2626",
											borderColor: "#FECACA",
										},
									}}
									title="Logout"
								>
									<LogoutIcon sx={{ fontSize: { xs: 18, sm: 19, md: 20, lg: 21 } }} />
								</IconButton>
							</Box>
						</Box>

						{/* User Stats Auto-Scroll List */}
						<Box sx={{ flex: 1, overflow: "hidden", p: { xs: "6px", sm: "8px", md: "9px", lg: "10px" } }}>
							{uItems.length === 0 ? (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#94A3B8",
										fontSize: 14,
										fontWeight: 600,
									}}
								>
									No active operators
								</Box>
							) : (
								<AutoScrollContainer speed={0.25}>
									<Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.75, sm: 0.85, md: 0.9, lg: 1 } }}>
										{uItems.map((u, idx) => {
											const callElapsed = getElapsed(u.lastCallDate);
											const ticketElapsed = getElapsed(u.lastTicketDate);

											return (
												<OperatorCardTooltip key={`${u.createdBy}_${idx}`} user={u} callElapsed={callElapsed} ticketElapsed={ticketElapsed} placement="right">
													<Paper
														elevation={0}
														className="queue-card-shadow"
														sx={{
															p: { xs: "8px 10px", sm: "9px 12px", md: "10px 12px", lg: "11px 14px" },
															backgroundColor: "#FFFFFF",
															borderRadius: { xs: "10px", sm: "11px", md: "12px", lg: "13px" },
															border: "1px solid #E2E8F0",
															display: "flex",
															flexDirection: "column",
															gap: 0.65,
															minWidth: 0,
															cursor: "pointer",
														}}
													>
														<Typography
															sx={{
																fontSize: { xs: 14, sm: 15, md: 15.5, lg: 16.5 },
																fontWeight: 700,
																color: "#0F172A",
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																lineHeight: 1.25,
																letterSpacing: -0.2,
															}}
														>
															{u.empName}
														</Typography>

														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																gap: { xs: 0.6, sm: 0.75, md: 0.85, lg: 1 },
																minWidth: 0,
															}}
														>
															{/* Calls Counter Box */}
															<Box
																sx={{
																	flex: "1 1 0",
																	width: 0,
																	minWidth: 0,
																	py: { xs: "4.5px", sm: "5px", md: "6px", lg: "6.5px" },
																	px: { xs: "6px", sm: "8px", md: "10px", lg: "12px" },
																	backgroundColor: "#F0FDF4",
																	border: "1px solid #DCFCE7",
																	borderRadius: "8px",
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "center",
																	overflow: "hidden",
																}}
															>
																<Typography
																	sx={{
																		fontSize: { xs: 17, sm: 19, md: 21, lg: 24 },
																		color: "#16A34A",
																		fontWeight: 900,
																		lineHeight: 1,
																		flexShrink: 0,
																	}}
																>
																	{u.totalCallRecords}
																</Typography>
																<Box
																	sx={{
																		height: 16,
																		width: "1.5px",
																		minWidth: "1.5px",
																		maxWidth: "1.5px",
																		backgroundColor: "#BBF7D0",
																		mx: { xs: 0.5, sm: 0.65, md: 0.8, lg: 0.9 },
																		flexShrink: 0,
																	}}
																/>
																<Typography
																	className="tabular-timer"
																	sx={{
																		fontSize: { xs: 12, sm: 12.5, md: 13.5, lg: 14.5 },
																		fontWeight: 700,
																		color: "#166534",
																		whiteSpace: "nowrap",
																		fontVariantNumeric: "tabular-nums",
																		lineHeight: 1,
																		flexShrink: 0,
																		letterSpacing: -0.2,
																	}}
																>
																	{formatUserTimerText(callElapsed)}
																</Typography>
															</Box>

															{/* Tickets Counter Box */}
															<Box
																sx={{
																	flex: "1 1 0",
																	width: 0,
																	minWidth: 0,
																	py: { xs: "4.5px", sm: "5px", md: "6px", lg: "6.5px" },
																	px: { xs: "6px", sm: "8px", md: "10px", lg: "12px" },
																	backgroundColor: "#FAF5FF",
																	border: "1px solid #F3E8FF",
																	borderRadius: "8px",
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "center",
																	overflow: "hidden",
																}}
															>
																<Typography
																	sx={{
																		fontSize: { xs: 17, sm: 19, md: 21, lg: 24 },
																		color: "#7E22CE",
																		fontWeight: 900,
																		lineHeight: 1,
																		flexShrink: 0,
																	}}
																>
																	{u.totalTicketRecords}
																</Typography>
																<Box
																	sx={{
																		height: 16,
																		width: "1.5px",
																		minWidth: "1.5px",
																		maxWidth: "1.5px",
																		backgroundColor: "#E9D5FF",
																		mx: { xs: 0.5, sm: 0.65, md: 0.8, lg: 0.9 },
																		flexShrink: 0,
																	}}
																/>
																<Typography
																	className="tabular-timer"
																	sx={{
																		fontSize: { xs: 12, sm: 12.5, md: 13.5, lg: 14.5 },
																		fontWeight: 700,
																		color: "#581C87",
																		whiteSpace: "nowrap",
																		fontVariantNumeric: "tabular-nums",
																		lineHeight: 1,
																		flexShrink: 0,
																		letterSpacing: -0.2,
																	}}
																>
																	{formatUserTimerText(ticketElapsed)}
																</Typography>
															</Box>
														</Box>
													</Paper>
												</OperatorCardTooltip>
											);
										})}
									</Box>
								</AutoScrollContainer>
							)}
						</Box>
					</Paper>

					{/* ────────────────── CENTER PANEL (Call List) ────────────────── */}
					<Paper
						elevation={0}
						className="panel-card-shadow"
						sx={{
							flex: 1,
							minWidth: 0,
							height: "100%",
							backgroundColor: "#FFFFFF",
							borderRadius: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
							border: "1px solid #E2E8F0",
							display: isNarrow ? (activeTab === 1 ? "flex" : "none") : "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						{/* Header */}
						<Box
							sx={{
								height: HEADER_HEIGHT,
								minHeight: HEADER_HEIGHT,
								maxHeight: HEADER_HEIGHT,
								px: { xs: 1.5, sm: 1.75, md: 2, lg: 2.25 },
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								borderBottom: "1.5px solid #F1F5F9",
								backgroundColor: "#FFFFFF",
							}}
						>
							<Typography
								sx={{
									fontSize: { xs: 15, sm: 16, md: 17, lg: 18.5 },
									fontWeight: 800,
									color: "#0F172A",
									letterSpacing: -0.3,
									whiteSpace: "nowrap",
								}}
							>
								Call List
							</Typography>
							<Box
								sx={{
									px: { xs: 0.8, sm: 1, md: 1.1, lg: 1.25 },
									borderRadius: "14px",
									backgroundColor: "#DCFCE7",
									border: "1px solid #BBF7D0",
									color: "#15803D",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: { xs: 12, sm: 13, md: 13.5, lg: 25 },
									fontWeight: 900,
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{callItems.length}
							</Box>
						</Box>

						{/* Scrollable List */}
						<Box sx={{ flex: 1, overflow: "hidden", p: { xs: "6px", sm: "8px", md: "9px", lg: "10px" } }}>
							{callItems.length === 0 ? (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#94A3B8",
										fontSize: 14,
										fontWeight: 600,
									}}
								>
									No calls in queue
								</Box>
							) : (
								<AutoScrollContainer speed={0.22}>
									<Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.75, sm: 0.85, md: 0.9, lg: 1 } }}>
										{callItems.map((item) => (
											<QueueCard key={item.id} item={item} tick={timerTick} />
										))}
									</Box>
								</AutoScrollContainer>
							)}
						</Box>
					</Paper>

					{/* ────────────────── RIGHT PANEL (Ticket List) ────────────────── */}
					<Paper
						elevation={0}
						className="panel-card-shadow"
						sx={{
							flex: 1,
							minWidth: 0,
							height: "100%",
							backgroundColor: "#FFFFFF",
							borderRadius: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
							border: "1px solid #E2E8F0",
							display: isNarrow ? (activeTab === 2 ? "flex" : "none") : "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						{/* Header */}
						<Box
							sx={{
								height: HEADER_HEIGHT,
								minHeight: HEADER_HEIGHT,
								maxHeight: HEADER_HEIGHT,
								px: { xs: 1.5, sm: 1.75, md: 2, lg: 2.25 },
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								borderBottom: "1.5px solid #F1F5F9",
								backgroundColor: "#FFFFFF",
							}}
						>
							<Typography
								sx={{
									fontSize: { xs: 15, sm: 16, md: 17, lg: 18.5 },
									fontWeight: 800,
									color: "#0F172A",
									letterSpacing: -0.3,
									whiteSpace: "nowrap",
								}}
							>
								Ticket List
							</Typography>
							<Box
								sx={{
									px: { xs: 0.8, sm: 1, md: 1.1, lg: 1.25 },
									borderRadius: "14px",
									backgroundColor: "#F3E8FF",
									border: "1px solid #E9D5FF",
									color: "#7E22CE",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: { xs: 12, sm: 13, md: 13.5, lg: 25 },
									fontWeight: 900,
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{ticketItems.length}
							</Box>
						</Box>

						{/* Scrollable List */}
						<Box sx={{ flex: 1, overflow: "hidden", p: { xs: "6px", sm: "8px", md: "9px", lg: "10px" } }}>
							{ticketItems.length === 0 ? (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#94A3B8",
										fontSize: 14,
										fontWeight: 600,
									}}
								>
									No tickets in queue
								</Box>
							) : (
								<AutoScrollContainer speed={0.22}>
									<Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.75, sm: 0.85, md: 0.9, lg: 1 } }}>
										{ticketItems.map((item) => (
											<QueueCard key={item.id} item={item} tick={timerTick} />
										))}
									</Box>
								</AutoScrollContainer>
							)}
						</Box>
					</Paper>
				</Box>
			</Box>
		</Box>
	);
}

// ────────────────── QUEUE CARD COMPONENT ──────────────────
function QueueCard({ item, tick }) {
	const isCall = item.type === "call";
	const elapsed = getElapsed(item.arrivedAt);
	const totalSeconds = Math.floor(elapsed / 1000);
	const { fg: timerFg, bg: timerBg } = getTimerColors(totalSeconds);
	const timerText = formatTimerText(elapsed);

	const typeFg = isCall ? AppColors.callFg : AppColors.tickFg;
	const typeBg = isCall ? AppColors.callBg : AppColors.tickBg;
	const typeLabel = isCall ? "CALL" : item.ticketNo || "TICKET";
	const initials = getInitials(item.name);

	return (
		<QueueCardTooltip item={item} tick={tick} placement="top">
			<Paper
				elevation={0}
				className="queue-card-shadow"
				sx={{
					backgroundColor: "#FFFFFF",
					border: "1px solid #E2E8F0",
					borderLeft: `4px solid ${timerFg}`,
					borderRadius: { xs: "10px", sm: "11px", md: "12px", lg: "13px" },
					p: { xs: "8px 10px", sm: "9px 11px", md: "10px 12px", lg: "11px 14px" },
					display: "flex",
					alignItems: "center",
					overflow: "hidden",
					minWidth: 0,
					cursor: "pointer",
				}}
			>
				{/* Avatar Circle */}
				<Avatar
					sx={{
						width: { xs: 32, sm: 34, md: 38, lg: 40 },
						height: { xs: 32, sm: 34, md: 38, lg: 40 },
						minWidth: { xs: 32, sm: 34, md: 38, lg: 40 },
						backgroundColor: timerBg,
						color: timerFg,
						fontWeight: 800,
						fontSize: { xs: 11.5, sm: 12.5, md: 13, lg: 14 },
						mr: { xs: 0.85, sm: 1, md: 1.1, lg: 1.25 },
						border: `1.5px solid ${timerFg}35`,
					}}
				>
					{initials}
				</Avatar>

				{/* Name, Project Code / Handle, and Reason */}
				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						mr: { xs: 0.6, sm: 0.7, md: 0.8, lg: 1 },
					}}
				>
					<Typography
						sx={{
							fontSize: { xs: 13.5, sm: 14.5, md: 15, lg: 16 },
							fontWeight: 700,
							color: "#0F172A",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
							lineHeight: 1.25,
						}}
					>
						{item.name}
					</Typography>

					{item.projectCode && (
						<Typography
							sx={{
								fontSize: { xs: 11, sm: 11.5, md: 12, lg: 12.5 },
								color: isCall ? "#16A34A" : "#7E22CE",
								fontWeight: 700,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								mt: 0.1,
							}}
						>
							{item.projectCode.startsWith("@") ? item.projectCode : `@${item.projectCode}`}
						</Typography>
					)}

					<Typography
						sx={{
							fontSize: { xs: 11, sm: 11.5, md: 12, lg: 12.5 },
							color: "#475569",
							fontWeight: 500,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
							mt: 0.1,
						}}
					>
						{item.reason || "No subject"}
					</Typography>
				</Box>

				{/* Badges Column */}
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-end",
						gap: { xs: 0.3, sm: 0.35, md: 0.4, lg: 0.45 },
						flexShrink: 0,
					}}
				>
					{/* Type / Ticket Badge */}
					<Box
						sx={{
							px: { xs: 0.8, sm: 0.9, md: 1, lg: 1.1 },
							py: { xs: 0.15, sm: 0.2, md: 0.2, lg: 0.25 },
							backgroundColor: typeBg,
							color: typeFg,
							borderRadius: "20px",
							border: `1.5px solid ${typeFg}30`,
							fontSize: { xs: 9.5, sm: 10, md: 10.5, lg: 11.5 },
							fontWeight: 800,
							letterSpacing: 0.2,
							whiteSpace: "nowrap",
							lineHeight: 1.2,
						}}
					>
						{typeLabel}
					</Box>

					{/* Live Timer Badge */}
					<Box
						className="tabular-timer"
						sx={{
							px: { xs: 0.8, sm: 0.9, md: 1, lg: 1.1 },
							py: { xs: 0.15, sm: 0.2, md: 0.2, lg: 0.25 },
							backgroundColor: timerBg,
							color: timerFg,
							borderRadius: "20px",
							border: `1.5px solid ${timerFg}35`,
							fontSize: { xs: 10.5, sm: 11.5, md: 12, lg: 12.5 },
							fontWeight: 800,
							letterSpacing: 0.2,
							whiteSpace: "nowrap",
							fontVariantNumeric: "tabular-nums",
							lineHeight: 1.2,
							cursor: "default",
						}}
					>
						{timerText}
					</Box>
				</Box>
			</Paper>
		</QueueCardTooltip>
	);
}
