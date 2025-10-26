import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Reducer";
import { AppDispatch } from "../../../store";
import { getBalanceAction } from "../../../Actions/Auth/balance";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const BalanceCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { data, error, loading } = useSelector(
    (state: RootState) => state.balance
  );

  useEffect(() => {
    if (user && token) {
      const userId = user.role === "user" ? user.id : selectedUser?.id;
      if (userId) dispatch(getBalanceAction(userId));
    }
  }, [token, user, selectedUser, dispatch]);

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
      {/* 🔹 Header */}
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
        <Typography
          variant="body2"
          sx={{ mt: 2, color: "gray", textAlign: "center" }}
        >
          Loading balance...
        </Typography>
      ) : error ? (
        <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
          {error}
        </Typography>
      ) : data ? (
        <Box mt={1}>
          <Grid container spacing={2}>
            {/* 🔹 Flyash Section */}
            <Grid >
         
              
                <Box display="flex" alignItems="center" mb={1} gap={1}>
                  <LocalShippingIcon color="success" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Flyash
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Total: <strong>₹{data.flyash?.total ?? 0}</strong>
                </Typography>
                <Typography variant="body2">
                  Used: <strong>₹{data.flyash?.used ?? 0}</strong>
                </Typography>
                <Typography variant="body2">
                  Remaining: <strong>₹{data.flyash?.remaining ?? 0}</strong>
                </Typography>
            
            </Grid>

            {/* 🔹 Bedash Section */}
            <Grid >
          
              
                <Box display="flex" alignItems="center" mb={1} gap={1}>
                  <LocalShippingIcon color="warning" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Bedash
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Total: <strong>₹{data.bedash?.total ?? 0}</strong>
                </Typography>
                <Typography variant="body2">
                  Used: <strong>₹{data.bedash?.used ?? 0}</strong>
                </Typography>
                <Typography variant="body2">
                  Remaining: <strong>₹{data.bedash?.remaining ?? 0}</strong>
                </Typography>
             
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{ mt: 2, color: "gray", textAlign: "center" }}
        >
          No balance data available.
        </Typography>
      )}
    </Card>
  );
};

export default BalanceCard;
