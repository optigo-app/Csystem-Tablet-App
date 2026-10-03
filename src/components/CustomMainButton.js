// CustomMainButton.js - Modern MUI Button with Sora typography
import React from "react";
import Button from "@mui/material/Button";
import StaggeredDotsWave from "./StaggeredDotsWave";

export default function CustomMainButton({ height = 48, width = "100%", backgroundColor = "#670FC5", onPressed, text, textColor = "#FFFFFF", fontSize = 15, fontWeight = 600, radius = 10, loading = false, disabled = false }) {
	return (
		<Button
			variant="contained"
			onClick={!loading && !disabled ? onPressed : undefined}
			disabled={disabled || loading}
			sx={{
				width,
				height,
				backgroundColor: disabled ? "#CBD5E1" : backgroundColor,
				background: disabled ? "#CBD5E1" : "linear-gradient(135deg, #7A19D6 0%, #590CB0 100%)",
				borderRadius: typeof radius === "number" ? `${radius}px` : radius,
				color: textColor,
				fontSize,
				fontWeight,
				textTransform: "none",
				fontFamily: "'Sora Variable', 'Sora', sans-serif",
				letterSpacing: "0.01em",
				boxShadow: disabled ? "none" : "0 4px 14px -2px rgba(103, 15, 197, 0.35)",
				"&:hover": {
					background: disabled ? "#CBD5E1" : "linear-gradient(135deg, #8723E2 0%, #670FC5 100%)",
					transform: disabled ? "none" : "translateY(-1px)",
					boxShadow: disabled ? "none" : "0 8px 20px -2px rgba(103, 15, 197, 0.45)",
				},
				"&:active": {
					transform: disabled ? "none" : "translateY(0px)",
				},
				transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
			}}
		>
			{loading ? <StaggeredDotsWave color="#FFFFFF" size={24} /> : text}
		</Button>
	);
}
