import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Reducer";
import { AppDispatch } from "../../../store";
import { getBalanceAction } from "../../../Actions/Auth/balance";
import { Card, Typography, Box, Grid } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const BalanceCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { data, error, loading } = useSelector(
    (state: RootState) => state.balance,
  );

  useEffect(() => {
    if (user && token) {
      const userId = user.role === "user" ? user.id : selectedUser?.id;
      if (userId) dispatch(getBalanceAction(userId));
    }
  }, [token, user, selectedUser, dispatch]);

  const balance = Array.isArray(data) ? data[0] : data;

  return (
    <Card
      sx={{
        maxWidth: 450,
        p: 2,
        borderRadius: 3,
        boxShadow: 5,
        background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mb={2}
        sx={{
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
          p: 1.5,
          borderRadius: 2,
        }}
      >
        <MonetizationOnIcon />
        <Typography variant="h6" fontWeight={600}>
          User Balance
        </Typography>
      </Box>

      {loading ? (
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          Loading balance...
        </Typography>
      ) : error ? (
        <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
          {error}
        </Typography>
      ) : balance ? (
        <Grid container spacing={2}>
          {/* Flyash */}
          <Grid>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon color="success" />
              <Typography fontWeight={600}>Flyash</Typography>
            </Box>
            <Typography>Total: ₹{balance.flyash?.total ?? 0}</Typography>
            <Typography>Used: ₹{balance.flyash?.used ?? 0}</Typography>
            <Typography>
              Remaining: ₹{balance.flyash?.remaining ?? 0}
            </Typography>
          </Grid>

          {/* Bedash */}
          <Grid>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon color="warning" />
              <Typography fontWeight={600}>Bedash</Typography>
            </Box>
            <Typography>Total: ₹{balance.bedash?.total ?? 0}</Typography>
            <Typography>Used: ₹{balance.bedash?.used ?? 0}</Typography>
            <Typography>
              Remaining: ₹{balance.bedash?.remaining ?? 0}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          No balance data available.
        </Typography>
      )}
    </Card>
  );
};

export default BalanceCard;
