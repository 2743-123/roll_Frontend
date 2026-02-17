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
  getAdminTokensAction, // ⭐ IMPORTANT (all users tokens)
} from "../../../Actions/Auth/TokenAction";

interface AddTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddTokenDialog: React.FC<AddTokenDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  /** ⭐ Selected user */
  const { selectedUser } = useSelector((state: RootState) => state.user);

  /** ⭐ ALL TOKENS (admin reducer) */
  const { data: allTokens } = useSelector(
    (state: RootState) => state.adminTokenReducer
  );

  /** ================= FORM ================= */
  const [form, setForm] = useState({
    customerName: "",
    materialType: "",
  });

  /** 🔄 Fetch ALL tokens when dialog opens */
  useEffect(() => {
    if (open) {
      dispatch(getAdminTokensAction()); // ⭐ fetch global tokens
    }
  }, [open, dispatch]);

  /** ================= CUSTOMER OPTIONS ================= */
  const customerOptions = useMemo(() => {
    if (!allTokens) return [];

    const names = allTokens
      .map((t: any) => t.customerName)
      .filter((name: string) => !!name);

    return Array.from(new Set(names)); // ⭐ unique customers
  }, [allTokens]);

  /** ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (!selectedUser) {
      alert("Please select a user first!");
      return;
    }

    dispatch(
      createTokenAction({
        ...form,
        userId: selectedUser.id,
      })
    );

    /** reset */
    setForm({ customerName: "", materialType: "" });
    onClose();
  };

  /** ================= VALIDATION ================= */
  const isFormInvalid =
    !form.customerName.trim() || !form.materialType || !selectedUser;

  /** ================= UI ================= */
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)",
          borderRadius: 3,
        }}
      >
        {/* HEADER */}
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

        {/* CONTENT */}
        <DialogContent dividers sx={{ p: 3, backgroundColor: "white" }}>
          <Box display="flex" flexDirection="column" gap={2}>
            
            {/* ⭐ GLOBAL CUSTOMER AUTOCOMPLETE */}
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

            {/* MATERIAL TYPE */}
            <TextField
              select
              label="Material Type"
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

        {/* ACTIONS */}
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
