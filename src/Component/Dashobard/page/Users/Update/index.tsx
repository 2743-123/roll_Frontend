import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Paper,
  Box,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import { updateUserAction } from "../../../../../Actions/Auth/user";
import { User } from "../../../../../ActionType/user/userTypes";

interface EditUserProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const EditUser: React.FC<EditUserProps> = ({ open, onClose, user }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    await dispatch(updateUserAction(user.id, formData));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)",
          borderRadius: 3,
        }}
      >
        {/* 🔷 Header */}
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.2rem",
            py: 1.5,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          Edit User
        </DialogTitle>

        {/* 🧾 Content */}
        <DialogContent
          dividers
          sx={{
            p: 3,
            backgroundColor: "white",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2.5}
            sx={{
              "& .MuiTextField-root": {
                backgroundColor: "#f9f9f9",
                borderRadius: 1,
              },
            }}
          >
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>

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

        {/* ⚙️ Footer */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: "#f1f5f9",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ borderRadius: 2 }}
          >
            Update
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default EditUser;
