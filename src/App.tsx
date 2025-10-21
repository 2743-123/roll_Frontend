import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginedIn, RequireAuth } from "./Routes";
import Login from "./Component/Login/index";
import Dashboard from "./Component/Dashobard";
import Users from "./Component/Dashobard/page/Users/Users";
import AllData from "./Component/Dashobard/page/Alldata";
import Balance from "./Component/Balance/Balance";
import TokenTable from "./Component/Token";
import Notification from "./CommonCoponent/Notification";

import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { useEffect, useState, useMemo } from "react";

// 🧩 MUI Imports
import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  GlobalStyles,
  IconButton,
  Box,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

// 🌍 Main App Component
function App() {
  const dispatch = useDispatch<AppDispatch>();

  // 🌗 Dark/Light Mode State
  const [mode, setMode] = useState<"light" | "dark">(
    (localStorage.getItem("themeMode") as "light" | "dark") || "light"
  );

  // 💾 Mode change handle
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  // 🧱 Create theme memoized (performance optimized)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f8f9fa", paper: "#fff" },
                primary: { main: "#1976d2" },
                secondary: { main: "#9c27b0" },
              }
            : {
                background: { default: "#121212", paper: "#1e1e1e" },
                primary: { main: "#90caf9" },
                secondary: { main: "#ce93d8" },
              }),
        },
        typography: {
          fontFamily: "'Poppins', sans-serif",
          h1: { fontSize: "clamp(1.8rem, 2.5vw, 2.8rem)", fontWeight: 600 },
          h2: { fontSize: "clamp(1.4rem, 2vw, 2rem)", fontWeight: 600 },
          body1: { fontSize: "clamp(0.9rem, 1vw, 1.1rem)" },
        },
        breakpoints: {
          values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "clamp(0.8rem, 1vw, 1rem)",
              },
            },
          },
        },
      }),
    [mode]
  );

  // 🔐 Auto-login persistence
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { token, user: JSON.parse(user) },
      });
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            backgroundColor:
              mode === "light" ? "#f8f9fa" : theme.palette.background.default,
          },
          "*": {
            boxSizing: "border-box",
          },
        }}
      />

      {/* 🌗 Dark/Light Toggle Button */}
      <Box
        sx={{
          position: "fixed",
          top:100,
          right: 16,
          zIndex: 9999,
          backgroundColor:
            mode === "light"
              ? "rgba(255,255,255,0.7)"
              : "rgba(40,40,40,0.7)",
          borderRadius: "50%",
          boxShadow: 2,
        }}
      >
        <IconButton onClick={toggleTheme} color="inherit">
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Box>

      {/* 🌐 Routes */}
      <BrowserRouter>
        <Routes>
          <Route
            path="Login"
            element={
              <LoginedIn>
                <Login />
              </LoginedIn>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            <Route index element={<AllData />} />
            <Route path="USERS" element={<Users />} />
            <Route path="Balance" element={<Balance />} />
            <Route path="Token" element={<TokenTable />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Notification />
    </ThemeProvider>
  );
}

export default App;
