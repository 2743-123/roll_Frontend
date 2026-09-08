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
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
  const [, setTick] = useState(0); // trigger re-render every second

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
  }, [data]);

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
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff" }}>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Please login first to view pending bedash items.
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

  /* ================= UI ================= */
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
        <Inventory2Icon sx={{ fontSize: 26, color: "#ffb74d" }} />
        <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
          Pending Bedash List
        </Typography>
      </Box>

      {/* ================= CONTENT BODY ================= */}
      <Box flexGrow={1} overflow="auto" maxHeight="450px" pr={0.5}>
        {visibleList.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} >
            <Typography variant="h6" fontWeight={600}>All Clear!</Typography>
            <Typography variant="body2">🎉 All bedash items are completed.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {visibleList.map((item) => {
              const confirmTimes = getStoredConfirmTimes();
              const isBlinking =
                item.status === "completed" &&
                confirmTimes[item.id] &&
                Date.now() - confirmTimes[item.id] < BLINK_DURATION;

              return (
                <Grid  key={item.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: isBlinking ? "#fff3e0" : "#f8f9fa",
                      border: `1px solid ${isBlinking ? "#ffb74d" : "#e0e0e0"}`,
                      borderLeft: `6px solid ${
                        isBlinking ? "#ed6c02" : "#1976d2"
                      }`,
                      animation: isBlinking ? "blink 1s infinite" : "none",
                      "@keyframes blink": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                        "100%": { opacity: 1 },
                      },
                      transition: "all 0.3s",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1.5}
                    >
                      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
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
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={0.5} mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Material: <strong style={{ color: "#333", textTransform: "capitalize" }}>{item.materialType}</strong>
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Remaining Tons:{" "}
                        <strong style={{ color: "#2e7d32" }}>{item.remainingTons} T</strong>
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Target Date: <strong style={{ color: "#333" }}>{item.targetDate}</strong>
                      </Typography>
                    </Box>

                    {item.status === "pending" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{ 
                          mt: 0.5, 
                          borderRadius: 2, 
                          fontWeight: 600,
                          textTransform: "none",
                          boxShadow: "none",
                          "&:hover": { boxShadow: "0 2px 8px rgba(46,125,50,0.3)" }
                        }}
                        onClick={() => handleConfirm(item)}
                      >
                        Confirm Completion
                      </Button>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default PendingBedash;