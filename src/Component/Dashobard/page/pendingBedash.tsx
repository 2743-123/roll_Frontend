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

/* ================= CONSTANTS ================= */

const BLINK_DURATION = 48 * 60 * 60 * 1000; // 48 hours in ms

/* ================= LOCAL STORAGE HELPERS ================= */

const getStoredConfirmTimes = () => {
  const data = localStorage.getItem("bedashConfirmTimes");
  return data ? JSON.parse(data) : {};
};

const setStoredConfirmTimes = (times: any) => {
  localStorage.setItem("bedashConfirmTimes", JSON.stringify(times));
};

/* ================= COMPONENT ================= */

const PendingBedash: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, loading, error } = useSelector(
    (state: RootState) => state.bedash,
  );

  const [visibleList, setVisibleList] = useState<any[]>([]);
  const [tick, setTick] = useState(0); // trigger re-render every second

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (user?.id) {
      dispatch(getBedashListAction());
    }
  }, [dispatch, user?.id]);

  /* ================= TIMER REFRESH ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ================= FILTER + 48H LOGIC ================= */

  useEffect(() => {
    if (!Array.isArray(data)) return;

    const confirmTimes = getStoredConfirmTimes();

    const filtered = data.filter((item: any) => {
      if (item.status === "pending") return true;

      if (item.status === "completed" && confirmTimes[item.id]) {
        const diff = Date.now() - confirmTimes[item.id];
        return diff < BLINK_DURATION;
      }

      return false;
    });

    const sorted = filtered.sort(
      (a: any, b: any) =>
        new Date(a.targetDate).getTime() -
        new Date(b.targetDate).getTime(),
    );

    setVisibleList(sorted);
  }, [data, tick]);

  /* ================= CONFIRM HANDLER ================= */

  const handleConfirm = async (item: any) => {
    if (!window.confirm(`Confirm completion for ID ${item.id}?`)) return;

    await dispatch(confirmBedashAction(item.id));

    const times = getStoredConfirmTimes();
    times[item.id] = Date.now();
    setStoredConfirmTimes(times);

    dispatch(getBedashListAction());
  };

  /* ================= AUTH / LOADING ================= */

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

  /* ================= UI ================= */

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

      {visibleList.length === 0 ? (
        <Typography align="center" mt={3}>
          🎉 All bedash items are completed!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {visibleList.map((item) => {
            const confirmTimes = getStoredConfirmTimes();
            const isBlinking =
              item.status === "completed" &&
              confirmTimes[item.id] &&
              Date.now() - confirmTimes[item.id] < BLINK_DURATION;

            return (
              <Grid key={item.id}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: isBlinking ? "#fff3e0" : "#e3f2fd",
                    borderLeft: `6px solid ${
                      isBlinking ? "#ff9800" : "#1976d2"
                    }`,
                    animation: isBlinking ? "blink 1s infinite" : "none",
                    "@keyframes blink": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                    transition: "all 0.3s",
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
                      color={
                        item.status === "completed"
                          ? "success"
                          : "warning"
                      }
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

                  {item.status === "pending" && (
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
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PendingBedash;
