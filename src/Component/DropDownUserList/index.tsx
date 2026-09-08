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
    (state: RootState) => state.auth,
  ) as AuthState;

  const { users } = useSelector((state: RootState) => state.user) as userState;

  const [selected, setSelected] = useState<string>("");

  /**
   * ✅ Fetch users for admin/superadmin
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
   * ✅ Production-safe alphabetical sorting
   */
  const sortedActiveUsers = useMemo(() => {
    return users
      .filter((u) => u.role === "user" && Boolean(u.isActive))
      .slice()
      .sort((a, b) => {
        const nameA = (a.name || "").trim().toLowerCase();
        const nameB = (b.name || "").trim().toLowerCase();

        return nameA.localeCompare(nameB, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
  }, [users]);

  /**
   * ✅ Default selection logic (Runs ONLY ONCE when users are loaded and nothing is selected yet)
   */
  useEffect(() => {
    if (!user) return;

    if (user.role === "user") {
      if (!selected) {
        setSelected(user.id.toString());
        dispatch(selectUserAction(user));
      }
    } else if (
      (user.role === "admin" || user.role === "superadmin") &&
      sortedActiveUsers.length > 0 &&
      !selected
    ) {
      const defaultUser = sortedActiveUsers[0];
      setSelected(defaultUser.id.toString());
      dispatch(selectUserAction(defaultUser));
    }
  }, [user, sortedActiveUsers, dispatch, selected]);

  /**
   * ✅ Handle dropdown change (User manually changes selection)
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
      size="small"
      sx={{
        m: 1,
        minWidth: 220,
        "& .MuiInputLabel-root": {
          color: "rgba(255, 255, 255, 0.85)",
          fontWeight: 600,
          fontSize: "0.9rem",
          top: "-2px",
          "&.Mui-focused": { color: "#ffffff" },
        },
        "& .MuiOutlinedInput-root": {
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "10px",
          transition: "all 0.2s ease",
          "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
          "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.6)" },
          "&.Mui-focused fieldset": {
            borderColor: "#64b5f6",
            borderWidth: "2px",
          },
        },
        "& .MuiSelect-icon": { color: "white" },
        "& .MuiFormHelperText-root": {
          color: "rgba(255, 255, 255, 0.7)",
          fontWeight: 500,
          fontSize: "0.75rem",
          ml: 1,
          mt: 0.5,
        },
      }}
    >
      <InputLabel id="user-select-label">Active Customer</InputLabel>

      <Select
        labelId="user-select-label"
        value={selected}
        label="Active Customer"
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#ffffff",
              color: "#333",
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              mt: 1,
              "& .MuiMenuItem-root": {
                py: 1.2,
                px: 2,
                fontSize: "0.9rem",
                fontWeight: 500,
                borderRadius: "8px",
                mx: 1,
                my: 0.5,
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#f0f7ff",
                  color: "#1976d2",
                },
                "&.Mui-selected": {
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                  },
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
              <MenuItem key={u.id} value={u.id}>
                <ListItemText primary={u.name} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No active users found</MenuItem>
          ))}
      </Select>

      <FormHelperText>
        {selected ? "Customer synced" : "Select a customer"}
      </FormHelperText>
    </FormControl>
  );
};

export default DropDownUserList;