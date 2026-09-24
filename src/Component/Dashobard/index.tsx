import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person"; // ⭐ Naya icon login name ke liye
import useMediaQuery from "@mui/material/useMediaQuery";

import Sidebar from "./Sidebar";
import Logout from "../Logout";
import DropDownUserList from "../DropDownUserList";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ⭐ Redux se user nikalne ke liye
import { RootState } from "../../store"; // ⭐ Apna store path verify kar lena

// ⭐ AI Assistant Import
import AIAssistantDrawer from "./aiAsistent/AIAssistantDrawer";

const drawerWidth = 260;

// ---------------- Drawer Styles ----------------
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  borderRight: "1px solid #e0e0e0",
  boxShadow: "4px 0 20px rgba(0,0,0,0.05)",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(8)} + 1px)`,
  borderRight: "1px solid #e0e0e0",
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

// ---------------- DrawerHeader ----------------
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  height: 110,
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #f0f0f0",
  userSelect: "none",
  position: "relative",
  "& svg": {
    transition: "all 0.3s ease",
  },
}));

// ---------------- AppBar ----------------
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  color: "#fff",
  boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.up("md")]: {
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.standard,
      }),
    }),
  },
}));

// ---------------- Desktop Drawer ----------------
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    backgroundColor: "#ffffff",
  },
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

// ---------------- Breadcrumb Component ----------------
const BreadcrumbPath: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, flexWrap: "wrap" }}>
      <Typography
        variant="body2"
        sx={{
          cursor: "pointer",
          color: "#1976d2",
          fontWeight: 700,
          letterSpacing: 0.5,
          transition: "all 0.2s ease",
          "&:hover": { color: "#115293", textDecoration: "underline" },
        }}
        onClick={() => navigate("/")}
      >
        DASHBOARD
      </Typography>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        return (
          <Typography
            key={index}
            variant="body2"
            sx={{
              cursor: "pointer",
              color: "text.secondary",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": { color: "#1976d2", textDecoration: "underline" },
            }}
            onClick={() => navigate(routeTo)}
          >
            / {name.toUpperCase()}
          </Typography>
        );
      })}
    </Box>
  );
};

// ---------------- Dashboard Component ----------------
export default function Dashboard() {
  const theme = useTheme();

  // ⭐ Redux se user detail fetch karna
  const { user } = useSelector((state: RootState) => state.auth);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // 🔹 Backup State Handlers
  const [backupLoading, setBackupLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  // 🔹 Direct Localhost 5000 API Call
  const handleAdminBackup = async () => {
    setBackupLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:5000/api/backup/trigger-my-backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errText = await response.text();
        console.error("Backend Error Response (HTML):", errText);
        throw new Error(`Server returned error status ${response.status}. Route check karein.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Backup trigger failed");
      }

      setSnackbar({
        open: true,
        message: data.message || "Admin backup uploaded to Drive successfully!",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to create database backup",
        severity: "error",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <CssBaseline />

      <AppBar position="fixed" open={!isMobile && open}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: "70px !important",
            px: { xs: 1, sm: 3 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: { xs: 0, sm: 1.5 }, ...(!isMobile && open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>

            <DashboardOutlinedIcon
              sx={{
                fontSize: { xs: 24, sm: 28 },
                color: "#64b5f6",
                display: { xs: "none", sm: "block" },
              }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Admin dashboard
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* 🚀 Dynamic Admin Backup Trigger Button */}
            {isMobile ? (
              <Tooltip title="Backup My Data to Drive">
                <span>
                  <IconButton
                    color="inherit"
                    onClick={handleAdminBackup}
                    disabled={backupLoading}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)" },
                    }}
                  >
                    {backupLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CloudUploadIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleAdminBackup}
                disabled={backupLoading}
                startIcon={
                  backupLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {backupLoading ? "Backing up..." : "Backup Data"}
              </Button>
            )}

            {/* ⭐ Name Tag for Logged In Admin / Superadmin */}
            {user?.name && !isMobile && (
              <Button
                disabled
                startIcon={<PersonIcon />}
                sx={{
                  color: "#fff !important",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  textTransform: "capitalize",
                  fontWeight: 700,
                  borderRadius: "8px",
                  px: 2,
                  "&.Mui-disabled": {
                    color: "#e0e0e0 !important", // Slightly dim white to look good
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                  }
                }}
              >
                {user.name} ({user.role})
              </Button>
            )}

            <DropDownUserList />
            <Logout />
          </Box>
        </Toolbar>
      </AppBar>

      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            backgroundColor: "#ffffff",
          },
        }}
      >
        <DrawerHeader>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <DashboardOutlinedIcon sx={{ fontSize: 24, color: "#1976d2" }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#1976d2",
                  letterSpacing: 1,
                  fontSize: "1.1rem",
                }}
              >
                Bricks Admin
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "#666" }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        </DrawerHeader>
        <Box onClick={() => setMobileOpen(false)}>
          <Sidebar />
        </Box>
      </MuiDrawer>

      <Drawer
        variant="permanent"
        open={open}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        <DrawerHeader>
          {open ? (
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <DashboardOutlinedIcon sx={{ fontSize: 28, color: "#1976d2" }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "#1976d2",
                    letterSpacing: 1.5,
                    fontSize: "1.2rem",
                  }}
                >
                  Bricks Admin
                </Typography>
              </Box>
              <IconButton onClick={() => setOpen(false)} sx={{ color: "#666" }}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Box>
          ) : (
            <IconButton onClick={() => setOpen(true)} sx={{ color: "#1976d2" }}>
              <ChevronRightIcon />
            </IconButton>
          )}
        </DrawerHeader>
        <Sidebar />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          mt: "70px",
          backgroundColor: "#f8f9fa",
          minHeight: "calc(100vh - 70px)",
          width: { xs: "100%", md: `calc(100% - ${open ? drawerWidth : 73}px)` },
        }}
      >
        <BreadcrumbPath />
        <Outlet />
      </Box>

      {/* ⭐ Floating AI Assistant */}
      <AIAssistantDrawer />

      {/* 🔔 Feedback Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}