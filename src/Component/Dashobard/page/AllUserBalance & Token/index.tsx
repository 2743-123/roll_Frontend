import React, { useEffect, useState } from "react";
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
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getAdminTokensAction } from "../../../../Actions/Auth/TokenAction";

/** 🔹 Token type */
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

  const [search, setSearch] = useState("");

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

  /** 🔍 Search filter */
  const filteredTokens = tokens.filter((t) => {
    const q = search.toLowerCase();

    return (
      (t.customerName ?? "").toLowerCase().includes(q) ||
      (t.userName ?? "").toLowerCase().includes(q) ||
      (t.truckNumber ?? "").toLowerCase().includes(q) ||
      (t.materialType ?? "").toLowerCase().includes(q) ||
      (t.status ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Admin Token Report
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Total Tokens: {totalTokens}
      </Typography>

      {/* 🔍 Search box */}
      <Box mb={2}>
        <TextField
          label="Search by Customer, User, Truck, Material, Status"
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

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
            {filteredTokens.map((t) => (
              <TableRow key={t.tokenId} hover>
                <TableCell>{t.userName}</TableCell>
                <TableCell>{t.customerName}</TableCell>
                <TableCell>{t.truckNumber}</TableCell>
                <TableCell>{t.materialType}</TableCell>
                <TableCell>{t.weight}</TableCell>
                <TableCell>₹{t.carryForward}</TableCell>
                <TableCell>{t.remainingTons}</TableCell>

                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>

                <TableCell>
                  {t.confirmedAt
                    ? new Date(t.confirmedAt).toLocaleString()
                    : "-"}
                </TableCell>

                <TableCell>
                  <Chip
                    label={t.status.toUpperCase()}
                    color={getStatusColor(t.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}

            {filteredTokens.length === 0 && !loading && (
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
