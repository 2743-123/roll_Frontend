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
import useMediaQuery from "@mui/material/useMediaQuery";

import Sidebar from "./Sidebar";
import Logout from "../Logout";
import DropDownUserList from "../DropDownUserList";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

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
  // Desktop AppBar adjustment
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
  
  // ⭐ Mobile Detection
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // Desktop state
  const [open, setOpen] = React.useState(true);
  // Mobile state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <CssBaseline />

      {/* ================= APP BAR ================= */}
      <AppBar position="fixed" open={!isMobile && open}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: "70px !important", px: { xs: 1, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            
            {/* Hamburger Icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: { xs: 0, sm: 1.5 }, ...(!isMobile && open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>

            <DashboardOutlinedIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: "#64b5f6", display: { xs: "none", sm: "block" } }} />
            <Typography
              variant="h6"
              noWrap
              sx={{ 
                fontWeight: 700, 
                letterSpacing: 0.5, 
                textTransform: "uppercase", 
                fontSize: { xs: "1rem", sm: "1.25rem" } 
              }}
            >
              Admin dashboard
            </Typography>
          </Box>

          {/* Right Side Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            <DropDownUserList />
            <Logout />
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= MOBILE DRAWER (Temporary) ================= */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backgroundColor: "#ffffff" },
        }}
      >
        <DrawerHeader>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <DashboardOutlinedIcon sx={{ fontSize: 24, color: "#1976d2" }} />
              <Typography sx={{ fontWeight: 800, textTransform: "uppercase", color: "#1976d2", letterSpacing: 1, fontSize: "1.1rem" }}>
                Bricks Admin
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "#666" }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        </DrawerHeader>
        {/* On mobile, clicking a link should close the drawer */}
        <Box onClick={() => setMobileOpen(false)}>
          <Sidebar />
        </Box>
      </MuiDrawer>

      {/* ================= DESKTOP DRAWER (Permanent) ================= */}
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
                <Typography sx={{ fontWeight: 800, textTransform: "uppercase", color: "#1976d2", letterSpacing: 1.5, fontSize: "1.2rem" }}>
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

      {/* ================= MAIN CONTENT AREA ================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 }, // ⭐ Responsive padding
          mt: "70px",
          backgroundColor: "#f8f9fa",
          minHeight: "calc(100vh - 70px)",
          width: { xs: "100%", md: `calc(100% - ${open ? drawerWidth : 73}px)` }, // Prevents horizontal scrolling bug
        }}
      >
        <BreadcrumbPath />
        <Outlet />
      </Box>
    </Box>
  );
}