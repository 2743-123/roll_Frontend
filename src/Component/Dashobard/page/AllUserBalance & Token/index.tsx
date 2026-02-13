import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getAdminTokensAction } from "../../../../Actions/Auth/TokenAction";

/** 🔹 Token type (API ke exact hisaab se) */
interface AdminToken {
  tokenId: number;
  customerName: string;
  truckNumber: string;
  materialType: string;
  weight: string;
  carryForward: string;
  status: "pending" | "updated" | "completed";
  userId: number;
  userName: string;
  remainingTons: string;
  createdAt: string;
  confirmedAt: string | null;
}

const AllUserTokens: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, totalTokens, loading, error } = useSelector(
    (state: RootState) => state.adminTokenReducer,
  );

  useEffect(() => {
    dispatch(getAdminTokensAction());
  }, [dispatch]);

  const tokens: AdminToken[] = data ?? [];

  /** 🔹 Status color */
  const getStatusColor = (status: string) => {
    if (status === "completed") return "success";
    if (status === "updated") return "warning";
    return "default";
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Admin Token Report
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Total Tokens: {totalTokens}
      </Typography>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#1976d2" }}>
              <TableCell sx={{ color: "#fff" }}>User</TableCell>
              <TableCell sx={{ color: "#fff" }}>Customer</TableCell>
              <TableCell sx={{ color: "#fff" }}>Truck</TableCell>
              <TableCell sx={{ color: "#fff" }}>Material</TableCell>
              <TableCell sx={{ color: "#fff" }}>Weight</TableCell>
              <TableCell sx={{ color: "#fff" }}>Carry Forward ₹</TableCell>
              <TableCell sx={{ color: "#fff" }}>Remaining Tons</TableCell>
              <TableCell sx={{ color: "#fff" }}>Created Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Confirmed Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tokens.map((t) => (
              <TableRow key={t.tokenId} hover>
                <TableCell>{t.userName}</TableCell>
                <TableCell>{t.customerName}</TableCell>
                <TableCell>{t.truckNumber}</TableCell>
                <TableCell>{t.materialType}</TableCell>
                <TableCell>{t.weight}</TableCell>
                <TableCell>₹{t.carryForward}</TableCell>
                <TableCell>{t.remainingTons}</TableCell>

                {/* Created date */}
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>

                {/* Confirmed date */}
                <TableCell>
                  {t.confirmedAt
                    ? new Date(t.confirmedAt).toLocaleString()
                    : "-"}
                </TableCell>

                {/* Status chip */}
                <TableCell>
                  <Chip
                    label={t.status.toUpperCase()}
                    color={getStatusColor(t.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}

            {tokens.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No Tokens Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AllUserTokens;
