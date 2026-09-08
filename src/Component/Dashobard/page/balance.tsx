import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Reducer";
import { AppDispatch } from "../../../store";
import { getBalanceAction } from "../../../Actions/Auth/balance";
import { Card, Typography, Box, Grid, CircularProgress, Divider } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LayersIcon from "@mui/icons-material/Layers";

const BalanceCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { data, error, loading } = useSelector(
    (state: RootState) => state.balance,
  );

  // 🔄 Fetch balance whenever selectedUser or user/token changes
  useEffect(() => {
    if (user && token) {
      const userId = user.role === "user" ? user.id : selectedUser?.id;
      if (userId) {
        dispatch(getBalanceAction(userId));
      }
    }
  }, [token, user, selectedUser?.id, dispatch]);

  // 🔍 Robust data extraction
  const rawBalance = Array.isArray(data) ? data[0] : data;
  const balance = rawBalance?.data || rawBalance;

  // ⚖️ Tons formatting helper
  const formatTons = (val: number | string) => `${Number(val || 0).toFixed(3)} T`;

  return (
    <Card
      elevation={4}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: 4,
        background: "#ffffff",
        border: "1px solid #e0e0e0",
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
        <AccountBalanceWalletIcon sx={{ fontSize: 26, color: "#81c784" }} />
        <Box>
          <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
            User Balance Summary (Tons)
          </Typography>
          {user?.role !== "user" && selectedUser && (
            <Typography variant="caption" sx={{ color: "#81c784", fontWeight: 600 }}>
              Viewing: {selectedUser.name}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ================= CONTENT STATES ================= */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} py={4}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} py={4}>
          <Typography color="error" variant="body2" fontWeight={600}>
            {error}
          </Typography>
        </Box>
      ) : balance ? (
        <Grid container spacing={2.5} flexGrow={1} alignItems="stretch">
          
          {/* 🟢 Flyash Box */}
          <Grid >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "#f4f6f8",
                border: "1px solid #e2e8f0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <LocalShippingIcon sx={{ color: "#2e7d32" }} />
                <Typography fontWeight={700} color="text.primary">Flyash Account</Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={0.8}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatTons(balance.flyash?.total ?? balance.Flyash?.total ?? 0)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Used:</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">{formatTons(balance.flyash?.used ?? balance.Flyash?.used ?? 0)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>Remaining:</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    {formatTons(balance.flyash?.remaining ?? balance.Flyash?.remaining ?? 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* 🟠 Bedash Box */}
          <Grid>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "#f4f6f8",
                border: "1px solid #e2e8f0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <LayersIcon sx={{ color: "#ed6c02" }} />
                <Typography fontWeight={700} color="text.primary">Bedash Account</Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={0.8}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatTons(balance.bedash?.total ?? balance.Bedash?.total ?? 0)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Used:</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">{formatTons(balance.bedash?.used ?? balance.Bedash?.used ?? 0)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>Remaining:</Typography>
                  <Typography variant="body2" fontWeight={700} color="warning.dark">
                    {formatTons(balance.bedash?.remaining ?? balance.Bedash?.remaining ?? 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

        </Grid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} py={4}>
          <Typography variant="body2">No balance data available.</Typography>
        </Box>
      )}
    </Card>
  );
};

export default BalanceCard;