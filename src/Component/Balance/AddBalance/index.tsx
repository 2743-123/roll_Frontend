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

export interface AddBalancePayload {
  userId: number;
  flyashAmount: number;
  bedashAmount: number;
  paymentMode?: "cash" | "online";
  bankName?: string;
  accountHolder?: string;
  referenceNumber?: string;
}

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
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
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

    if (paymentMode === "cash" && !bankName) {
      alert("Please enter bank name for cash payment");
      return;
    }

    if (paymentMode === "online" && (!accountHolder || !referenceNumber)) {
      alert("Please fill account holder and reference number for online payment");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        addBalanceAction({
          userId: selectedUserId,
          flyashAmount: flyashAmount || 0,
          bedashAmount: bedashAmount || 0,
          paymentMode,
          bankName: paymentMode === "cash" ? bankName : "",
          accountHolder: paymentMode === "online" ? accountHolder : "",
          referenceNumber: paymentMode === "online" ? referenceNumber : "",
        })
      );
      // Reset amounts and other fields (keep user fixed)
      setFlyashAmount("");
      setBedashAmount("");
      setBankName("");
      setAccountHolder("");
      setReferenceNumber("");
      setPaymentMode("cash");
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
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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

        {/* Flyash & Bedash Amount */}
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

        {/* Payment Mode Dropdown */}
        <TextField
          select
          label="Payment Mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value as "cash" | "online")}
          fullWidth
        >
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="online">Online</MenuItem>
        </TextField>

        {/* Conditional fields based on payment mode */}
        {paymentMode === "cash" && (
          <TextField
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            fullWidth
          />
        )}

        {paymentMode === "online" && (
          <>
            <TextField
              label="Account Holder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              fullWidth
            />
            <TextField
              label="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              fullWidth
            />
          </>
        )}
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
