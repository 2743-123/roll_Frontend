import React, { useEffect, useMemo, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormHelperText,
  ListItemText,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Reducer";
import { AppDispatch } from "../../store";
import { getuserAction, selectUserAction } from "../../Actions/Auth/user";
import { AuthState } from "../../ActionType/auth";
import { userState } from "../../ActionType/user/userTypes";

export interface User {
  id: number;
  name: string;
  email?: string;
  role: "admin" | "superadmin" | "user";
  isActive?: boolean;
  createdBy?: number | null;
}

const DropDownUserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector(
    (state: RootState) => state.auth
  ) as AuthState;

  const { users } = useSelector(
    (state: RootState) => state.user
  ) as userState;

  const [selected, setSelected] = useState<string>("");

  /**
   * ✅ Fetch users only for admin/superadmin
   */
  useEffect(() => {
    if (
      token &&
      user &&
      (user.role === "admin" || user.role === "superadmin")
    ) {
      dispatch(getuserAction());
    }
  }, [dispatch, token, user]);

  /**
   * ✅ Filter only active "user" role
   * ✅ Sort alphabetically A → Z (case-insensitive)
   */
  const sortedActiveUsers = useMemo(() => {
    return users
      .filter((u) => u.role === "user" && Boolean(u.isActive))
      .slice()
      .sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "en", {
          sensitivity: "base",
        })
      );
  }, [users]);

  /**
   * ✅ Default selected user logic
   */
  useEffect(() => {
    if (!user) return;

    if (user.role === "user") {
      setSelected(user.id.toString());
      dispatch(selectUserAction(user));
    } else if (
      (user.role === "admin" || user.role === "superadmin") &&
      sortedActiveUsers.length > 0
    ) {
      setSelected(sortedActiveUsers[0].id.toString());
      dispatch(selectUserAction(sortedActiveUsers[0]));
    }
  }, [user, sortedActiveUsers, dispatch]);

  /**
   * ✅ Handle dropdown change
   */
  const handleChange = (event: SelectChangeEvent) => {
    const selectedId = Number(event.target.value);
    setSelected(event.target.value);

    const selectedUserObj = users.find((u) => u.id === selectedId);

    if (selectedUserObj) {
      dispatch(selectUserAction(selectedUserObj));
    }
  };

  return (
    <FormControl
      sx={{
        m: 1,
        minWidth: 220,
        "& .MuiInputLabel-root": {
          color: "white",
          fontWeight: 600,
          "&.Mui-focused": { color: "#bbdefb" },
        },
        "& .MuiOutlinedInput-root": {
          color: "white",
          backgroundColor: "rgba(33, 203, 243, 0.15)",
          borderRadius: "12px",
          "& fieldset": { borderColor: "white" },
          "&:hover fieldset": { borderColor: "#64b5f6" },
          "&.Mui-focused fieldset": {
            borderColor: "#2196f3",
            boxShadow: "0 0 8px rgba(33,203,243,0.4)",
          },
        },
        "& .MuiSelect-icon": { color: "white" },
        "& .MuiFormHelperText-root": {
          color: "#e0f7fa",
          fontWeight: 500,
          fontSize: "0.85rem",
        },
      }}
    >
      <InputLabel id="user-select-label">Select User</InputLabel>

      <Select
        labelId="user-select-label"
        value={selected}
        label="Select User"
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#f0f4f8",
              color: "#1976d2",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              "& .MuiMenuItem-root": {
                "&:hover": {
                  backgroundColor: "#bbdefb",
                  color: "#0d47a1",
                },
              },
            },
          },
        }}
      >
        {/* ✅ Normal user */}
        {user?.role === "user" && (
          <MenuItem value={user.id}>{user.name}</MenuItem>
        )}

        {/* ✅ Admin / Superadmin */}
        {(user?.role === "admin" || user?.role === "superadmin") &&
          (sortedActiveUsers.length > 0 ? (
            sortedActiveUsers.map((u) => (
              <MenuItem
                key={u.id}
                value={u.id}
                sx={{
                  backgroundColor:
                    selected === u.id.toString()
                      ? "#bbdefb"
                      : "transparent",
                }}
              >
                <ListItemText primary={u.name} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No active users found</MenuItem>
          ))}
      </Select>

      <FormHelperText>
        {selected ? "User selected" : "Please select a user"}
      </FormHelperText>
    </FormControl>
  );
};

export default DropDownUserList;
