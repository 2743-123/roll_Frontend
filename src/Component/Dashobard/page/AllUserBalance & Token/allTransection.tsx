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

type SortField = "none" | "flyash" | "bedash";

const AllTransection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminBalanceReducer
  );

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("none");

  useEffect(() => {
    dispatch(getAdminBalanceAction());
  }, [dispatch]);

  const users: AdminUserBalance[] = data ?? [];

  /** null safe helper */
  const safe = (v: any) => (v ?? "").toString().toLowerCase();

  /** ================= FILTER ================= */
  let rows = users.flatMap((u) =>
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
      .map((t) => ({ user: u, tx: t }))
  );

  /** ================= DEFAULT DATE SORT ================= */
  rows = rows.sort(
    (a, b) =>
      new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime()
  );

  /** ================= REMAINING SORT ================= */
  if (sortField !== "none") {
    rows = [...rows].sort((a, b) => {
      const aVal =
        sortField === "flyash"
          ? Number(a.user.flyash.remaining)
          : Number(a.user.bedash.remaining);

      const bVal =
        sortField === "flyash"
          ? Number(b.user.flyash.remaining)
          : Number(b.user.bedash.remaining);

      return bVal - aVal; // ⭐ highest → lowest
    });
  }

  /** toggle */
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortField("none"); // back to date sort
    } else {
      setSortField(field); // highest → lowest
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        All Transactions
      </Typography>

      {/* SEARCH */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search..."
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

              {/* SORTABLE */}
              <TableCell
                sx={{ color: "#fff", cursor: "pointer" }}
                onClick={() => toggleSort("flyash")}
              >
                Flyash Remaining {sortField === "flyash" ? "🔽" : ""}
              </TableCell>

              <TableCell
                sx={{ color: "#fff", cursor: "pointer" }}
                onClick={() => toggleSort("bedash")}
              >
                Bedash Remaining {sortField === "bedash" ? "🔽" : ""}
              </TableCell>

              <TableCell sx={{ color: "#fff" }}>Payment</TableCell>
              <TableCell sx={{ color: "#fff" }}>Reference</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(({ user, tx }) => (
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

            {rows.length === 0 && !loading && (
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
