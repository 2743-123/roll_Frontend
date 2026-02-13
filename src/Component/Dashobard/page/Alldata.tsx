import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import BalanceCard from "./balance";
import PendingBedash from "./pendingBedash";
import PendingTokens from "./pendingToken";

const AllData: React.FC = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* 🔹 Dashboard Title */}
      <Typography
        variant="h5"
        fontWeight={600}
        mb={3}
        sx={{ color: "#1976d2" }}
      >
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* 🔹 Pending Tokens */}
        <Grid>
          <BalanceCard />
        </Grid>

        {/* 🔹 Balance Card */}
        <Grid>
          <PendingTokens />
        </Grid>

        {/* 🔹 Pending Bedash */}
        <Grid>
          <PendingBedash />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AllData;
