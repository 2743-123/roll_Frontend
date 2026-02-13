import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

import Sidebar from "./Sidebar";
import Logout from "../Logout";
import DropDownUserList from "../DropDownUserList";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

// ---------------- Drawer Styles ----------------
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

// ---------------- DrawerHeader ----------------
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: theme.spacing(2),
  height: 120,
  backgroundColor: "#f5f5f5",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  userSelect: "none",
  transition: "all 0.3s ease",
  "& svg": {
    transition: "all 0.3s ease",
    transform: "scale(1)",
  },
  "&:hover svg": {
    transform: "scale(1.2) rotate(10deg)",
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
  background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
  color: "#fff",
  boxShadow: "0px 6px 20px rgba(0,0,0,0.12)",
  transition: theme.transitions.create(["width", "margin", "background"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  "&:hover": {
    background: "linear-gradient(90deg, #21cbf3 0%, #2196f3 100%)",
  },
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin", "background"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
  }),
}));

// ---------------- Drawer ----------------
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  "& .MuiDrawer-paper": {
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e0e0e0",
    boxShadow: "2px 0px 8px rgba(0,0,0,0.05)",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Typography
        sx={{
          cursor: "pointer",
          color: "#1e88e5",
          fontWeight: 600,
          transition: "all 0.3s ease",
          "&:hover": {
            color: "#1976d2",
            textDecoration: "underline",
            transform: "scale(1.05)",
          },
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
            sx={{
              cursor: "pointer",
              color: "#555",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#2196f3",
                textDecoration: "underline",
                transform: "scale(1.05)",
              },
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
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ marginRight: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <DashboardOutlinedIcon sx={{ fontSize: 32, color: "white" }} />
            <Typography
              variant="h5"
              noWrap
              sx={{ fontWeight: 700, textTransform: "uppercase" }}
            >
              Dashboard
            </Typography>
          </Box>

          {/* Right Side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <DropDownUserList />
            <Logout />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <DashboardOutlinedIcon
            sx={{ fontSize: 36, color: "#1976d2", mb: 1 }}
          />
          <Typography
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#1976d2",
              letterSpacing: 2,
              fontSize: "1.8rem",
              textAlign: "center",
            }}
          >
            DASHBOARD
          </Typography>

          <IconButton
            onClick={handleDrawerClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#1976d2",
            }}
          >
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
          transition: "all 0.3s ease",
        }}
      >
        <DrawerHeader /> {/* spacing for toolbar */}
        <BreadcrumbPath />
        <Outlet />
      </Box>
    </Box>
  );
}
