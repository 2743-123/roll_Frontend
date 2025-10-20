import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addBalanceAction } from "../../../Actions/Auth/balance";
import { User } from "../../../ActionType/user/userTypes";

interface AddBalanceDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddBalanceDialog: React.FC<AddBalanceDialogProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user); // All users
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [flyashAmount, setFlyashAmount] = useState<number | "">("");
  const [bedashAmount, setBedashAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  // Set first user as default if open
  useEffect(() => {
    if (open && users && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [open, users]);

  const handleSubmit = async () => {
    if (!selectedUserId || (!flyashAmount && !bedashAmount)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        addBalanceAction({
          userId: selectedUserId,
          flyashAmount: flyashAmount || 0,
          bedashAmount: bedashAmount || 0,
        })
      );
      // Reset amounts (keep user fixed)
      setFlyashAmount("");
      setBedashAmount("");
      onClose();
    } catch (err) {
      console.error("Failed to add balance:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Balance</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {/* User Dropdown */}
        <TextField
          select
          label="Select User"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
          fullWidth
        >
          {users.map((u: User) => (
            <MenuItem key={u.id} value={u.id}>
              {u.name} ({u.email})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Flyash Amount (₹)"
          type="number"
          value={flyashAmount}
          onChange={(e) => setFlyashAmount(Number(e.target.value))}
          fullWidth
        />
        <TextField
          label="Bedash Amount (₹)"
          type="number"
          value={bedashAmount}
          onChange={(e) => setBedashAmount(Number(e.target.value))}
          fullWidth
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
          {loading ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBalanceDialog;
