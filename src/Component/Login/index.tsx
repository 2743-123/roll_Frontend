import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { login } from "../../Actions/Auth";
import { RootState } from "../../Reducer";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

interface Logindetails {
  email: string;
  password: string;
}

export default function DashboardLogin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, loading } = useSelector((state: RootState) => state.auth);

  const [loginDetails, setLoginDetails] = useState<Logindetails>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = loginDetails;
    if (email && password) {
      dispatch(login(email, password));
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        overflow: "hidden",
        position: "relative",
        margin: 0,
        padding: 0,
      }}
    >
      {/* ================= SUBTLE GLOW BACKGROUNDS ================= */}
      <Box
        sx={{
          position: "absolute",
          width: 450,
          height: 450,
          background: "radial-gradient(circle at center, rgba(33, 150, 243, 0.15), transparent 70%)",
          top: 0,
          left: 0,
          transform: "translate(-30%, -30%)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 450,
          height: 450,
          background: "radial-gradient(circle at center, rgba(0, 188, 212, 0.15), transparent 70%)",
          bottom: 0,
          right: 0,
          transform: "translate(30%, 30%)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* ================= LOGIN CARD ================= */}
      <Paper
        elevation={12}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          width: "90%",
          maxWidth: 420,
          background: "rgba(25, 30, 40, 0.85)",
          backdropFilter: "blur(16px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2.5,
          zIndex: 2,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo / Icon */}
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#1976d2,#42a5f5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 0.5,
            boxShadow: "0 0 25px rgba(25,118,210,0.5)",
          }}
        >
          <AdminPanelSettingsIcon sx={{ fontSize: 36, color: "#fff" }} />
        </Box>

        {/* Title */}
        <Box textAlign="center">
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}
          >
            Admin{" "}
            <Box component="span" sx={{ color: "#64b5f6" }}>
              Portal
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
            Secure Enterprise Access
          </Typography>
        </Box>

        {/* Input Fields */}
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          required
          value={loginDetails.email}
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 1,
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "#42a5f5" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
          }}
        />

        <TextField
          fullWidth
          type="password"
          label="Password"
          name="password"
          required
          value={loginDetails.password}
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "rgba(255,255,255,0.5)" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "#42a5f5" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
          }}
        />

        {/* Submit Button */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            mt: 1.5,
            py: 1.4,
            borderRadius: 2.5,
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            boxShadow: "0 4px 20px rgba(25,118,210,0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #115293 0%, #1976d2 100%)",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.3)",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Access Dashboard"}
        </Button>

        {/* Footer */}
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", mt: 1 }}>
          © {new Date().getFullYear()} Bricks Admin Panel. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
}