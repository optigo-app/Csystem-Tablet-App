// PasswordLogin.js - Modernized authentication screen with Sora typography
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import AlternateEmailOutlined from "@mui/icons-material/AlternateEmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import { ApiService } from "../services/apiService";
import { SharedPrefsHelper, isValidEmail, AppColors } from "../utils/helpers";
import CustomTextField from "../components/CustomTextField";
import CustomMainButton from "../components/CustomMainButton";
import NotifToast from "../components/NotifToast";

export default function PasswordLogin() {
	const navigate = useNavigate();
	const [companyCode, setCompanyCode] = useState("");
	const [userId, setUserId] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	// Toast alert state
	const [toastMsg, setToastMsg] = useState("");
	const [toastVisible, setToastVisible] = useState(false);
	const [toastType, setToastType] = useState("error");

	const showToast = (msg, type = "error") => {
		setToastMsg(msg);
		setToastType(type);
		setToastVisible(true);
		setTimeout(() => {
			setToastVisible(false);
		}, 3200);
	};

	const handleLogin = async (e) => {
		if (e) e.preventDefault();

		if (!navigator.onLine) {
			showToast("You're offline. Please check your internet connection.");
			return;
		}

		const cCode = companyCode.trim();
		const uId = userId.trim();
		const pass = password.trim();

		if (!cCode) {
			showToast("Please enter your Company Code");
			return;
		}
		if (!uId) {
			showToast("Please enter your User ID");
			return;
		}
		if (!pass) {
			showToast("Please enter your Password");
			return;
		}
		if (!isValidEmail(uId)) {
			showToast("Please enter a valid User ID (email format)");
			return;
		}

		setLoading(true);
		try {
			const register = await ApiService.deviceLoginIdPass(cCode, uId, pass);

			if (String(register.Status) === "200") {
				const rd0 = register?.Data?.rd?.[0];
				if (rd0 && rd0.stat === 0) {
					showToast(rd0.stat_msg || "Authentication failed!");
				} else if (rd0) {
					const deviceToken = rd0.yearcode;
					const appUserId = rd0.userid;

					if (deviceToken) {
						SharedPrefsHelper.setString("login_token", deviceToken);
						SharedPrefsHelper.setString("appUserId", appUserId);

						navigate("/homeScreen", { replace: true });
					} else {
						showToast("Something went wrong!");
					}
				} else {
					showToast("Invalid response from server");
				}
			} else {
				showToast(register.Message || "Something went wrong!");
			}
		} catch (err) {
			console.error("[Login] Error:", err);
			showToast(err.message || "Something went wrong!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100vw",
				backgroundColor: "#F8FAFC",
				backgroundImage: "radial-gradient(1000px circle at 50% -10%, rgba(103, 15, 197, 0.08) 0%, transparent 60%), radial-gradient(800px circle at 100% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: { xs: 2, sm: 3 },
				overflowY: "auto",
				fontFamily: "'Sora Variable', 'Sora', sans-serif",
			}}
		>
			<NotifToast message={toastMsg} fg={toastType === "error" ? AppColors.redFg : AppColors.callFg} bg={toastType === "error" ? AppColors.redBg : AppColors.callBg} visible={toastVisible} onClose={() => setToastVisible(false)} />

			<Paper
				elevation={0}
				sx={{
					width: "100%",
					maxWidth: 440,
					p: { xs: 3.5, sm: 4.5 },
					borderRadius: "20px",
					backgroundColor: "#FFFFFF",
					border: "1px solid #E2E8F0",
					boxShadow: "0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					position: "relative",
					backdropFilter: "blur(8px)",
				}}
			>
				{/* Optigo Logo */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						mb: 2.5,
					}}
				>
					<Box
						component="img"
						src="/img/logo.png"
						alt="Optigo Logo"
						sx={{
							height: 84,
							width: 84,
							objectFit: "contain",
							filter: "drop-shadow(0 4px 12px rgba(103, 15, 197, 0.15))",
							transition: "transform 0.3s ease",
							"&:hover": {
								transform: "scale(1.04)",
							},
						}}
					/>
				</Box>

				{/* System Pill Tag */}
				<Chip
					icon={<SecurityOutlined sx={{ fontSize: "14px !important", color: "#670FC5 !important" }} />}
					label="Optigo Central System"
					size="small"
					sx={{
						height: 26,
						fontSize: 11.5,
						fontWeight: 600,
						color: "#670FC5",
						backgroundColor: "#F3E8FF",
						border: "1px solid rgba(103, 15, 197, 0.12)",
						mb: 2,
						fontFamily: "'Sora Variable', 'Sora', sans-serif",
						letterSpacing: "0.02em",
					}}
				/>

				<Typography
					variant="h5"
					component="h1"
					sx={{
						fontSize: { xs: 22, sm: 24 },
						fontWeight: 700,
						color: "#0F172A",
						mb: 0.75,
						textAlign: "center",
						fontFamily: "'Sora Variable', 'Sora', sans-serif",
						letterSpacing: "-0.02em",
					}}
				>
					Sign in to your account
				</Typography>

				<Typography
					variant="body2"
					sx={{
						fontSize: 14,
						fontWeight: 400,
						color: "#64748B",
						mb: 3.5,
						textAlign: "center",
						fontFamily: "'Sora Variable', 'Sora', sans-serif",
					}}
				>
					Explore opportunities with us
				</Typography>

				<Box component="form" onSubmit={handleLogin} sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
					<Stack spacing={2.2} sx={{ width: "100%", mb: 3.5 }}>
						{/* Company Code */}
						<Box>
							<Typography
								component="label"
								htmlFor="company-code-input"
								sx={{
									display: "block",
									fontSize: 12.5,
									color: "#334155",
									fontWeight: 600,
									mb: 0.75,
									fontFamily: "'Sora Variable', 'Sora', sans-serif",
									letterSpacing: "0.01em",
								}}
							>
								Company Code
							</Typography>
							<CustomTextField id="company-code-input" value={companyCode} onChange={setCompanyCode} hintText="Enter your code" disabled={loading} startIcon={<BusinessOutlined sx={{ fontSize: 19 }} />} />
						</Box>

						{/* User ID */}
						<Box>
							<Typography
								component="label"
								htmlFor="user-id-input"
								sx={{
									display: "block",
									fontSize: 12.5,
									color: "#334155",
									fontWeight: 600,
									mb: 0.75,
									fontFamily: "'Sora Variable', 'Sora', sans-serif",
									letterSpacing: "0.01em",
								}}
							>
								User Id
							</Typography>
							<CustomTextField id="user-id-input" value={userId} onChange={setUserId} hintText="Enter your user id" type="email" disabled={loading} startIcon={<AlternateEmailOutlined sx={{ fontSize: 19 }} />} />
						</Box>

						{/* Password with Hide / Show toggle */}
						<Box>
							<Typography
								component="label"
								htmlFor="password-input"
								sx={{
									display: "block",
									fontSize: 12.5,
									color: "#334155",
									fontWeight: 600,
									mb: 0.75,
									fontFamily: "'Sora Variable', 'Sora', sans-serif",
									letterSpacing: "0.01em",
								}}
							>
								Password
							</Typography>
							<CustomTextField
								id="password-input"
								value={password}
								onChange={setPassword}
								hintText="Enter your password"
								obscureText={true}
								disabled={loading}
								startIcon={<LockOutlined sx={{ fontSize: 19 }} />}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleLogin();
								}}
							/>
						</Box>
					</Stack>

					<CustomMainButton text="Activate" onPressed={handleLogin} loading={loading} fontSize={15} height={48} />
				</Box>

				{/* Security / Session Trust Footer */}
				<Box
					sx={{
						mt: 3.5,
						pt: 2.2,
						borderTop: "1px solid #F1F5F9",
						width: "100%",
						textAlign: "center",
					}}
				>
					<Typography
						variant="caption"
						sx={{
							fontSize: 11.5,
							fontWeight: 500,
							color: "#94A3B8",
							fontFamily: "'Sora Variable', 'Sora', sans-serif",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 0.75,
						}}
					>
						<LockOutlined sx={{ fontSize: 13, color: "#94A3B8" }} />
						Protected by Optigo Secure Session
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
}
