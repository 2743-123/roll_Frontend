import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  userName: string;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,0.2)", overflow: "hidden" }
      }}
    >
      {/* ================= HEADER ================= */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
          color: "white",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.5,
        }}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 28 }} /> Confirm Deletion
      </DialogTitle>

      {/* ================= CONTENT ================= */}
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0", textAlign: "center" }}>
        <Box py={1}>
          <Typography variant="body1" color="text.primary">
            Are you sure you want to permanently delete user{" "}
            <strong style={{ color: "#d32f2f" }}>{userName || "this user"}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            This action cannot be undone and will remove all associated data.
          </Typography>
        </Box>
      </DialogContent>

      {/* ================= FOOTER ================= */}
      <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa", justifyContent: "space-between" }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onClose} 
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleConfirm} 
          disabled={loading}
          sx={{ borderRadius: 2, px: 4, fontWeight: 600, boxShadow: "none" }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;