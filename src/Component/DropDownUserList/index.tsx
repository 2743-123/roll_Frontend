import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Reducer";
import { AppDispatch } from "../../store";
import { getuserAction, selectUserAction } from "../../Actions/Auth/user";
import { AuthState } from "../../ActionType/auth";
import { userState } from "../../ActionType/user/userTypes";

// ---------------------
// ✅ Interfaces
// ---------------------
export interface User {
  id: number;
  name: string;
  role: "admin" | "superadmin" | "user";
}

// ---------------------
// ✅ Component
// ---------------------
const DropDownUserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector(
    (state: RootState) => state.auth
  ) as AuthState;
  const { users } = useSelector((state: RootState) => state.user) as userState;

  const [selected, setSelected] = useState<string>("");

  // ✅ Fetch users if admin/superadmin
  useEffect(() => {
    if (
      token &&
      user &&
      (user.role === "admin" || user.role === "superadmin")
    ) {
      dispatch(getuserAction());
    }
  }, [dispatch, token, user]);

  // ✅ Default selection logic
  useEffect(() => {
    if (user?.role === "user") {
      setSelected(user.id.toString());
      dispatch(selectUserAction(user));
    } else if (user?.role === "admin" || user?.role === "superadmin") {
      const normalUsers = users.filter((u) => u.role === "user");
      if (normalUsers.length > 0) {
        setSelected(normalUsers[0].id.toString());
        dispatch(selectUserAction(normalUsers[0]));
      }
    }
  }, [user, users, dispatch]);

  // ✅ Handle dropdown change
  const handleChange = (event: SelectChangeEvent) => {
    const selectedId = Number(event.target.value);
    setSelected(event.target.value);
    const selectedUserObj = users.find((u) => u.id === selectedId) || null;
    if (selectedUserObj) {
      dispatch(selectUserAction(selectedUserObj));
    }
  };

  // ---------------------
  // ✅ Styled UI (Sky Blue Theme Friendly)
  // ---------------------
  return (
    <FormControl
      sx={{
        m: 1,
        minWidth: 200,
        "& .MuiInputLabel-root": {
          color: "white",
          fontWeight: 600,
        },
        "& .MuiOutlinedInput-root": {
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
          "& fieldset": {
            borderColor: "white",
          },
          "&:hover fieldset": {
            borderColor: "#e3f2fd", // light blue border on hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "white",
          },
        },
        "& .MuiSelect-icon": {
          color: "white",
        },
        "& .MuiFormHelperText-root": {
          color: "#e0f7fa",
        },
      }}
    >
      <InputLabel id="user-select-label">Select User</InputLabel>
      <Select
        labelId="user-select-label"
        value={selected}
        label="Select User"
        onChange={handleChange}
      >
        {user?.role === "user" && (
          <MenuItem value={user.id}>{user.name}</MenuItem>
        )}

        {(user?.role === "admin" || user?.role === "superadmin") &&
          (users.length > 0 ? (
            users
              .filter((u) => u.role === "user")
              .map((u) => (
                <MenuItem
                  key={u.id}
                  value={u.id}
                  sx={{
                    backgroundColor:
                      selected === u.id.toString() ? "#bbdefb" : "transparent",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  {u.name}
                </MenuItem>
              ))
          ) : (
            <MenuItem disabled>Loading users...</MenuItem>
          ))}
      </Select>

      <FormHelperText>
        {selected ? "User selected" : "Please select a user"}
      </FormHelperText>
    </FormControl>
  );
};

export default DropDownUserList;
