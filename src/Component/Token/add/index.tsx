import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Box, Autocomplete, CircularProgress, Select, FormControl, InputLabel } from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { createTokenAction, getAdminTokensAction } from "../../../Actions/Auth/TokenAction";

interface AddTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddTokenDialog: React.FC<AddTokenDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { data: allTokens } = useSelector((state: RootState) => state.adminTokenReducer);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    materialType: "",
    cartingOwnerName: "",
    cartingOwnerPhone: "",
    tokenOwnerType: "owner",
    anotherTokenOwnerName: "",
    anotherTokenOwnerPhone: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) dispatch(getAdminTokensAction());
  }, [open, dispatch]);

  // ⭐ 1. Customer Name Options
  const customerOptions = useMemo(() => {
    if (!allTokens) return [];
    const names = allTokens.map((t: any) => t.customerName).filter((name: string) => !!name);
    return Array.from(new Set(names));
  }, [allTokens]);

  // ⭐ 2. Carting Owner Options
  const cartingOptions = useMemo(() => {
    if (!allTokens) return [];
    const names = allTokens.map((t: any) => t.cartingOwnerName).filter((name: string) => !!name);
    return Array.from(new Set(names));
  }, [allTokens]);

  // ⭐ 3. Another Token Owner Options
  const anotherOwnerOptions = useMemo(() => {
    if (!allTokens) return [];
    const names = allTokens.map((t: any) => t.anotherTokenOwnerName).filter((name: string) => !!name);
    return Array.from(new Set(names));
  }, [allTokens]);

  const handleSubmit = async () => {
    if (!selectedUser) { alert("Please select a user first!"); return; }
    try {
      setLoading(true);
      await dispatch(createTokenAction({ ...form, userId: selectedUser.id }));
      setForm({ customerName: "", customerPhone: "", materialType: "", cartingOwnerName: "", cartingOwnerPhone: "", tokenOwnerType: "owner", anotherTokenOwnerName: "", anotherTokenOwnerPhone: "" });
      onClose();
    } catch (err) { console.error("Create token error:", err); }
    finally { setLoading(false); }
  };

  const isBedash = form.materialType === "bedash";
  const isFormInvalid = 
    !form.customerName.trim() || !form.customerPhone.trim() || !form.materialType || !selectedUser ||
    (isBedash && !form.cartingOwnerName.trim()) || 
    (isBedash && form.tokenOwnerType === "another" && !form.anotherTokenOwnerName.trim());

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", color: "white", display: "flex", gap: 1.5, p: 2.5 }}>
        <AddCardIcon sx={{ color: "#81c784" }} /> Add New Token
      </DialogTitle>
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa" }}>
        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
          
          <Autocomplete
            freeSolo options={customerOptions} inputValue={form.customerName}
            onInputChange={(_, value) => setForm(p => ({ ...p, customerName: value }))}
            renderInput={(params) => <TextField {...params} label="Customer Name" fullWidth required sx={{bgcolor: 'white'}} />}
          />
          <TextField label="Customer WhatsApp Number" fullWidth required value={form.customerPhone} onChange={(e) => setForm(p => ({ ...p, customerPhone: e.target.value }))} sx={{bgcolor: 'white'}} />
          <TextField select label="Material Type" value={form.materialType} onChange={(e) => setForm(p => ({ ...p, materialType: e.target.value }))} fullWidth required sx={{bgcolor: 'white'}}>
            <MenuItem value="flyash">Flyash</MenuItem>
            <MenuItem value="bedash">Bedash</MenuItem>
            <MenuItem value="cement">Cement</MenuItem>
          </TextField>

          {/* ⭐ BEDASH EXTRA FIELDS */}
          {isBedash && (
            <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 2, border: "1px dashed #ffb74d", display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* ✅ AUTOCOMPLETE FOR CARTING OWNER */}
              <Autocomplete
                freeSolo options={cartingOptions} inputValue={form.cartingOwnerName}
                onInputChange={(_, value) => setForm(p => ({ ...p, cartingOwnerName: value }))}
                renderInput={(params) => <TextField {...params} label="Carting Owner Name" fullWidth required sx={{bgcolor: 'white'}} />}
              />
              <TextField label="Carting WhatsApp (Opt)" fullWidth value={form.cartingOwnerPhone} onChange={(e) => setForm(p => ({ ...p, cartingOwnerPhone: e.target.value }))} sx={{bgcolor: 'white'}} />
              
              <FormControl fullWidth sx={{ bgcolor: "white" }}>
                <InputLabel>Token Owner Type</InputLabel>
                <Select value={form.tokenOwnerType} label="Token Owner Type" onChange={(e) => setForm(p => ({ ...p, tokenOwnerType: e.target.value }))}>
                  <MenuItem value="owner">Selected Owner (Default)</MenuItem>
                  <MenuItem value="another">Another Token Owner</MenuItem>
                </Select>
              </FormControl>

              {form.tokenOwnerType === "another" && (
                <>
                  {/* ✅ AUTOCOMPLETE FOR ANOTHER OWNER */}
                  <Autocomplete
                    freeSolo options={anotherOwnerOptions} inputValue={form.anotherTokenOwnerName}
                    onInputChange={(_, value) => setForm(p => ({ ...p, anotherTokenOwnerName: value }))}
                    renderInput={(params) => <TextField {...params} label="Another Owner Name" fullWidth required sx={{bgcolor: 'white'}} />}
                  />
                  <TextField label="Another WhatsApp (Opt)" fullWidth value={form.anotherTokenOwnerPhone} onChange={(e) => setForm(p => ({ ...p, anotherTokenOwnerPhone: e.target.value }))} sx={{bgcolor: 'white'}} />
                </>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa" }}>
        <Button onClick={onClose} color="error" variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isFormInvalid || loading}>{loading ? <CircularProgress size={24} /> : "Create Token"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTokenDialog;