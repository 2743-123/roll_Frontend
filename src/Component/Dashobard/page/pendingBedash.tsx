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
import {
  confirmBedashAction,
  getBedashListAction,
} from "../../../Actions/Auth/bedash";

const PendingBedash: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth); // ✅ auth user
  const { data, loading, error } = useSelector(
    (state: RootState) => state.bedash
  );

  const [pendingList, setPendingList] = useState<any[]>([]);

  // 🔹 Fetch bedash list only when user is logged in
  useEffect(() => {
    if (user?.id) {
      dispatch(getBedashListAction());
    }
  }, [dispatch, user?.id]);

  // 🔹 Filter only pending items
  useEffect(() => {
    if (Array.isArray(data)) {
      const filtered = data.filter((item: any) => item.status === "pending");
      setPendingList(filtered);
    }
  }, [data]);

  // 🔹 Confirm bedash click handler
  const handleConfirm = async (item: any) => {
    if (!window.confirm(`Confirm completion for ID ${item.id}?`)) return;
    await dispatch(confirmBedashAction(item.id));
    dispatch(getBedashListAction()); // refresh list after confirm
  };

  // ✅ Loading / Error / Empty states
  if (!user?.id)
    return (
      <Typography align="center" mt={4}>
        Please login first.
      </Typography>
    );

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
        Pending Bedash List
      </Typography>

      {pendingList.length === 0 ? (
        <Typography align="center" mt={3}>
          🎉 All bedash items are completed!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {pendingList.map((item) => (
            <Grid key={item.id}>
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
                  {item.userName}
                </Typography>
                <Typography variant="body2">
                  Material Type: {item.materialType}
                </Typography>
                <Typography variant="body2">
                  Remaining Tons: {item.remainingTons.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Target Date: {item.targetDate}
                </Typography>
                <Typography variant="body2" color="orange">
                  Status: {item.status.toUpperCase()}
                </Typography>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  sx={{ mt: 1 }}
                  onClick={() => handleConfirm(item)}
                >
                  Confirm
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PendingBedash;
