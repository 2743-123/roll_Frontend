import * as React from "react";
import { useDispatch } from "react-redux";
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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { addUserAction } from "../../../../../Actions/Auth/user";
import { AppDispatch } from "../../../../../store";

interface AddUsersProps {
  open: boolean;
  onClose: () => void;
}

const AddUsers: React.FC<AddUsersProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "superadmin",
    isActive: true,
  });

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

  // isActive toggle
  // const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setForm({ ...form, isActive: e.target.checked });
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dispatch AddUser action
    dispatch(
      addUserAction({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })
    );
    onClose();
    // Reset form
    setForm({
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2} mt={-1}>
            <Grid>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={handleChange}
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
              />
            </Grid>
            <Grid>
              <FormControl fullWidth required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={form.role}
                  onChange={handleRoleChange}
                >
                  <MenuItem value="superadmin">Super Admin</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid>
              <FormControlLabel
                control={
                  <Switch checked={form.isActive} onChange={handleActiveChange} />
                }
                label="Is Active"
              />
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUsers;
