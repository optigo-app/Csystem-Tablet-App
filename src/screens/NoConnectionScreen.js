// NoConnectionScreen.js - Matches Flutter's NoConnectionPage with MUI
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomMainButton from "../components/CustomMainButton";
import { AppColors } from "../utils/helpers";

export default function NoConnectionScreen() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRetry = async () => {
    setChecking(true);
    setErrorMsg("");

    try {
      if (navigator.onLine) {
        navigate("/homeScreen", { replace: true });
      } else {
        setErrorMsg("Still offline. Please check your internet connection.");
      }
    } catch {
      setErrorMsg("Network test failed. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const onOnline = () => {
      navigate("/homeScreen", { replace: true });
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [navigate]);

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
          src="/svg/warning.svg"
          alt="No Connection"
          sx={{ width: 120, height: 120, mb: 2.5 }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontSize: 28,
            fontWeight: 700,
            color: AppColors.black,
            mb: 1.5,
            fontFamily: "'Sora Variable', 'Sora', sans-serif",
          }}
        >
          No connection
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            color: AppColors.darkGrey,
            lineHeight: 1.5,
            mb: 3,
            fontFamily: "'Sora Variable', 'Sora', sans-serif",
          }}
        >
          Please check your internet connectivity and try again.
        </Typography>

        {errorMsg && (
          <Typography
            sx={{
              color: AppColors.redFg,
              fontSize: 14,
              fontWeight: 500,
              mb: 2,
              fontFamily: "'Sora Variable', 'Sora', sans-serif",
            }}
          >
            {errorMsg}
          </Typography>
        )}

        <Box sx={{ width: "100%", maxWidth: 260 }}>
          <CustomMainButton
            text="Retry"
            onPressed={handleRetry}
            loading={checking}
            fontSize={16}
          />
        </Box>
      </Box>
    </Box>
  );
}
