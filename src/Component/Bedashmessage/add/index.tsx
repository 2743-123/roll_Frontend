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
} from "@mui/material";
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
  const { users } = useSelector((state: RootState) => state.user); // list of all users
  const userList = Array.isArray(users) ? users : [users]; // ✅ safe fallback

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

  // 🔹 Fetch all users on mount
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
      dispatch(getBedashListAction()); // Refresh list
      onClose();
    } catch (error) {
      console.error("Add bedash error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Bedash Material</DialogTitle>
      <DialogContent dividers>
        {/* 🧍 User Dropdown */}
        <TextField
          select
          label="Select User"
          name="userId"
          value={form.userId}
          onChange={handleChange}
          fullWidth
          margin="normal"
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

        {/* 🧱 Material Type (fixed) */}
        <TextField
          label="Material Type"
          name="materialType"
          value="bedash"
          fullWidth
          margin="normal"
          disabled
        />

        {/* 📅 Custom Date */}
        <TextField
          label="Custom Date"
          name="customDate"
          type="date"
          value={form.customDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        {/* 📅 Target Date */}
        <TextField
          label="Target Date"
          name="targetDate"
          type="date"
          value={form.targetDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        {/* 💰 Amount */}
        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBedashDialog;
