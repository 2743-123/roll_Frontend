import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../Reducer";
import { AppDispatch } from "../../../store";
import { getBalanceAction } from "../../../Actions/Auth/balance";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";

const BalanceCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { data, error } = useSelector((state: RootState) => state.balance);

  useEffect(() => {
    if (user && token) {
      const userId = user.role === "user" ? user.id : selectedUser?.id;
      if (userId) dispatch(getBalanceAction(userId));
    }
  }, [token, user, selectedUser, dispatch]);

  return (
    <Card sx={{ maxWidth: 420, p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          💰 User Balance
        </Typography>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        {data ? (
          <Box mt={2}>
            {/* Flyash Section */}
            <Typography variant="h6">Flyash</Typography>
            <Typography variant="body2">
              Total: ₹{data.flyash?.total ?? 0}
            </Typography>
            <Typography variant="body2">
              Used: ₹{data.flyash?.used ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Remaining: ₹{data.flyash?.remaining ?? 0}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* Bedash Section */}
            <Typography variant="h6">Bedash</Typography>
            <Typography variant="body2">
              Total: ₹{data.bedash?.total ?? 0}
            </Typography>
            <Typography variant="body2">
              Used: ₹{data.bedash?.used ?? 0}
            </Typography>
            <Typography variant="body2">
              Remaining: ₹{data.bedash?.remaining ?? 0}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
            Loading balance...
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
