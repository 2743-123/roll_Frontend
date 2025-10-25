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
} from "@mui/material";

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

  const handleSubmit = () => {
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
        background: "linear-gradient(135deg, #87b7e4ff 0%, #a6d8f3ff 100%)",
        overflow: "hidden",
        position: "relative",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Subtle glow layers */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle at center, rgba(211, 135, 135, 0.08), transparent 70%)",
          top: 0,
          left: 0,
          transform: "translate(-30%, -30%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle at center, rgba(0,188,212,0.08), transparent 70%)",
          bottom: 0,
          right: 0,
          transform: "translate(30%, 30%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={10}
        sx={{
          p: 6,
          borderRadius: 4,
          width: "90%",
          maxWidth: 400,
          background: "rgba(20,20,30,0.9)",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          zIndex: 2,
          boxShadow: "0 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Logo / Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2196f3,#00bcd4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1,
            boxShadow: "0 0 20px rgba(0,188,212,0.5)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            AD
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", textAlign: "center", color: "#fff" }}
        >
          Admin{" "}
          <Box component="span" sx={{ color: "#00bcd4" }}>
            Dashboard
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: "#aaa", textAlign: "center" }}>
          Secure Access Portal
        </Typography>

        {/* Input Fields */}
        <TextField
          fullWidth
          placeholder="Email Address"
          name="email"
          value={loginDetails.email}
          onChange={handleChange}
          variant="outlined"
          sx={{
            backgroundColor: "#1a1a25",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#00bcd4" },
              "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
              color: "#fff",
            },
            input: { color: "#fff" },
          }}
        />
        <TextField
          fullWidth
          type="password"
          placeholder="Password"
          name="password"
          value={loginDetails.password}
          onChange={handleChange}
          variant="outlined"
          sx={{
            backgroundColor: "#1a1a25",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#00bcd4" },
              "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
              color: "#fff",
            },
            input: { color: "#fff" },
          }}
        />

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            mt: 1.5,
            py: 1.5,
            borderRadius: 3,
            fontWeight: "bold",
            fontSize: 15,
            background: "linear-gradient(90deg, #00bcd4, #2196f3)",
            boxShadow: "0 4px 20px rgba(0,188,212,0.4)",
            "&:hover": {
              background: "linear-gradient(90deg, #2196f3, #00bcd4)",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Access"}
        </Button>

        {/* Footer */}
        <Typography variant="caption" sx={{ color: "#777", mt: 2 }}>
          © {new Date().getFullYear()} Admin Dashboard
        </Typography>
      </Paper>
    </Box>
  );
}
