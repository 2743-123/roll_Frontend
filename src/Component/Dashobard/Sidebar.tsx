import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";
import DashboardSharpIcon from "@mui/icons-material/DashboardSharp";
import SupervisorAccountSharpIcon from "@mui/icons-material/SupervisorAccountSharp";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store"; // ✅ adjust path as per your structure
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const Sidebar: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const navigate = useNavigate();

  // ✅ Get logged-in user info from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // ✅ Toggle Inbox submenu
  const handleClick = () => setOpen(!open);

  // ✅ Role check (only admin or superadmin can see Users tab)
  const canSeeUsersTab = user?.role === "admin" || user?.role === "superadmin";

  return (
    <List>
      {/* Dashboard - visible to all */}
      <ListItemButton onClick={() => navigate("/")}>
        <ListItemIcon>
          <DashboardSharpIcon
            sx={{ color: "#af4c4cff", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      {/* USERS - visible only for admin/superadmin */}
      {canSeeUsersTab && (
        <ListItemButton onClick={() => navigate("/users")}>
          <ListItemIcon>
            <SupervisorAccountSharpIcon
              sx={{ color: "#6b4cafff", animation: "flash 1.2s infinite" }}
            />
          </ListItemIcon>
          <ListItemText primary="USERS" />
        </ListItemButton>
      )}

      {/* Dashboard - visible to all */}
      <ListItemButton onClick={() => navigate("/balance")}>
        <ListItemIcon>
          <AccountBalanceWalletOutlinedIcon
            sx={{ color: "#4caf50", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Balance" />
      </ListItemButton>

      <ListItemButton onClick={() => navigate("/Token")}>
        <ListItemIcon>
          <MonetizationOnIcon
            sx={{ color: "#4caf50", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Token" />
      </ListItemButton>

      {/* Inbox collapsible */}
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
};

export default Sidebar;
