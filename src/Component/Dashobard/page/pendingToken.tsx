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
    if (tokens?.length) {
      const filtered = tokens.filter((t: any) => t.status !== "completed");
      setPendingTokens(filtered);
    }
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

  if (!selectedUser)
    return <Typography align="center">Please select a user first.</Typography>;

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* 🔹 Header */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
          p: 2,
          borderRadius: 2,
          mb: 3,
        }}
      >
        Pending Tokens for {selectedUser.name}
      </Typography>

      {pendingTokens.length === 0 ? (
        <Typography align="center" mt={3}>
          🎉 All tokens are completed!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {pendingTokens.map((token) => (
            <Grid key={token.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "#e3f2fd",
                  borderLeft: "6px solid #1976d2",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {token.customerName}
                  </Typography>
                  <Chip
                    label={token.status.toUpperCase()}
                    color={token.status === "completed" ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" mb={0.5}>
                  Truck: <strong>{token.truckNumber}</strong>
                </Typography>
                <Typography variant="body2" mb={0.5}>
                  Material: <strong>{token.materialType}</strong>
                </Typography>
                <Typography variant="body2" mb={0.5}>
                  Weight: <strong>{token.weight} tons</strong>
                </Typography>
                <Typography variant="body2" mb={1}>
                  Total Amount: <strong>₹{token.totalAmount}</strong>
                </Typography>
                <Typography variant="body2" mb={1}>
                  carryForward: <strong>₹{token.carryForward}</strong>
                </Typography>
                <Typography variant="body2">
                  Remaining: <strong>₹{data?.flyash?.remaining ?? 0}</strong>
                </Typography>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 1, borderRadius: 2 }}
                  onClick={() => handleConfirmClick(token)}
                >
                  Confirm Payment
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ✅ Confirm Payment Dialog */}
      {selectedToken && (
        <EditTokenDialog
          open={openDialog}
          onClose={handleCloseDialog}
          token={selectedToken}
          onRefresh={handleDataRefresh}
        />
      )}
    </Box>
  );
};

export default PendingTokens;
