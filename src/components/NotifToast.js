// NotifToast.js - MUI Snackbar/Paper notification matching Flutter's _NotifToast
import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function NotifToast({ message, fg, bg, visible, onClose }) {
  return (
    <Snackbar
      open={visible}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ top: { xs: 12, sm: 16 }, right: { xs: 12, sm: 18 } }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: "10px 20px",
          backgroundColor: bg,
          borderRadius: "16px",
          border: `1px solid ${fg}35`,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: fg,
            whiteSpace: "nowrap",
          }}
        >
          {message}
        </Typography>
      </Paper>
    </Snackbar>
  );
}
