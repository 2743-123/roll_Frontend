import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BalanceCard from "./balance";
import PendingBedash from "./pendingBedash";
import PendingTokens from "./pendingToken";

const AllData: React.FC = () => {
  return (
    <Box 
      sx={{ 
        p: 3, 
        backgroundColor: "#f8f9fa", 
        minHeight: "85vh", 
        borderRadius: 4 
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          borderRadius: 3,
          px: 3,
          py: 2.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <DashboardIcon sx={{ fontSize: 30, color: "#4caf50" }} />
        <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
          Dashboard Overview
        </Typography>
      </Box>

      {/* ================= GRID CARDS ================= */}
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid >
          <Box sx={{ height: "100%", "& > *": { height: "100%" } }}>
            <BalanceCard />
          </Box>
        </Grid>

        {/* Pending Tokens */}
        <Grid>
          <Box sx={{ height: "100%", "& > *": { height: "100%" } }}>
            <PendingTokens />
          </Box>
        </Grid>

        {/* Pending Bedash */}
        <Grid >
          <Box sx={{ height: "100%", "& > *": { height: "100%" } }}>
            <PendingBedash />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AllData;