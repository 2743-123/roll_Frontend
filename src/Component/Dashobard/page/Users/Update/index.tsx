import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../store";
import { updateUserAction } from "../../../../../Actions/Auth/user";
import { User } from "../../../../../ActionType/user/userTypes";

interface EditUserProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const EditUser: React.FC<EditUserProps> = ({ open, onClose, user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    isActive: true,
    phone: "",
    whatsappInstanceId: "",
    whatsappToken: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        isActive: user.isActive ?? true,
        phone: (user as any).phone || "",
        whatsappInstanceId: (user as any).whatsappInstanceId || "",
        whatsappToken: (user as any).whatsappToken || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await dispatch(updateUserAction(user.id, formData));
      onClose();
    } catch (err) {
      console.error("Update user error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,0.2)", overflow: "hidden" }
      }}
    >
      {/* ================= HEADER ================= */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.5,
        }}
      >
        <EditIcon sx={{ color: "#64b5f6" }} /> Edit User Details
      </DialogTitle>

      {/* ================= CONTENT ================= */}
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
        <Box
          display="flex"
          flexDirection="column"
          gap={2.5}
          mt={1}
          sx={{
            "& .MuiTextField-root": {
              backgroundColor: "white",
              borderRadius: 1,
            },
          }}
        >
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />

          {/* ⭐ Phone Number field for Dealer WhatsApp alerts */}
          <TextField
            label="Phone Number (For Dealer WhatsApp)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            placeholder="e.g. 919876543210"
          />

          {/* ⭐ Admin / SuperAdmin credentials setup */}
          {formData.role !== "user" && (
            <>
              <TextField
                label="UltraMsg Instance ID (Admin Only)"
                name="whatsappInstanceId"
                value={formData.whatsappInstanceId}
                onChange={handleChange}
                fullWidth
                placeholder="e.g. instance12345"
              />

              <TextField
                label="UltraMsg Token (Admin Only)"
                name="whatsappToken"
                value={formData.whatsappToken}
                onChange={handleChange}
                fullWidth
                placeholder="e.g. abcdef12345678"
              />
            </>
          )}

          {loggedInUser?.role === "superadmin" && (
            <TextField
              select
              label="User Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>
          )}

          <TextField
            select
            label="Active Status"
            name="isActive"
            value={formData.isActive ? "true" : "false"}
            onChange={(e) =>
              setFormData({
                ...formData,
                isActive: e.target.value === "true",
              })
            }
            fullWidth
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      {/* ================= FOOTER ================= */}
      <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa", justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          color="error"
          variant="outlined"
          sx={{ borderRadius: 2, mr: 1, px: 3, fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            fontWeight: 600, 
            background: "linear-gradient(90deg, #1976d2, #42a5f5)" 
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUser;