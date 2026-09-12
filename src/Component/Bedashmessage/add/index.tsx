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
  
  // 🟢 1. Get logged-in user from Redux Auth State
  const loggedInUser = useSelector((state: any) => state.auth?.user || state.user?.user); 
  
  const { users } = useSelector((state: RootState) => state.user);
  
  // 🟢 2. Fetch Bedash list to check pending status
  const { data: bedashList } = useSelector((state: RootState) => state.bedash);

  const userList = Array.isArray(users) ? users : [users];

  // 🟢 3. Find IDs/Names of users who already have a "pending" bedash
  const pendingUsers = (bedashList || [])
    .filter((item: any) => item.status === "pending");
  
  const pendingUserIds = pendingUsers.map((item: any) => item.userId); 
  const pendingUserNames = pendingUsers.map((item: any) => item.userName);

  // 🟢 4. Filter Dropdown: Exclude pending & inactive users, then sort A-Z
  const onlyUsers = userList
    .filter((u: any) => {
      const isRoleUser = u.role?.toLowerCase() === "user";
      const isActiveUser = Boolean(u.isActive);
      
      const isNotPending = !pendingUserIds.includes(u.id) && !pendingUserNames.includes(u.name);
      
      return isRoleUser && isActiveUser && isNotPending;
    })
    .sort((a: any, b: any) => {
      const nameA = (a.name || "").trim().toLowerCase();
      const nameB = (b.name || "").trim().toLowerCase();
      return nameA.localeCompare(nameB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  const [form, setForm] = React.useState({
    userId: "",
    materialType: "bedash",
    customDate: "",
    targetDate: "",
    amount: "",
    reminderPhone: "",
  });
  const [loading, setLoading] = React.useState(false);

  // ⭐ 5. Custom Type-Ahead Search Logic (Substring match + Scroll + Highlight)
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const searchStringRef = React.useRef<string>("");

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(event.key)) {
      return;
    }

    event.stopPropagation();
    event.preventDefault(); // Default single-letter search roko

    if (event.key === "Backspace") {
      searchStringRef.current = searchStringRef.current.slice(0, -1);
    } else if (event.key.length === 1) {
      searchStringRef.current += event.key.toLowerCase();
    }

    if (searchStringRef.current) {
      const match = onlyUsers.find((u: any) =>
        u.name.toLowerCase().includes(searchStringRef.current)
      );

      if (match) {
        const el = document.getElementById(`add-bedash-user-${match.id}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      }
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchStringRef.current = "";
    }, 1500);
  };

  React.useEffect(() => {
    if (loggedInUser?.role === "user") {
      setForm((prev) => ({ ...prev, userId: loggedInUser.id }));
    } else {
      dispatch(getuserAction());
    }
  }, [dispatch, loggedInUser]);

  React.useEffect(() => {
    if (!open) {
      searchStringRef.current = ""; // Dialog band hone pe search reset
    }
  }, [open]);

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
        userId: loggedInUser?.role === "user" ? loggedInUser.id : "",
        materialType: "bedash",
        customDate: "",
        targetDate: "",
        amount: "",
        reminderPhone: "",
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

      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
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
              name="userId"
              value={form.userId}
              onChange={(e) => {
                handleChange(e);
                searchStringRef.current = ""; // Selection hone pe search string reset
              }}
              fullWidth
              required
              sx={{ bgcolor: "white", borderRadius: 1 }}
              SelectProps={{
                MenuProps: {
                  MenuListProps: {
                    onKeyDown: handleMenuKeyDown, // 🟢 Handle Keydown Logic attach kiya
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 250, // Scrollable view
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
                    id={`add-bedash-user-${user.id}`} // 🟢 ID add kiya focus scroll ke liye
                    sx={{
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
                <MenuItem disabled>No eligible active users found</MenuItem>
              )}
            </TextField>
          )}

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

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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

          <TextField
            label="Reminder WhatsApp No. (Optional)"
            name="reminderPhone"
            type="text"
            value={form.reminderPhone}
            onChange={handleChange}
            fullWidth
            placeholder="e.g. 919876543210"
            helperText="Enter number with country code (e.g., 91) to send a direct WhatsApp alert to the user."
            sx={{ bgcolor: "white", borderRadius: 1 }}
          />
        </Box>
      </DialogContent>

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