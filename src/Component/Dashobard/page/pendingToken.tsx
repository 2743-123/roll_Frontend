import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Button,
  Chip,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PaymentIcon from "@mui/icons-material/Payment";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { getTokenAction } from "../../../Actions/Auth/TokenAction";
import EditTokenDialog from "../../Token/edit";

const PendingTokens: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { tokens, loading, error } = useSelector(
    (state: RootState) => state.token,
  );
  const { data } = useSelector((state: RootState) => state.balance);

  const [pendingTokens, setPendingTokens] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);

  // 🔹 Fetch all tokens for selected user
  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  }, [dispatch, selectedUser?.id]);

  // 🔹 Filter pending tokens
  useEffect(() => {
    const filtered = (tokens || []).filter(
      (t: any) => t.status !== "completed"
    );
    setPendingTokens(filtered);
  }, [tokens]);

  const handleConfirmClick = (token: any) => {
    setSelectedToken(token);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedToken(null);
  };

  const handleDataRefresh = () => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  };

  const formatCur = (val: number | string) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  if (!selectedUser)
    return (
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Please select a user first to view pending tokens.
        </Typography>
      </Paper>
    );

  if (loading)
    return (
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", bgcolor: "#ffffff" }}>
        <CircularProgress size={40} thickness={4} />
      </Paper>
    );

  if (error)
    return (
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff" }}>
        <Typography color="error" variant="body1" fontWeight={600}>
          {error}
        </Typography>
      </Paper>
    );

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        background: "#ffffff", 
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          borderRadius: 3,
          px: 2.5,
          py: 2,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <ConfirmationNumberIcon sx={{ fontSize: 26, color: "#64b5f6" }} />
        <Typography variant="h6" fontWeight={700} letterSpacing={0.5} noWrap>
          Pending Tokens ({selectedUser.name})
        </Typography>
      </Box>

      {/* ================= CONTENT BODY ================= */}
      <Box flexGrow={1} overflow="auto" maxHeight="450px" pr={0.5}>
        {pendingTokens.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} >
            <Typography variant="h6" fontWeight={600}>All Clear!</Typography>
            <Typography variant="body2">🎉 All tokens are completed.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {pendingTokens.map((token) => (
              <Grid  key={token.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e0e0e0",
                    borderLeft: "6px solid #1976d2",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1.5}
                  >
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {token.customerName}
                    </Typography>
                    <Chip
                      label={token.status.toUpperCase()}
                      color={token.status === "completed" ? "success" : "warning"}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 1.5 }}
                    />
                  </Box>

                  <Box display="flex" flexDirection="column" gap={0.5} mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Truck: <strong style={{ color: "#333" }}>{token.truckNumber || "N/A"}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Material: <strong style={{ color: token.materialType?.toLowerCase() === 'bedash' ? '#ed6c02' : '#333', textTransform: "capitalize" }}>{token.materialType}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weight: <strong style={{ color: "#333" }}>{token.weight} Tons</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount: <strong style={{ color: "#2e7d32" }}>{formatCur(token.totalAmount)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Carry Forward: <strong style={{ color: Number(token.carryForward) < 0 ? "#d32f2f" : "#333" }}>{formatCur(token.carryForward)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining: <strong style={{ color: "#1976d2" }}>{formatCur(data?.flyash?.remaining ?? 0)}</strong>
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<PaymentIcon />}
                    sx={{ 
                      mt: 0.5, 
                      borderRadius: 2, 
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": { boxShadow: "0 2px 8px rgba(25,118,210,0.3)" }
                    }}
                    onClick={() => handleConfirmClick(token)}
                  >
                    Confirm Payment
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ✅ Confirm Payment Dialog */}
      {selectedToken && (
        <EditTokenDialog
          open={openDialog}
          onClose={handleCloseDialog}
          token={selectedToken}
          onRefresh={handleDataRefresh}
        />
      )}
    </Paper>
  );
};

export default PendingTokens;