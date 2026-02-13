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
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../../store";
import { getAdminBalanceAction } from "../../../../Actions/Auth/balance";
import { AdminUserBalance } from "../../../../ActionType/balancetype.ts/balance";

const AllTransection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminBalanceReducer,
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAdminBalanceAction());
  }, [dispatch]);

  const users: AdminUserBalance[] = data ?? [];

  /** 🔹 safe string helper (null crash fix) */
  const safe = (v: any) => (v ?? "").toString().toLowerCase();

  /** 🔍 Filtered transactions */
  const filteredRows = users.flatMap((u) =>
    u.transactions
      .filter((t) => {
        const q = search.toLowerCase();

        return (
          safe(u.userName).includes(q) ||
          safe(t.date).includes(q) ||
          safe(t.flyashAmount).includes(q) ||
          safe(t.bedashAmount).includes(q) ||
          safe(t.totalAmount).includes(q) ||
          safe(t.flyashTons).includes(q) ||
          safe(t.bedashTons).includes(q) ||
          safe(t.paymentMode).includes(q) ||
          safe(t.referenceNumber).includes(q)
        );
      })
      .map((t) => ({ user: u, tx: t })),
  );

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        All Transactions
      </Typography>

      {/* 🔍 Search Box */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search by User, Amount, Tons, Payment, Reference..."
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
              <TableCell sx={{ color: "#fff" }}>Date</TableCell>

              <TableCell sx={{ color: "#fff" }}>Flyash ₹</TableCell>
              <TableCell sx={{ color: "#fff" }}>Bedash ₹</TableCell>
              <TableCell sx={{ color: "#fff" }}>Total ₹</TableCell>

              <TableCell sx={{ color: "#fff" }}>Flyash Tons</TableCell>
              <TableCell sx={{ color: "#fff" }}>Bedash Tons</TableCell>

              <TableCell sx={{ color: "#fff" }}>Flyash Remaining</TableCell>
              <TableCell sx={{ color: "#fff" }}>Bedash Remaining</TableCell>

              <TableCell sx={{ color: "#fff" }}>Payment</TableCell>
              <TableCell sx={{ color: "#fff" }}>Reference</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map(({ user, tx }) => (
              <TableRow key={tx.id} hover>
                <TableCell>{user.userName}</TableCell>

                <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>

                <TableCell>₹{tx.flyashAmount}</TableCell>
                <TableCell>₹{tx.bedashAmount}</TableCell>
                <TableCell>₹{tx.totalAmount}</TableCell>

                <TableCell>{tx.flyashTons}</TableCell>
                <TableCell>{tx.bedashTons}</TableCell>

                <TableCell>{user.flyash.remaining}</TableCell>
                <TableCell>{user.bedash.remaining}</TableCell>

                <TableCell>{tx.paymentMode}</TableCell>
                <TableCell>{tx.referenceNumber ?? "-"}</TableCell>
              </TableRow>
            ))}

            {filteredRows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No Transactions Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AllTransection;
