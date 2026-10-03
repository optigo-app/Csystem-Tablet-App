// LogoutDialog.js - MUI Dialog matching Flutter's AlertDialog
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function LogoutDialog({ open, onClose, onConfirm, loading = false }) {
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          padding: "12px 16px",
          width: "90%",
          maxWidth: 420,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          border: "1px solid #E2E8F0",
        },
      }}
    >
      <DialogTitle
        id="logout-dialog-title"
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: "#0F172A",
          pb: 1,
        }}
      >
        Confirm Logout
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="logout-dialog-description"
          sx={{
            fontSize: 14.5,
            color: "#64748B",
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to logout?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 1.5, pr: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            color: "#64748B",
            borderColor: "#E2E8F0",
            textTransform: "none",
            borderRadius: "10px",
            fontSize: 14,
            fontWeight: 600,
            px: 2.5,
            "&:hover": {
              borderColor: "#CBD5E1",
              backgroundColor: "#F8FAFC",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            fontSize: 14,
            fontWeight: 600,
            px: 2.5,
            boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
            "&:hover": {
              backgroundColor: "#B91C1C",
            },
          }}
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
