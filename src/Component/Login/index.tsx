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
  Paper,
  CircularProgress,
} from "@mui/material";

// import Loader from "../../CommonCoponent/Loader";

interface Logindetails {
  email: string;
  password: string;
}

export default function Login() {
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
    } else {
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", // professional blue gradient
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 5,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          borderRadius: 4,
          position: "relative",
          backgroundColor: "#ffffff", // card white
        }}
      >
        {/* Title */}
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700} color="primary">
            Welcome Back 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Login to your admin dashboard
          </Typography>
        </Box>

        {/* Notification */}

        {/* Email Input */}
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          value={loginDetails.email}
          onChange={handleChange}
          variant="outlined"
        />

        {/* Password Input */}
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={loginDetails.password}
          onChange={handleChange}
          variant="outlined"
        />

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ py: 1.5, mt: 1 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>

        {/* Footer */}
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Don’t have an account?{" "}
          <Box
            component="span"
            sx={{ color: "primary.main", cursor: "default" }}
          >
            Contact Admin
          </Box>
        </Typography>
      </Paper>
      {/* <Loader/> */}
    </Box>
  );
}
