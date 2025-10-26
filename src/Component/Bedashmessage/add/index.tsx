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
  Paper,
  Box,
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)",
          borderRadius: 3,
        }}
      >
        {/* 🔷 Header */}
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.2rem",
            py: 1.5,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          Add Bedash Material
        </DialogTitle>

        {/* 🧾 Content */}
        <DialogContent
          dividers
          sx={{
            p: 3,
            backgroundColor: "white",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              "& .MuiTextField-root": {
                backgroundColor: "#f9f9f9",
                borderRadius: 1,
              },
            }}
          >
            {/* 🧍 Select User */}
            <TextField
              select
              label="Select User"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              fullWidth
              required
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
            />

            {/* 📅 Custom Date */}
            <TextField
              label="Custom Date"
              name="customDate"
              type="date"
              value={form.customDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            {/* 📅 Target Date */}
            <TextField
              label="Target Date"
              name="targetDate"
              type="date"
              value={form.targetDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            {/* 💰 Amount */}
            <TextField
              label="Amount (₹)"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>

        {/* ⚙️ Footer */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: "#f1f5f9",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : "Add Material"}
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default AddBedashDialog;
