import React, { useState, useEffect, useRef } from "react";
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
  Grid,
  InputAdornment,
  Divider,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalculateIcon from "@mui/icons-material/Calculate";
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
  
  // 🟢 1. Logged-in user nikalna
  const loggedInUser = useSelector((state: any) => state.auth?.user || state.user?.user);

  const { users } = useSelector((state: RootState) => state.user);

  const userList = Array.isArray(users) ? users : [users];
  
  // 🟢 2. Filter & Sort Logic: Inactive hide karein aur A-Z sort karein
  const onlyUsers = userList
    .filter((u: any) => {
      const isRoleUser = u.role?.toLowerCase() === "user";
      const isActiveUser = Boolean(u.isActive); 
      return isRoleUser && isActiveUser;
    })
    .sort((a: any, b: any) => { 
      const nameA = (a.name || "").trim().toLowerCase();
      const nameB = (b.name || "").trim().toLowerCase();
      return nameA.localeCompare(nameB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [flyashAmount, setFlyashAmount] = useState<number | "">("");
  const [bedashAmount, setBedashAmount] = useState<number | "">("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ 3. Custom Search Logic (Anywhere Match / Substring Type-ahead)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchStringRef = useRef<string>("");

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    // Standard navigation aur enter keys ko ignore karo (unhe default chalne do)
    if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(event.key)) {
      return;
    }

    event.stopPropagation();
    event.preventDefault(); // Stop default starting-letter search of MUI

    if (event.key === "Backspace") {
      searchStringRef.current = searchStringRef.current.slice(0, -1);
    } else if (event.key.length === 1) {
      searchStringRef.current += event.key.toLowerCase();
    }

    if (searchStringRef.current) {
      // 🟢 Yeh "includes" ki wajah se naam ke beech me se bhi match karega
      const match = onlyUsers.find((u: any) =>
        u.name.toLowerCase().includes(searchStringRef.current)
      );

      if (match) {
        // Focus (Highlight) and scroll to matched user
        const el = document.getElementById(`add-balance-user-${match.id}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      }
    }

    // 1.5 second tak kuch type nahi kiya to string reset ho jayegi
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchStringRef.current = "";
    }, 1500);
  };

  useEffect(() => {
    if (loggedInUser?.role === "user") {
      setSelectedUserId(loggedInUser.id);
    } else if (open && selectedUserId === "" && onlyUsers.length > 0) {
      setSelectedUserId(onlyUsers[0].id);
    }

    // Modal band hone par search reset
    if (!open) searchStringRef.current = "";
  }, [open, onlyUsers, selectedUserId, loggedInUser]);

  // ================= REAL-TIME TONS =================
  const flyashTons = flyashAmount ? (Number(flyashAmount) / RATE_PER_TON).toFixed(2) : "0.00";
  const bedashTons = bedashAmount ? (Number(bedashAmount) / RATE_PER_TON).toFixed(2) : "0.00";
  const totalTons = (Number(flyashTons) + Number(bedashTons)).toFixed(2);
  const totalAmount = Number(flyashAmount || 0) + Number(bedashAmount || 0);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!selectedUserId || (!flyashAmount && !bedashAmount)) {
      alert("Please fill required fields (User and at least one amount).");
      return;
    }

    if (paymentMode === "cash" && !bankName) {
      alert("Enter bank name for cash payment.");
      return;
    }

    if (paymentMode === "online" && (!accountHolder || !referenceNumber)) {
      alert("Fill account holder & reference number for online payment.");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        addBalanceAction({
          userId: Number(selectedUserId),
          flyashAmount: Number(flyashAmount) || 0,
          bedashAmount: Number(bedashAmount) || 0,
          paymentMode,
          bankName: paymentMode === "cash" ? bankName : bankName,
          accountHolder: paymentMode === "online" ? accountHolder : "",
          referenceNumber: paymentMode === "online" ? referenceNumber : "",
        })
      );

      // reset
      setFlyashAmount("");
      setBedashAmount("");
      setBankName("");
      setAccountHolder("");
      setReferenceNumber("");
      setPaymentMode("cash");
      
      if (loggedInUser?.role !== "user") {
        setSelectedUserId(""); 
      }
      onClose();
    } catch (err) {
      console.error("Add balance error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
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
      <DialogTitle 
        sx={{ 
          background: "linear-gradient(135deg, #1976d2, #42a5f5)", 
          color: "white", 
          fontWeight: 700, 
          display: "flex", 
          alignItems: "center", 
          gap: 1.5,
          p: 2.5
        }}
      >
        <AccountBalanceWalletIcon /> Add New Balance
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa" }}>
        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
          
          {loggedInUser?.role === "user" ? (
            <TextField
              label="Customer / User"
              value={loggedInUser.name} 
              fullWidth
              disabled
              sx={{ 
                bgcolor: "#f5f5f5", 
                borderRadius: 1,
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#333",
                  fontWeight: 600
                }
              }}
            />
          ) : (
            <TextField
              select
              label="Select Customer / User"
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(Number(e.target.value));
                searchStringRef.current = ""; // Selection ke baad reset
              }}
              fullWidth
              sx={{ bgcolor: "white", borderRadius: 1 }}
              SelectProps={{
                MenuProps: {
                  // 🟢 Yeh prop Custom KeyDown function pass karta hai list ko
                  MenuListProps: {
                    onKeyDown: handleMenuKeyDown,
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 250, // Dropdown max height
                    }
                  }
                }
              }}
            >
              {onlyUsers.length > 0 ? (
                onlyUsers.map((user: any) => (
                  <MenuItem 
                    key={user.id} 
                    value={user.id}
                    id={`add-balance-user-${user.id}`} // Focus find karne ke liye ID diya
                    sx={{
                      // 🟢 Focus hone par Dark Blue Highlight hoga
                      "&:focus": {
                        backgroundColor: "#1976d2 !important",
                        color: "white !important",
                        fontWeight: 700,
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        fontWeight: 700,
                      },
                      "&.Mui-selected:focus": {
                        backgroundColor: "#1565c0 !important",
                        color: "white !important",
                      }
                    }}
                  >
                    {user.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No active users found</MenuItem>
              )}
            </TextField>
          )}

          {/* AMOUNTS (Side by Side) */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Flyash Amount"
                type="number"
                value={flyashAmount}
                onChange={(e) => setFlyashAmount(e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                sx={{ bgcolor: "white", borderRadius: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Bedash Amount"
                type="number"
                value={bedashAmount}
                onChange={(e) => setBedashAmount(e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                sx={{ bgcolor: "white", borderRadius: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>

          {/* ⭐ LIVE TONS BOX */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "#e3f2fd",
              border: "1px dashed #1976d2",
            }}
          >
            <Typography variant="subtitle2" color="primary.main" display="flex" alignItems="center" gap={1} mb={1.5} fontWeight={700}>
              <CalculateIcon fontSize="small" /> Live Conversion (Rate: ₹{RATE_PER_TON}/Ton)
            </Typography>
            
            <Grid container spacing={2} textAlign="center">
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">Flyash</Typography>
                <Typography variant="body1" fontWeight={700} color="text.primary">{flyashTons} T</Typography>
              </Grid>
              <Grid size={{ xs: 4 }} sx={{ borderLeft: "1px solid #bbdefb", borderRight: "1px solid #bbdefb" }}>
                <Typography variant="caption" color="text.secondary" display="block">Bedash</Typography>
                <Typography variant="body1" fontWeight={700} color="text.primary">{bedashTons} T</Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">Total Capacity</Typography>
                <Typography variant="body1" fontWeight={700} color="success.main">{totalTons} T</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* PAYMENT DETAILS */}
          <TextField
            select
            label="Payment Mode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as any)}
            fullWidth
            sx={{ bgcolor: "white", borderRadius: 1 }}
          >
            <MenuItem value="cash">Cash Payment</MenuItem>
            <MenuItem value="online">Online Transfer (Bank/UPI)</MenuItem>
          </TextField>

          {/* CONDITIONAL FIELDS */}
          {paymentMode === "cash" && (
            <TextField
              label="Bank Name (Cash Deposit)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              fullWidth
              sx={{ bgcolor: "white", borderRadius: 1 }}
            />
          )}

          {paymentMode === "online" && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  fullWidth
                  sx={{ bgcolor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Account Holder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  fullWidth
                  sx={{ bgcolor: "white", borderRadius: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Reference Number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  fullWidth
                  sx={{ bgcolor: "white", borderRadius: 1 }}
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa", borderTop: "1px solid #e0e0e0", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ pl: 1 }}>
          Total: <span style={{ color: "#2e7d32" }}>₹{totalAmount.toLocaleString("en-IN")}</span>
        </Typography>
        <Box>
          <Button onClick={onClose} color="error" variant="outlined" sx={{ borderRadius: 2, mr: 1.5, px: 3 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={loading} 
            onClick={handleSubmit}
            sx={{ borderRadius: 2, px: 4, fontWeight: 600, background: "linear-gradient(90deg, #1976d2, #42a5f5)" }}
          >
            {loading ? "Processing..." : "Confirm & Add"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddBalanceDialog;