// ExpiredScreen.js - Matches Flutter's ExpiredScreen with MUI
import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SharedPrefsHelper, AppColors } from "../utils/helpers";
import CustomMainButton from "../components/CustomMainButton";

export default function ExpiredScreen() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    SharedPrefsHelper.clear();
    navigate("/passwordLogin", { replace: true });
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3.5,
        textAlign: "center",
        fontFamily: "'Sora Variable', 'Sora', sans-serif",
      }}
    >
      <Box sx={{ maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          component="img"
          src="/svg/expired_lock.svg"
          alt="Expired Lock"
          sx={{ width: 140, height: 140, mb: 3 }}
        />

        <Typography
          variant="h6"
          sx={{
            fontSize: 20,
            fontWeight: 600,
            color: AppColors.black,
            mb: 1.75,
            fontFamily: "'Sora Variable', 'Sora', sans-serif",
          }}
        >
          Account Expired
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 400,
            color: AppColors.darkGrey,
            lineHeight: 1.5,
            px: 1.75,
            mb: 4.5,
            fontFamily: "'Sora Variable', 'Sora', sans-serif",
          }}
        >
          Your access to this account has expired. Please log in with new credentials to continue using our services.
        </Typography>

        <Box sx={{ width: "100%", maxWidth: 280 }}>
          <CustomMainButton
            text="Back to Login"
            onPressed={handleBackToLogin}
            fontSize={15}
            radius={12}
          />
        </Box>
      </Box>
    </Box>
  );
}
