import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  MenuItem,
  Grid,
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
    onClose(); // 👈 Dialog close after update
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 0 }}
      >
        <Grid container spacing={2} mt={2}>
          <Grid>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid>
            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>
          </Grid>

          <Grid>
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
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Button variant="contained" onClick={handleSubmit}>
          Update
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditUser;
