import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CallIcon from "@mui/icons-material/Call";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { Box, Tooltip, Typography, Zoom } from "@mui/material";
// CardDetailTooltip.js - Elegant card-styled hover tooltip matching the reference card design
import React from "react";
import { formatTime12h, formatTimerText, formatUserTimerText, getElapsed, getTimerColors } from "../utils/helpers";

/**
 * Tooltip for Call and Ticket Queue Cards
 */
export function QueueCardTooltip({ item, tick, children, placement = "top" }) {
	if (!item) return children;

	const isCall = item.type === "call";
	const elapsed = getElapsed(item.arrivedAt);
	const elapsedSeconds = Math.floor(elapsed / 1000);
	const { fg: timerFg, bg: timerBg } = getTimerColors(elapsedSeconds);

	const typeFg = isCall ? "#15803D" : "#7E22CE";
	const typeBg = isCall ? "#DCFCE7" : "#F3E8FF";
	const typeLabel = isCall ? "Incoming Call" : `Ticket #${item.ticketNo || "ID"}`;

	const descriptionText = item.rawDescr || item.reason || "";
	const hasDescription = descriptionText && descriptionText !== "—" && descriptionText.toLowerCase() !== "no subject";

	const tooltipCard = (
		<Box
			sx={{
				width: 320,
				maxWidth: "90vw",
				backgroundColor: "#FFFFFF",
				borderRadius: "20px",
				border: "1.5px solid #E2E8F0",
				boxShadow: "0 20px 40px -8px rgba(15, 23, 42, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.08)",
				p: "18px 18px 16px 18px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
				color: "#0F172A",
			}}
		>
			{/* Top Circle Emblem */}
			<Box
				sx={{
					width: 44,
					height: 44,
					borderRadius: "50%",
					backgroundColor: typeBg,
					color: typeFg,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mb: 1.25,
					boxShadow: `0 4px 12px ${typeFg}20`,
				}}
			>
				{isCall ? <CallIcon sx={{ fontSize: 22 }} /> : <ConfirmationNumberIcon sx={{ fontSize: 22 }} />}
			</Box>

			{/* Title (Customer Name / Ticket Subject) */}
			<Typography
				sx={{
					fontSize: 16.5,
					fontWeight: 800,
					color: "#0F172A",
					lineHeight: 1.3,
					mb: 0.5,
					wordBreak: "break-word",
				}}
			>
				{item.name || (isCall ? "Unknown Caller" : "Ticket")}
			</Typography>

			{/* Project Code Pill */}
			{item.projectCode && (
				<Box
					sx={{
						display: "inline-flex",
						alignItems: "center",
						px: 1.2,
						py: 0.25,
						borderRadius: "14px",
						backgroundColor: isCall ? "#F0FDF4" : "#FAF5FF",
						border: `1px solid ${isCall ? "#BBF7D0" : "#E9D5FF"}`,
						color: typeFg,
						fontSize: 12,
						fontWeight: 700,
						mb: 1.25,
					}}
				>
					{item.projectCode.startsWith("@") ? item.projectCode : `@${item.projectCode}`}
				</Box>
			)}

			{/* Full Description Box */}
			<Box
				sx={{
					width: "100%",
					backgroundColor: "#F8FAFC",
					border: "1px solid #E2E8F0",
					borderRadius: "14px",
					p: "12px 14px",
					mb: 1.5,
					textAlign: "left",
				}}
			>
				<Typography
					sx={{
						fontSize: 10.5,
						fontWeight: 800,
						color: "#64748B",
						letterSpacing: 0.5,
						textTransform: "uppercase",
						mb: 0.5,
					}}
				>
					Description
				</Typography>
				<Typography
					sx={{
						fontSize: 13,
						fontWeight: 500,
						color: hasDescription ? "#334155" : "#94A3B8",
						lineHeight: 1.55,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
						maxHeight: 140,
						overflowY: "auto",
					}}
				>
					{hasDescription ? descriptionText : "No additional description provided."}
				</Typography>
			</Box>

			{/* Bottom Status / Timing Pills */}
			<Box
				sx={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 0.75,
				}}
			>
				{/* Status & Type Pill */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						px: 1.5,
						py: 0.65,
						borderRadius: "12px",
						backgroundColor: typeBg,
						color: typeFg,
						border: `1px solid ${typeFg}30`,
						fontSize: 12,
						fontWeight: 700,
					}}
				>
					<span>{typeLabel}</span>
					<span style={{ fontSize: 11, opacity: 0.85 }}>{item.arrivedAt ? formatTime12h(item.arrivedAt) : ""}</span>
				</Box>

				{/* Live Elapsed Waiting Timer Pill */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 0.75,
						px: 1.5,
						py: 0.75,
						borderRadius: "12px",
						backgroundColor: timerBg,
						color: timerFg,
						border: `1.5px solid ${timerFg}40`,
						fontSize: 13,
						fontWeight: 800,
						fontVariantNumeric: "tabular-nums",
					}}
				>
					<AccessTimeIcon sx={{ fontSize: 16 }} />
					<span>Waiting: {formatTimerText(elapsed)}</span>
				</Box>
			</Box>
		</Box>
	);

	return (
		<Tooltip
			title={tooltipCard}
			placement={placement}
			arrow={false}
			interactive
			enterDelay={160}
			leaveDelay={120}
			TransitionComponent={Zoom}
			TransitionProps={{ timeout: 200 }}
			componentsProps={{
				tooltip: {
					sx: {
						backgroundColor: "transparent",
						boxShadow: "none",
						p: 0,
						maxWidth: "none",
					},
				},
				popper: {
					sx: {
						zIndex: 1400,
					},
				},
			}}
		>
			<Box sx={{ width: "100%" }}>{children}</Box>
		</Tooltip>
	);
}

/**
 * Tooltip for Live Queue Operator Cards
 */
export function OperatorCardTooltip({ user, callElapsed, ticketElapsed, children, placement = "right" }) {
	if (!user) return children;

	const tooltipCard = (
		<Box
			sx={{
				width: 300,
				maxWidth: "90vw",
				backgroundColor: "#FFFFFF",
				borderRadius: "20px",
				border: "1.5px solid #E2E8F0",
				boxShadow: "0 20px 40px -8px rgba(15, 23, 42, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.08)",
				p: "18px 18px 16px 18px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
				color: "#0F172A",
			}}
		>
			{/* Top Circle Emblem */}
			<Box
				sx={{
					width: 44,
					height: 44,
					borderRadius: "50%",
					backgroundColor: "#EFF6FF",
					color: "#2563EB",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mb: 1.25,
					boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
				}}
			>
				<SupportAgentIcon sx={{ fontSize: 24 }} />
			</Box>

			{/* Operator Name */}
			<Typography
				sx={{
					fontSize: 16.5,
					fontWeight: 800,
					color: "#0F172A",
					lineHeight: 1.3,
					mb: 0.5,
				}}
			>
				{user.empName || "Support Operator"}
			</Typography>

			{/* Active Status Badge */}
			<Box
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: 0.6,
					px: 1.2,
					py: 0.25,
					borderRadius: "14px",
					backgroundColor: "#DCFCE7",
					border: "1px solid #BBF7D0",
					color: "#15803D",
					fontSize: 11.5,
					fontWeight: 700,
					mb: 1.5,
				}}
			>
				<Box
					sx={{
						width: 6,
						height: 6,
						borderRadius: "50%",
						backgroundColor: "#16A34A",
					}}
				/>
				<span>Active Support Operator</span>
			</Box>

			{/* Metrics Summary Box */}
			<Box
				sx={{
					width: "100%",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 1,
					mb: 1.5,
				}}
			>
				{/* Calls Stat */}
				<Box
					sx={{
						p: 1.25,
						backgroundColor: "#F0FDF4",
						border: "1px solid #DCFCE7",
						borderRadius: "12px",
						textAlign: "left",
					}}
				>
					<Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#16A34A" }}>CALLS</Typography>
					<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#15803D" }}>{user.totalCallRecords || 0}</Typography>
					<Typography sx={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>Last: {formatUserTimerText(callElapsed)} ago</Typography>
				</Box>

				{/* Tickets Stat */}
				<Box
					sx={{
						p: 1.25,
						backgroundColor: "#FAF5FF",
						border: "1px solid #F3E8FF",
						borderRadius: "12px",
						textAlign: "left",
					}}
				>
					<Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#7E22CE" }}>TICKETS</Typography>
					<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#6B21A8" }}>{user.totalTicketRecords || 0}</Typography>
					<Typography sx={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>Last: {formatUserTimerText(ticketElapsed)} ago</Typography>
				</Box>
			</Box>

			{/* Footer Info Pill */}
			<Box
				sx={{
					width: "100%",
					py: 0.65,
					px: 1.25,
					borderRadius: "12px",
					backgroundColor: "#F8FAFC",
					border: "1px solid #E2E8F0",
					color: "#64748B",
					fontSize: 11.5,
					fontWeight: 600,
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<span>Operator ID</span>
				<span style={{ fontWeight: 700, color: "#0F172A" }}>#{user.createdBy || 0}</span>
			</Box>
		</Box>
	);

	return (
		<Tooltip
			title={tooltipCard}
			placement={placement}
			arrow={false}
			interactive
			enterDelay={160}
			leaveDelay={120}
			TransitionComponent={Zoom}
			TransitionProps={{ timeout: 200 }}
			componentsProps={{
				tooltip: {
					sx: {
						backgroundColor: "transparent",
						boxShadow: "none",
						p: 0,
						maxWidth: "none",
					},
				},
				popper: {
					sx: {
						zIndex: 1400,
					},
				},
			}}
		>
			<Box sx={{ width: "100%" }}>{children}</Box>
		</Tooltip>
	);
}
