import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store"; // adjust path
import DashboardSharpIcon from "@mui/icons-material/DashboardSharp";
import SupervisorAccountSharpIcon from "@mui/icons-material/SupervisorAccountSharp";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ConstructionIcon from "@mui/icons-material/Construction";
import PersonIcon from "@mui/icons-material/Person";
import TokenIcon from "@mui/icons-material/Token";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const canSeeUsersTab = user?.role === "admin" || user?.role === "superadmin";
  const canSeeAdminTab = user?.role === "superadmin";
  const canSeeOnlyAdmin = user?.role === "admin";

  // 🔹 Flash animation keyframes for icons
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <List sx={{ width: 250, bgcolor: "#f0f3f7", height: "100vh" }}>
      {/* Dashboard */}
      <ListItemButton onClick={() => navigate("/")}>
        <ListItemIcon>
          <DashboardSharpIcon
            sx={{ color: "#ff0000ff", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      {/* Users (Admin / Superadmin) */}
      {canSeeUsersTab && (
        <ListItemButton onClick={() => navigate("/users")}>
          <ListItemIcon>
            <SupervisorAccountSharpIcon
              sx={{ color: "#5506ffff", animation: "flash 1.2s infinite" }}
            />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItemButton>
      )}

      {/* Admin & Superadmin */}
      {canSeeAdminTab && (
        <ListItemButton onClick={() => navigate("/admin")}>
          <ListItemIcon>
            <PersonIcon
              sx={{ color: "#189fe8ff", animation: "flash 1.2s infinite" }}
            />
          </ListItemIcon>
          <ListItemText primary="Admin & Superadmin" />
        </ListItemButton>
      )}

      {/* Token */}
      <ListItemButton onClick={() => navigate("/token")}>
        <ListItemIcon>
          <MonetizationOnIcon
            sx={{ color: "#ffd500ff", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Token" />
      </ListItemButton>

      {canSeeOnlyAdmin && (
        <ListItemButton onClick={() => navigate("/AllUserToken")}>
          <ListItemIcon>
            <TokenIcon
              sx={{ color: "#189fe8ff", animation: "flash 1.2s infinite" }}
            />
          </ListItemIcon>
          <ListItemText primary="All User Token" />
        </ListItemButton>
      )}

      {/* Balance */}
      <ListItemButton onClick={() => navigate("/balance")}>
        <ListItemIcon>
          <AccountBalanceWalletOutlinedIcon
            sx={{ color: "#00ff6eff", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Balance" />
      </ListItemButton>

      {canSeeOnlyAdmin && (
        <ListItemButton onClick={() => navigate("/AllTransection")}>
          <ListItemIcon>
            <AccountBalanceIcon
              sx={{
                color: "rgb(131, 232, 24)",
                animation: "flash 1.2s infinite",
              }}
            />
          </ListItemIcon>
          <ListItemText primary="All User Balance" />
        </ListItemButton>
      )}

      {/* Bedash */}
      <ListItemButton onClick={() => navigate("/bedash")}>
        <ListItemIcon>
          <ConstructionIcon
            sx={{ color: "#ff5e00ff", animation: "flash 1.2s infinite" }}
          />
        </ListItemIcon>
        <ListItemText primary="Bedash" />
      </ListItemButton>
    </List>
  );
};

export default Sidebar;
