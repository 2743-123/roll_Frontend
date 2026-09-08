import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Divider, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

// ⭐ Dynamic API Base URL (Local ke liye localhost, Live ke liye aapka Backend URL)
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://bricks-admin-backend.onrender.com"; // Yahan apne live backend ka URL daal dein (e.g. Render/Railway URL)

const BackupRestore: React.FC = () => {
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({ type: "", msg: "" });

  useEffect(() => {
    const savedToken = localStorage.getItem("googleDriveToken");
    if (savedToken) {
      setGoogleToken(savedToken);
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
      localStorage.setItem("googleDriveToken", tokenResponse.access_token);
      setStatus({ type: "success", msg: "Google Drive Connected Successfully!" });
    },
    scope: "https://www.googleapis.com/auth/drive.file",
    onError: () => setStatus({ type: "error", msg: "Google Login Failed!" })
  });

  const handleDisconnect = () => {
    localStorage.removeItem("googleDriveToken");
    setGoogleToken(null);
    setStatus({ type: "success", msg: "Google Drive Disconnected." });
  };

  const handleBackup = async () => {
    if (!googleToken) return alert("Please connect Google Drive first!");
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const authToken = localStorage.getItem("accessToken");

      await axios.post(
        `${API_BASE_URL}/api/backup/export`, 
        { googleToken }, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      setStatus({ type: "success", msg: "Backup successfully saved to Google Drive!" });
    } catch (error: any) {
      console.error("Backup Error:", error.response?.data || error.message);
      setStatus({ type: "error", msg: error.response?.data?.msg || "Failed to create backup." });
    }
    setLoading(false);
  };

  const handleRestore = async () => {
    if (!googleToken) return alert("Please connect Google Drive first!");
    if (!window.confirm("WARNING: This will overwrite your current database. Are you sure?")) return;
    
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const authToken = localStorage.getItem("accessToken");

      await axios.post(
        `${API_BASE_URL}/api/backup/import`, 
        { googleToken },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      setStatus({ type: "success", msg: "System successfully restored from Backup!" });
    } catch (error: any) {
      console.error("Restore Error:", error.response?.data || error.message);
      setStatus({ type: "error", msg: error.response?.data?.msg || "Failed to restore backup." });
    }
    setLoading(false);
  };

  return (
    <Box p={{ xs: 1, sm: 3 }} display="flex" justifyContent="center">
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, width: "100%", maxWidth: 600, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} color="#1976d2" mb={1}>
          Database Backup & Restore
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Secure your system data by linking your Google Drive account.
        </Typography>

        {!googleToken ? (
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={() => login()}
            sx={{ bgcolor: "#db4437", color: "white", px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, "&:hover": { bgcolor: "#c23321" } }}
          >
            Connect Google Drive
          </Button>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1} mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon color="success" />
              <Typography fontWeight={600} color="success.main">Drive Connected</Typography>
            </Box>
            <Button size="small" color="error" onClick={handleDisconnect} sx={{ textTransform: "none" }}>
              Disconnect / Change Account
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            disabled={!googleToken || loading}
            startIcon={<CloudUploadIcon />}
            onClick={handleBackup}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Backup Now"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={!googleToken || loading}
            startIcon={<CloudDownloadIcon />}
            onClick={handleRestore}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Import Backup"}
          </Button>
        </Box>

        {status.msg && (
          <Typography mt={3} fontWeight={600} color={status.type === "success" ? "success.main" : "error.main"}>
            {status.msg}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default BackupRestore;