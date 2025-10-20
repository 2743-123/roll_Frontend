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
  userSelect: "none",
}));

// ---------------- AppBar ----------------
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#87CEEB",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
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

  const redirect = (url: string) => {
    navigate(url);
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: "0.9rem",
        mb: 2,
      }}
    >
      <Typography
        sx={{ cursor: "pointer", color: "#1e88e5", fontWeight: 600 }}
        onClick={() => redirect("/")}
      >
        DASHBOARD
      </Typography>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        return (
          <Typography
            key={index}
            sx={{ cursor: "pointer", color: "#555" }}
            onClick={() => redirect(routeTo)}
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
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>

          {/* Dashboard Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DashboardOutlinedIcon sx={{ fontSize: 32, color: "white" }} />
            <Typography
              variant="h5"
              noWrap
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                color: "white",
                fontSize: "1.6rem",
              }}
            >
              Dashboard
            </Typography>
          </Box>

          {/* Right Side */}
          <Box
            sx={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <DropDownUserList />
            <Logout />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <DashboardOutlinedIcon
            sx={{ fontSize: 36, color: "#1e90ff", mb: 1 }}
          />
          <Typography
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#1e90ff",
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
              color: "#1e90ff",
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
        }}
      >
        <DrawerHeader /> {/* spacing for toolbar */}
        <BreadcrumbPath />
        <Outlet />
      </Box>
    </Box>
  );
}
