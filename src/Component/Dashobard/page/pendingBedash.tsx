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
import {
  confirmBedashAction,
  getBedashListAction,
} from "../../../Actions/Auth/bedash";

const PendingBedash: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, loading, error } = useSelector(
    (state: RootState) => state.bedash,
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
      const filtered = data
  .filter((item: any) => item.status === "pending")
  .sort(
    (a: any, b: any) =>
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
  );;
      setPendingList(filtered);
    }
  }, [data]);

  // 🔹 Confirm bedash click handler
  const handleConfirm = async (item: any) => {
    if (!window.confirm(`Confirm completion for ID ${item.id}?`)) return;
    await dispatch(confirmBedashAction(item.id));
    dispatch(getBedashListAction()); // refresh list after confirm
  };

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
        Pending Bedash List
      </Typography>

      {pendingList.length === 0 ? (
        <Typography align="center" mt={3}>
          🎉 All bedash items are completed!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {pendingList.map((item) => (
            <Grid key={item.id}>
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
                    {item.userName}
                  </Typography>
                  <Chip
                    label={item.status.toUpperCase()}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" mb={0.5}>
                  Material Type: <strong>{item.materialType}</strong>
                </Typography>
                <Typography variant="body2" mb={0.5}>
                  Remaining Tons:{" "}
                  <strong>{item.remainingTons.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2" mb={1}>
                  Target Date: <strong>{item.targetDate}</strong>
                </Typography>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 1, borderRadius: 2 }}
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
