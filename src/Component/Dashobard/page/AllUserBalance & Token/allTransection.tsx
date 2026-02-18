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
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../../store";
import { getAdminBalanceAction } from "../../../../Actions/Auth/balance";
import { AdminUserBalance } from "../../../../ActionType/balancetype.ts/balance";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../../fonts/NotoSans-Regular";

const AllTransection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminBalanceReducer,
  );

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [popup, setPopup] = useState<{
    userName: string;
    total: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    dispatch(getAdminBalanceAction());
  }, [dispatch]);

  const users: AdminUserBalance[] = data ?? [];

  const safe = (v: any) => (v ?? "").toString().toLowerCase();

  /* ================= FILTER ================= */

  let rows = users.flatMap((u) =>
    u.transactions
      .filter((t) => {
        const q = search.toLowerCase();
        return (
          safe(u.userName).includes(q) ||
          safe(t.date).includes(q) ||
          safe(t.totalAmount).includes(q)
        );
      })
      .map((t) => ({ user: u, tx: t })),
  );

  rows = rows.sort(
    (a, b) => new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime(),
  );

  /* ================= CURRENT MONTH TOTAL ================= */

  const getCurrentMonthTotal = (user: AdminUserBalance) => {
    const now = new Date();

    return user.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + Number(t.totalAmount), 0);
  };

  /* ================= DRAG SELECT ================= */

  const handleMouseDown = (id: number) => {
    setIsDragging(true);
    setSelectedIds([id]);
  };

  const handleMouseEnterSelect = (id: number) => {
    if (!isDragging) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMouseUp = () => setIsDragging(false);

  /* ================= POPUP ================= */

  const handleRowHover = (
    user: AdminUserBalance,
    event: React.MouseEvent,
  ) => {
    const total = getCurrentMonthTotal(user);

    setPopup({
      userName: user.userName,
      total,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleLeave = () => setPopup(null);

  /* ================= PDF ================= */

  const generatePDF = () => {
    const selectedRows = rows.filter((r) =>
      selectedIds.includes(r.tx.id),
    );

    if (selectedRows.length === 0) {
      alert("Please select rows");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("NotoSans-Regular", "normal");
    doc.setFontSize(14);
    doc.text("Transaction Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      styles: { font: "NotoSans-Regular", fontSize: 10 },
      head: [
        [
          "User",
          "Date",
          "Flyash ₹",
          "Bedash ₹",
          "Total ₹",
          "Flyash Tons",
          "Bedash Tons",
          "Flyash Remaining",
          "Bedash Remaining",
          "Payment",
        ],
      ],
      body: selectedRows.map(({ user, tx }) => [
        user.userName,
        new Date(tx.date).toLocaleString(),
        tx.flyashAmount,
        tx.bedashAmount,
        tx.totalAmount,
        tx.flyashTons,
        tx.bedashTons,
        user.flyash.remaining,
        user.bedash.remaining,
        tx.paymentMode,
      ]),
    });

    doc.save("transactions.pdf");
  };

  /* ================= UI ================= */

  return (
    <Box p={3} onMouseUp={handleMouseUp}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        All Transactions
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Box mb={2}>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0}
          onClick={generatePDF}
        >
          Download Selected PDF
        </Button>
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
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(({ user, tx }) => {
              const selected = selectedIds.includes(tx.id);

              const monthlyTotal = getCurrentMonthTotal(user);
              const isHighMonthly = monthlyTotal >= 100000;

              return (
                <TableRow
                  key={tx.id}
                  hover
                  onMouseDown={() => handleMouseDown(tx.id)}
                  onMouseEnter={(e) => {
                    handleMouseEnterSelect(tx.id);
                    handleRowHover(user, e);
                  }}
                  onMouseLeave={handleLeave}
                  sx={{
                    cursor: "pointer",

                    backgroundColor: selected
                      ? "#e3f2fd"
                      : isHighMonthly
                      ? "#ffebee"
                      : "inherit",

                    animation:
                      !selected && isHighMonthly
                        ? "redBlink 1s infinite"
                        : "none",

                    "@keyframes redBlink": {
                      "0%": { backgroundColor: "#ffebee" },
                      "50%": { backgroundColor: "#ffcdd2" },
                      "100%": { backgroundColor: "#ffebee" },
                    },
                  }}
                >
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* 🔥 Hover Popup */}
      {popup && (
        <Box
          sx={{
            position: "fixed",
            top: popup.y + 10,
            left: popup.x + 10,
            background: "#1976d2",
            color: "#fff",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 9999,
            minWidth: 220,
          }}
        >
          <Typography fontWeight={700}>{popup.userName}</Typography>
          <Typography variant="body2">
            This Month Total:
            <strong> ₹{popup.total.toLocaleString()}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AllTransection;
