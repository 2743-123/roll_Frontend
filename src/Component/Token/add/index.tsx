// src/Component/Token/AddTokenDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../store";
import { createTokenAction } from "../../../Actions/Auth/TokenAction";

interface AddTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddTokenDialog: React.FC<AddTokenDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);

  const [form, setForm] = useState({
    customerName: "",
    truckNumber: "",
    materialType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!selectedUser) return alert("Please select a user first!");
    dispatch(createTokenAction({ ...form, userId: selectedUser.id }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Token</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Customer Name"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Truck Number"
            name="truckNumber"
            value={form.truckNumber}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Material Type"
            name="materialType"
            value={form.materialType}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="flyash">Flyash</MenuItem>
            <MenuItem value="bedash">Bedash</MenuItem>
            <MenuItem value="cement">Cement</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Token
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTokenDialog;
