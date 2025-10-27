import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { addUserAction } from "../../../../../Actions/Auth/user";
import { AppDispatch, RootState } from "../../../../../store";

interface AddUsersProps {
  open: boolean;
  onClose: () => void;
}

const AddUsers: React.FC<AddUsersProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  // 🆕 Get logged-in user from Redux
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "superadmin",
    isActive: true,
  });

  // 🧠 Generate role options dynamically based on who is logged in
  const getRoleOptions = () => {
    if (loggedInUser?.role === "superadmin") {
      return [
        { value: "superadmin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
      ];
    }
    if (loggedInUser?.role === "admin") {
      return [{ value: "user", label: "User" }];
    }
    return [];
  };

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Role change
  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setForm({
      ...form,
      role: e.target.value as "user" | "admin" | "superadmin",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addUserAction({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })
    );
    onClose();
    setForm({
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
        Add New User
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          dividers
          sx={{
            background: "rgba(255,255,255,0.02)",
            p: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={handleChange}
                variant="outlined"
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
            </Grid>

            <Grid>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={handleChange}
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
            </Grid>

            <Grid>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={handleChange}
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
            </Grid>

            <Grid>
              <FormControl fullWidth required>
                <InputLabel id="role-label" sx={{ color: "#bbb" }}>
                  Role
                </InputLabel>
                <Select
                  labelId="role-label"
                  value={form.role}
                  onChange={handleRoleChange}
                  sx={{
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#333",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00bcd4",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00bcd4",
                    },
                  }}
                >
                  {getRoleOptions().map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
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
            type="submit"
            variant="contained"
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
            Add User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUsers;
