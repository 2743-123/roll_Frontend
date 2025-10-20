import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { getTokenAction } from "../../../Actions/Auth/TokenAction";
import EditTokenDialog from "../../Token/edit";

const PendingTokens: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { tokens, loading, error } = useSelector(
    (state: RootState) => state.token
  );

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
      <Typography variant="h6" gutterBottom>
        Pending Tokens for {selectedUser.name}
      </Typography>

      {pendingTokens.length === 0 ? (
        <Typography align="center" mt={3}>
          🎉 All tokens are completed!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {pendingTokens.map((token) => (
            <Grid key={token.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fff7e6",
                  borderLeft: "5px solid orange",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {token.customerName}
                </Typography>
                <Typography variant="body2">
                  Truck: {token.truckNumber}
                </Typography>
                <Typography variant="body2">
                  Material: {token.materialType}
                </Typography>
                <Typography variant="body2">
                  Weight: {token.weight} tons
                </Typography>
                <Typography variant="body2">
                  Total Amount: ₹{token.totalAmount}
                </Typography>
                <Typography variant="body2" color="orange">
                  Status: {token.status.toUpperCase()}
                </Typography>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  sx={{ mt: 1 }}
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
