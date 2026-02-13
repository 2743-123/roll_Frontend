// src/Component/Token/AddTokenDialog.tsx
import React, { useState, useMemo, useEffect } from "react";
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
  Autocomplete,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import {
  createTokenAction,
  getTokenAction,
} from "../../../Actions/Auth/TokenAction";

interface AddTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddTokenDialog: React.FC<AddTokenDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { tokens } = useSelector((state: RootState) => state.token);

  const [form, setForm] = useState({
    customerName: "",
    materialType: "",
  });

  /** 🔄 Fetch tokens when dialog opens */
  useEffect(() => {
    if (open && selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  }, [open, selectedUser?.id, dispatch]);

  /** 🔍 Unique customer names (ES5 safe) */
  const customerOptions = useMemo(() => {
    if (!tokens) return [];

    const names = tokens
      .map((t: any) => t.customerName)
      .filter((name: string) => !!name);

    return Array.from(new Set(names)); // ✅ ES5 compatible
  }, [tokens]);

  /** 📝 Submit */
  const handleSubmit = () => {
    if (!selectedUser) {
      alert("Please select a user first!");
      return;
    }

    dispatch(createTokenAction({ ...form, userId: selectedUser.id }));
    onClose();

    setForm({ customerName: "", materialType: "" });
  };

  /** ❌ Disable button */
  const isFormInvalid =
    !form.customerName.trim() || !form.materialType || !selectedUser;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)",
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            py: 1.5,
          }}
        >
          Add New Token
        </DialogTitle>

        {/* Content */}
        <DialogContent dividers sx={{ p: 3, backgroundColor: "white" }}>
          <Box display="flex" flexDirection="column" gap={2}>
            
            {/* ⭐ Customer Autocomplete */}
            <Autocomplete
              freeSolo
              options={customerOptions}
              inputValue={form.customerName}
              onInputChange={(_, value) =>
                setForm((prev) => ({ ...prev, customerName: value }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Name"
                  fullWidth
                  required
                />
              )}
            />

            {/* Material Type */}
            <TextField
              select
              label="Material Type"
              name="materialType"
              value={form.materialType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  materialType: e.target.value,
                }))
              }
              fullWidth
              required
            >
              <MenuItem value="flyash">Flyash</MenuItem>
              <MenuItem value="bedash">Bedash</MenuItem>
              <MenuItem value="cement">Cement</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#f1f5f9" }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isFormInvalid}
          >
            Create Token
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default AddTokenDialog;
