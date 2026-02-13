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

  useEffect(() => {
    dispatch(getAdminBalanceAction());
  }, [dispatch]);

  const users: AdminUserBalance[] = data ?? [];

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        All Transactions
      </Typography>

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

              {/* ⭐ NEW */}
              <TableCell sx={{ color: "#fff" }}>Flyash Remaining</TableCell>
              <TableCell sx={{ color: "#fff" }}>Bedash Remaining</TableCell>

              <TableCell sx={{ color: "#fff" }}>Payment</TableCell>
              <TableCell sx={{ color: "#fff" }}>Reference</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.flatMap((u) =>
              u.transactions.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{u.userName}</TableCell>

                  <TableCell>{new Date(t.date).toLocaleString()}</TableCell>

                  <TableCell>₹{t.flyashAmount}</TableCell>
                  <TableCell>₹{t.bedashAmount}</TableCell>
                  <TableCell>₹{t.totalAmount}</TableCell>

                  <TableCell>{t.flyashTons}</TableCell>
                  <TableCell>{t.bedashTons}</TableCell>

                  {/* ⭐ Remaining Tons */}
                  <TableCell>{u.flyash.remaining}</TableCell>
                  <TableCell>{u.bedash.remaining}</TableCell>

                  <TableCell>{t.paymentMode}</TableCell>
                  <TableCell>{t.referenceNumber ?? "-"}</TableCell>
                </TableRow>
              )),
            )}

            {users.length === 0 && !loading && (
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
