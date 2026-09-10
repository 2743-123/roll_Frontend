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
  Box,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { addUserAction } from "../../../../../Actions/Auth/user";
import { AppDispatch, RootState } from "../../../../../store";

interface AddUsersProps {
  open: boolean;
  onClose: () => void;
}

const AddUsers: React.FC<AddUsersProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // ⭐ Naye fields ko state me add kiya gaya hai
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "superadmin",
    isActive: true,
    phone: "",
    whatsappInstanceId: "",
    whatsappToken: "",
  });
  const [loading, setLoading] = React.useState(false);

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
    return [{ value: "user", label: "User" }];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setForm({
      ...form,
      role: e.target.value as "user" | "admin" | "superadmin",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // ⭐ Submit me naye fields bheje gaye hain
      await dispatch(
        addUserAction({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone,
          whatsappInstanceId: form.whatsappInstanceId,
          whatsappToken: form.whatsappToken,
        }),
      );
      onClose();
      // ⭐ Form reset me naye fields clear kiye gaye hain
      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        isActive: true,
        phone: "",
        whatsappInstanceId: "",
        whatsappToken: "",
      });
    } catch (err) {
      console.error("Add user error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.5,
        }}
      >
        <PersonAddIcon sx={{ color: "#81c784" }} /> Add New User / Admin
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            p: 3,
            bgcolor: "#f8f9fa",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2.5}
            mt={1}
            sx={{
              "& .MuiTextField-root, & .MuiFormControl-root": {
                backgroundColor: "white",
                borderRadius: 1,
              },
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
                  autoComplete="name"
                />
              </Grid>

              <Grid>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  fullWidth
                  required
                  value={form.email}
                  onChange={handleChange}
                  variant="outlined"
                  autoComplete="email"
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
                  variant="outlined"
                  autoComplete="current-password"
                />
              </Grid>

              <Grid>
                <FormControl fullWidth required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    value={form.role}
                    label="Role"
                    onChange={handleRoleChange}
                  >
                    {getRoleOptions().map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* ⭐ NAYE FIELDS YAHAN ADD KIYE GAYE HAIN ⭐ */}
              <Grid>
                <TextField
                  label="Phone Number (For Dealer WhatsApp)"
                  name="phone"
                  fullWidth
                  value={form.phone}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="e.g. 919876543210"
                />
              </Grid>

              {form.role !== "user" && (
                <>
                  <Grid>
                    <TextField
                      label="UltraMsg Instance ID (Admin Only)"
                      name="whatsappInstanceId"
                      fullWidth
                      value={form.whatsappInstanceId}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g. instance12345"
                    />
                  </Grid>

                  <Grid >
                    <TextField
                      label="UltraMsg Token (Admin Only)"
                      name="whatsappToken"
                      fullWidth
                      value={form.whatsappToken}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g. abcdef12345678"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            bgcolor: "#f8f9fa",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={onClose}
            color="error"
            variant="outlined"
            sx={{ borderRadius: 2, mr: 1, px: 3, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Add User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUsers;