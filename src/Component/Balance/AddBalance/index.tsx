import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addBalanceAction } from "../../../Actions/Auth/balance";

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

const RATE_PER_TON = 180; // ⭐ constant rate

const AddBalanceDialog: React.FC<AddBalanceDialogProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);

  const userList = Array.isArray(users) ? users : [users];
  const onlyUsers = userList.filter(
    (u: any) => u.role?.toLowerCase() === "user",
  );

  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [flyashAmount, setFlyashAmount] = useState<number | "">("");
  const [bedashAmount, setBedashAmount] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ Auto select first user
  useEffect(() => {
    if (open && selectedUserId === "" && onlyUsers.length > 0) {
      setSelectedUserId(onlyUsers[0].id);
    }
  }, [open, onlyUsers, selectedUserId]);

  // ================= REAL-TIME TONS =================

  const flyashTons = flyashAmount
    ? (Number(flyashAmount) / RATE_PER_TON).toFixed(2)
    : "0";

  const bedashTons = bedashAmount
    ? (Number(bedashAmount) / RATE_PER_TON).toFixed(2)
    : "0";

  const totalTons = (Number(flyashTons) + Number(bedashTons)).toFixed(2);

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    if (!selectedUserId || (!flyashAmount && !bedashAmount)) {
      alert("Please fill required fields");
      return;
    }

    if (paymentMode === "cash" && !bankName) {
      alert("Enter bank name for cash payment");
      return;
    }

    if (paymentMode === "online" && (!accountHolder || !referenceNumber)) {
      alert("Fill account holder & reference number");
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
        }),
      );

      // reset
      setFlyashAmount("");
      setBedashAmount("");
      setBankName("");
      setAccountHolder("");
      setReferenceNumber("");
      setPaymentMode("cash");

      onClose();
    } catch (err) {
      console.error("Add balance error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
        Add Balance
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* USER */}
        <TextField
          select
          label="Select User"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
          fullWidth
        >
          {onlyUsers.map((user: any) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
        </TextField>

        {/* AMOUNTS */}
        <TextField
          label="Flyash Amount (₹)"
          type="number"
          value={flyashAmount}
          onChange={(e) =>
            setFlyashAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          fullWidth
        />

        <TextField
          label="Bedash Amount (₹)"
          type="number"
          value={bedashAmount}
          onChange={(e) => setBedashAmount(Number(e.target.value))}
          fullWidth
        />

        {/* ⭐ LIVE TONS BOX */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Live Tons Calculation
          </Typography>

          <Typography variant="body2">
            Flyash Tons: <strong>{flyashTons}</strong>
          </Typography>

          <Typography variant="body2">
            Bedash Tons: <strong>{bedashTons}</strong>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Total Tons: <strong>{totalTons}</strong>
          </Typography>
        </Box>

        {/* PAYMENT MODE */}
        <TextField
          select
          label="Payment Mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value as any)}
          fullWidth
        >
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="online">Online</MenuItem>
        </TextField>

        {/* CONDITIONAL FIELDS */}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? "Adding..." : "Add Balance"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBalanceDialog;
