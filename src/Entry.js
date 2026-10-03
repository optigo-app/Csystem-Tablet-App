// Entry.js - Application Route Configuration matching Flutter's app_router.dart
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./screens/SplashScreen";
import PasswordLogin from "./screens/PasswordLogin";
import HomeScreen from "./screens/HomeScreen";
import ExpiredScreen from "./screens/ExpiredScreen";
import DisabledScreen from "./screens/DisabledScreen";
import NoConnectionScreen from "./screens/NoConnectionScreen";

const Entry = () => {
  return (
    <Routes>
      {/* Root / Splash Screen */}
      <Route path="/" element={<SplashScreen />} />

      {/* Authentication */}
      <Route path="/login" element={<PasswordLogin />} />
      <Route path="/passwordLogin" element={<PasswordLogin />} />

      {/* Main Dashboard */}
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/homeScreen" element={<HomeScreen />} />

      {/* Status Screens */}
      <Route path="/expired" element={<ExpiredScreen />} />
      <Route path="/expiredScreen" element={<ExpiredScreen />} />
      <Route path="/disabled" element={<DisabledScreen />} />
      <Route path="/disabledScreen" element={<DisabledScreen />} />
      <Route path="/noConnectionScreen" element={<NoConnectionScreen />} />
      <Route path="/no-connection" element={<NoConnectionScreen />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Entry;
