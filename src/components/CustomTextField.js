// CustomTextField.js - Modern MUI TextField matching Sora typography
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function CustomTextField({ id, value, onChange, hintText = "", obscureText = false, type = "text", disabled = false, autoComplete = "off", onKeyDown, startIcon = null, autoFocus = false }) {
	const [showPassword, setShowPassword] = useState(false);

	const inputType = obscureText ? (showPassword ? "text" : "password") : type;

	return (
		<TextField
			id={id}
			fullWidth
			variant="outlined"
			type={inputType}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={onKeyDown}
			placeholder={hintText}
			disabled={disabled}
			autoComplete={autoComplete}
			autoFocus={autoFocus}
			InputProps={{
				startAdornment: startIcon ? (
					<InputAdornment position="start" sx={{ color: "#94A3B8", mr: 0.5 }}>
						{startIcon}
					</InputAdornment>
				) : null,
				endAdornment: obscureText ? (
					<InputAdornment position="end">
						<Tooltip title={showPassword ? "Hide password" : "Show password"} arrow>
							<IconButton
								aria-label={showPassword ? "Hide password" : "Show password"}
								onClick={() => setShowPassword((prev) => !prev)}
								edge="end"
								size="small"
								tabIndex={-1}
								sx={{
									color: showPassword ? "#670FC5" : "#94A3B8",
									padding: "6px",
									transition: "all 0.2s ease",
									"&:hover": {
										color: "#670FC5",
										backgroundColor: "rgba(103, 15, 197, 0.08)",
									},
								}}
							>
								{showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
							</IconButton>
						</Tooltip>
					</InputAdornment>
				) : null,
			}}
			sx={{
				"& .MuiOutlinedInput-root": {
					borderRadius: "10px",
					backgroundColor: "#F8FAFC",
					fontSize: 14,
					fontWeight: 500,
					fontFamily: "'Sora Variable', 'Sora', sans-serif",
					color: "#0F172A",
					transition: "all 0.2s ease-in-out",
					"& fieldset": {
						borderColor: "#E2E8F0",
						borderWidth: 1,
						transition: "border-color 0.2s ease, box-shadow 0.2s ease",
					},
					"&:hover": {
						backgroundColor: "#FFFFFF",
						"& fieldset": {
							borderColor: "#CBD5E1",
						},
					},
					"&.Mui-focused": {
						backgroundColor: "#FFFFFF",
						"& fieldset": {
							borderColor: "#670FC5",
							borderWidth: 1.5,
						},
						boxShadow: "0 0 0 3px rgba(103, 15, 197, 0.12)",
					},
					"&.Mui-disabled": {
						backgroundColor: "#F1F5F9",
						"& fieldset": {
							borderColor: "#E2E8F0",
						},
					},
				},
				"& .MuiOutlinedInput-input": {
					padding: "12px 14px",
					fontFamily: "'Sora Variable', 'Sora', sans-serif",
					"&::placeholder": {
						color: "#94A3B8",
						opacity: 1,
						fontFamily: "'Sora Variable', 'Sora', sans-serif",
						fontSize: 13.5,
					},
				},
			}}
		/>
	);
}
