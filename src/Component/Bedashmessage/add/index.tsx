import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Grid,
  InputAdornment,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { getuserAction } from "../../../Actions/Auth/user";
import {
  addBedashAction,
  getBedashListAction,
} from "../../../Actions/Auth/bedash";

interface AddBedashDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddBedashDialog: React.FC<AddBedashDialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);

  const userList = Array.isArray(users) ? users : [users];
  const onlyUsers = userList.filter(
    (u: any) => u.role?.toLowerCase() === "user"
  );

  const [form, setForm] = React.useState({
    userId: "",
    materialType: "bedash",
    customDate: "",
    targetDate: "",
    amount: "",
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    dispatch(getuserAction());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.userId || !form.customDate || !form.targetDate || !form.amount) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      await dispatch(addBedashAction(form));
      dispatch(getBedashListAction());
      onClose();
      setForm({
        userId: "",
        materialType: "bedash",
        customDate: "",
        targetDate: "",
        amount: "",
      });
    } catch (error) {
      console.error("Add bedash error:", error);
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
      {/* 🔷 Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.5,
        }}
      >
        <InventoryIcon /> Add Bedash Material
      </DialogTitle>

      {/* 🧾 Content */}
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
          
          {/* 🧍 Select User */}
          <TextField
            select
            label="Select Customer / User"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            fullWidth
            required
            sx={{ bgcolor: "white", borderRadius: 1 }}
          >
            {onlyUsers.length > 0 ? (
              onlyUsers.map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No users found</MenuItem>
            )}
          </TextField>

          {/* 🧱 Material Type */}
          <TextField
            label="Material Type"
            name="materialType"
            value={form.materialType}
            fullWidth
            disabled
            sx={{ 
              bgcolor: "#f5f5f5", 
              borderRadius: 1,
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#ed6c02",
                fontWeight: 600,
                textTransform: "capitalize"
              }
            }}
          />

          {/* 📅 Dates (Side by Side Grid) */}
          <Grid container spacing={2}>
            <Grid >
              <TextField
                label="Custom Date"
                name="customDate"
                type="date"
                value={form.customDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                sx={{ bgcolor: "white", borderRadius: 1 }}
              />
            </Grid>
            <Grid>
              <TextField
                label="Target Date"
                name="targetDate"
                type="date"
                value={form.targetDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                sx={{ bgcolor: "white", borderRadius: 1 }}
              />
            </Grid>
          </Grid>

          {/* 💰 Amount */}
          <TextField
            label="Initial Amount"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            sx={{ bgcolor: "white", borderRadius: 1 }}
          />
        </Box>
      </DialogContent>

      {/* ⚙️ Footer */}
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
          color="primary"
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            fontWeight: 600, 
            background: "linear-gradient(90deg, #1976d2, #42a5f5)" 
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Material"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBedashDialog;