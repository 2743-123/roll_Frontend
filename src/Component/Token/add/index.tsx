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
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";

import {
  createTokenAction,
  getAdminTokensAction,
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
    customerPhone: "", // 👈 Naya field WhatsApp/Phone ke liye add kiya gaya hai
    materialType: "",
  });
  const [loading, setLoading] = useState(false);

  /** 🔄 Fetch ALL tokens when dialog opens */
  useEffect(() => {
    if (open) {
      dispatch(getAdminTokensAction());
    }
  }, [open, dispatch]);

  /** ================= CUSTOMER OPTIONS ================= */
  const customerOptions = useMemo(() => {
    if (!allTokens) return [];

    const names = allTokens
      .map((t: any) => t.customerName)
      .filter((name: string) => !!name);

    return Array.from(new Set(names));
  }, [allTokens]);

  /** ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedUser) {
      alert("Please select a user first!");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        createTokenAction({
          ...form,
          userId: selectedUser.id,
        })
      );

      /** reset */
      setForm({ customerName: "", customerPhone: "", materialType: "" });
      onClose();
    } catch (err) {
      console.error("Create token error:", err);
    } finally {
      setLoading(false);
    }
  };

  /** ================= VALIDATION ================= */
  const isFormInvalid =
    !form.customerName.trim() || !form.customerPhone.trim() || !form.materialType || !selectedUser;

  /** ================= UI ================= */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          overflow: "hidden"
        }
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
        <AddCardIcon sx={{ color: "#81c784" }} /> Add New Token
      </DialogTitle>

      {/* ================= CONTENT ================= */}
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
        <Box
          display="flex"
          flexDirection="column"
          gap={2.5}
          mt={1}
          sx={{
            "& .MuiTextField-root, & .MuiAutocomplete-root": {
              backgroundColor: "white",
              borderRadius: 1,
            },
          }}
        >
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

          {/* ⭐ CUSTOMER PHONE / WHATSAPP NUMBER */}
          <TextField
            label="Customer WhatsApp Number"
            variant="outlined"
            fullWidth
            required
            placeholder="e.g. 919876543210"
            value={form.customerPhone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customerPhone: e.target.value }))
            }
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
          onClick={handleSubmit}
          variant="contained"
          disabled={isFormInvalid || loading}
          sx={{
            borderRadius: 2,
            px: 4,
            fontWeight: 600,
            background: "linear-gradient(90deg, #1976d2, #42a5f5)",
            boxShadow: "none"
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Create Token"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTokenDialog;