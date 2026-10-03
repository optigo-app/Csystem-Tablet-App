// SplashScreen.js - Replicating Flutter's SplashScreen with MUI
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SharedPrefsHelper, AppColors } from "../utils/helpers";
import StaggeredDotsWave from "../components/StaggeredDotsWave";
import CustomMainButton from "../components/CustomMainButton";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [appVersion] = useState("4.0.44");
  const [isDeviceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInternet, setHasInternet] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setHasInternet(true);
    const handleOffline = () => setHasInternet(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkAuthentication = async () => {
      const loginToken = SharedPrefsHelper.getString("login_token");
      console.log("[SplashScreen] login token:", loginToken);

      if (loginToken) {
        setIsLoading(true);
        setTimeout(() => {
          navigate("/homeScreen", { replace: true });
        }, 500);
      } else {
        setTimeout(() => {
          navigate("/passwordLogin", { replace: true });
        }, 1000);
      }
    };

    checkAuthentication();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [navigate]);

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
        position: "relative",
        px: 3.5,
      }}
    >
      {isDeviceEnabled ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src="/img/logo.png"
            alt="Logo"
            sx={{ width: "240px", maxWidth: "80vw", objectFit: "contain" }}
          />
          <Typography
            sx={{
              mt: 2.5,
              fontWeight: 300,
              color: AppColors.black,
              fontSize: 15,
              fontFamily: "'Sora Variable', 'Sora', sans-serif",
            }}
          >
            Version: {appVersion}
          </Typography>
          {!hasInternet && (
            <Typography
              sx={{
                position: "fixed",
                bottom: 24,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "#DC2626",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              No Internet Available
            </Typography>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: 460,
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src="/img/logo.png"
            alt="Logo"
            sx={{ width: "220px", objectFit: "contain" }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: 3,
              fontWeight: 600,
              color: AppColors.black,
              fontSize: 20,
            }}
          >
            Device is not enabled
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              fontWeight: 400,
              color: AppColors.darkGrey,
              fontSize: 16,
              lineHeight: 1.5,
              px: 1.5,
            }}
          >
            Your device needs to be enabled to access the application. Please contact your admin.
          </Typography>
          <Box sx={{ mt: 4.5, width: "100%", maxWidth: 280 }}>
            <CustomMainButton
              text="Back to Login"
              onPressed={handleBackToLogin}
              fontSize={15}
            />
          </Box>
        </Box>
      )}

      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            bottom: 50,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <StaggeredDotsWave color={AppColors.primaryColor} size={35} />
        </Box>
      )}
    </Box>
  );
}
