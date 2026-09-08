import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import DashboardSharpIcon from "@mui/icons-material/DashboardSharp";
import SupervisorAccountSharpIcon from "@mui/icons-material/SupervisorAccountSharp";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ConstructionIcon from "@mui/icons-material/Construction";
import PersonIcon from "@mui/icons-material/Person";
import TokenIcon from "@mui/icons-material/Token";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore"; // ⭐ Backup Icon Import

interface SidebarProps {
  open?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const canSeeUsersTab = user?.role === "admin" || user?.role === "superadmin";
  const canSeeAdminTab = user?.role === "superadmin";
  const canSeeOnlyAdmin = user?.role === "admin";
  const canSeePaymentHistory = user?.role === "admin" || user?.role === "superadmin";
  const canSeeBackup = user?.role === "admin" || user?.role === "superadmin"; // ⭐ Backup Permission

  // 🔹 Flash animation keyframes
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      /* Custom Scrollbar for sleek look on desktop, hidden naturally on mobile */
      .sidebar-scroll::-webkit-scrollbar {
        width: 4px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background-color: #bdbdbd;
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const menuItems = [
    { label: "Dashboard", path: "/", icon: <DashboardSharpIcon sx={{ color: "#ff1744", animation: "flash 1.5s infinite" }} />, show: true },
    { label: "Users", path: "/users", icon: <SupervisorAccountSharpIcon sx={{ color: "#3f51b5", animation: "flash 1.5s infinite" }} />, show: canSeeUsersTab },
    { label: "Admin & Superadmin", path: "/admin", icon: <PersonIcon sx={{ color: "#00b0ff", animation: "flash 1.5s infinite" }} />, show: canSeeAdminTab },
    { label: "Token", path: "/token", icon: <MonetizationOnIcon sx={{ color: "#ffab00", animation: "flash 1.5s infinite" }} />, show: true },
    { label: "All User Token", path: "/AllUserToken", icon: <TokenIcon sx={{ color: "#00b0ff", animation: "flash 1.5s infinite" }} />, show: canSeeOnlyAdmin },
    { label: "Balance", path: "/balance", icon: <AccountBalanceWalletOutlinedIcon sx={{ color: "#00e676", animation: "flash 1.5s infinite" }} />, show: true },
    { label: "All User Balance", path: "/AllTransection", icon: <AccountBalanceIcon sx={{ color: "#76ff03", animation: "flash 1.5s infinite" }} />, show: canSeeOnlyAdmin },
    { label: "Payment History", path: "/PaymentHistory", icon: <ReceiptLongIcon sx={{ color: "#f50057", animation: "flash 1.5s infinite" }} />, show: canSeePaymentHistory },
    { label: "Bedash", path: "/bedash", icon: <ConstructionIcon sx={{ color: "#ff6d00", animation: "flash 1.5s infinite" }} />, show: true },
    // ⭐ New Backup Route Item
    { label: "Backup / Restore", path: "/backup", icon: <SettingsBackupRestoreIcon sx={{ color: "#9c27b0", animation: "flash 1.5s infinite" }} />, show: canSeeBackup },
  ];

  return (
    <List 
      className="sidebar-scroll"
      sx={{ 
        width: "100%", 
        bgcolor: "#ffffff", 
        height: "calc(100% - 110px)", 
        overflowY: "auto",
        overflowX: "hidden",
        px: open ? { xs: 1, sm: 1.5 } : 1, 
        py: { xs: 1, sm: 2 }, 
        display: "flex",
        flexDirection: "column",
        gap: { xs: 0.5, sm: 0.8 }, 
      }}
    >
      {menuItems
        .filter((item) => item.show)
        .map((item) => {
          const isActive = location.pathname === item.path;

          const buttonContent = (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: { xs: 44, sm: 48 }, 
                justifyContent: open ? "initial" : "center",
                px: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                mb: 0.5,
                backgroundColor: isActive ? "#e3f2fd" : "transparent",
                color: isActive ? "#1976d2" : "text.primary",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: isActive ? "#e3f2fd" : "#f5f5f5",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? { xs: 1.5, sm: 2 } : "auto", 
                  justifyContent: "center",
                  "& svg": {
                    fontSize: { xs: 22, sm: 24 }
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    "& .MuiListItemText-primary": {
                      fontSize: { xs: "0.85rem", sm: "0.9rem" }, 
                      fontWeight: isActive ? 700 : 500,
                    }
                  }} 
                />
              )}
            </ListItemButton>
          );

          return !open ? (
            <Tooltip key={item.path} title={item.label} placement="right" arrow disableInteractive>
              {buttonContent}
            </Tooltip>
          ) : (
            buttonContent
          );
        })}
    </List>
  );
};

export default Sidebar;