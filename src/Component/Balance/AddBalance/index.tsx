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
      alert(
        "Please fill account holder and reference number for online payment",
      );
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

      // Reset
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "linear-gradient(135deg, #1b2735 0%, #090a0f 100%)",
          color: "#fff",
          boxShadow: "0 0 30px rgba(0, 188, 212, 0.25)",
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "linear-gradient(90deg,#00bcd4,#2196f3)",
          color: "#fff",
        }}
      >
        Add Balance
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 4,
        }}
      >
        {/* User Dropdown */}
        <TextField
          select
          label="Select User"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
          fullWidth
          InputLabelProps={{ style: { color: "#bbb" } }}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#00bcd4" },
              "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
            },
            "& .MuiSelect-select": { color: "#fff" },
          }}
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

        {/* Flyash & Bedash Amount */}
        <TextField
          label="Flyash Amount (₹)"
          type="number"
          value={flyashAmount}
          onChange={(e) => setFlyashAmount(Number(e.target.value))}
          fullWidth
          InputLabelProps={{ style: { color: "#bbb" } }}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#00bcd4" },
              "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
            },
          }}
        />
        <TextField
          label="Bedash Amount (₹)"
          type="number"
          value={bedashAmount}
          onChange={(e) => setBedashAmount(Number(e.target.value))}
          fullWidth
          InputLabelProps={{ style: { color: "#bbb" } }}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#00bcd4" },
              "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
            },
          }}
        />

        {/* Payment Mode */}
        <TextField
          select
          label="Payment Mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value as "cash" | "online")}
          fullWidth
          InputLabelProps={{ style: { color: "#bbb" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#00bcd4" },
              "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
            },
            "& .MuiSelect-select": { color: "#fff" },
          }}
        >
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="online">Online</MenuItem>
        </TextField>

        {/* Conditional Fields */}
        {paymentMode === "cash" && (
          <TextField
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: "#bbb" } }}
            sx={{
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#00bcd4" },
                "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
              },
            }}
          />
        )}

        {paymentMode === "online" && (
          <>
            <TextField
              label="Account Holder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: "#bbb" } }}
              sx={{
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00bcd4" },
                  "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
                },
              }}
            />
            <TextField
              label="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: "#bbb" } }}
              sx={{
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#00bcd4" },
                  "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
                },
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#00bcd4",
            borderColor: "#00bcd4",
            "&:hover": { borderColor: "#2196f3", color: "#2196f3" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            background: "linear-gradient(90deg, #00bcd4, #2196f3)",
            color: "#fff",
            fontWeight: "bold",
            px: 3,
            "&:hover": {
              background: "linear-gradient(90deg, #2196f3, #00bcd4)",
            },
          }}
        >
          {loading ? "Adding..." : "Add Balance"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBalanceDialog;
