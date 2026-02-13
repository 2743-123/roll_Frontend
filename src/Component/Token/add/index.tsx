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
  Paper,
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
    materialType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!selectedUser) return alert("Please select a user first!");

    dispatch(createTokenAction({ ...form, userId: selectedUser.id }));
    onClose();

    setForm({ customerName: "", materialType: "" });
  };

  /** ✅ Button disable condition */
  const isFormInvalid =
    !form.customerName.trim() ||
    !form.materialType ||
    !selectedUser;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)",
          borderRadius: 3,
        }}
      >
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
          Add New Token
        </DialogTitle>

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
            gap={2}
            sx={{
              "& .MuiTextField-root": {
                backgroundColor: "#f9f9f9",
                borderRadius: 1,
              },
            }}
          >
            <TextField
              label="Customer Name"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              select
              label="Material Type"
              name="materialType"
              value={form.materialType}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="flyash">Flyash</MenuItem>
              <MenuItem value="bedash">Bedash</MenuItem>
              <MenuItem value="cement">Cement</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

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
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isFormInvalid}
            sx={{ borderRadius: 2 }}
          >
            Create Token
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default AddTokenDialog;
