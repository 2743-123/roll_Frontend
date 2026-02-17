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
import "../../../../fonts/NotoSans-Regular"; // ⭐ Gujarati supported font

type SortField = "none" | "flyash" | "bedash";

const AllTransection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminBalanceReducer,
  );

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("none");

  /** ⭐ selected rows */
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(getAdminBalanceAction());
  }, [dispatch]);

  const users: AdminUserBalance[] = data ?? [];

  const safe = (v: any) => (v ?? "").toString().toLowerCase();

  /** FILTER */
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

  /** DATE SORT */
  rows = rows.sort(
    (a, b) => new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime(),
  );

  /** REMAINING SORT */
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

      return bVal - aVal;
    });
  }

  /** toggle sort */
  const toggleSort = (field: SortField) => {
    setSortField(sortField === field ? "none" : field);
  };

  // ================= DRAG SELECT =================

  const handleMouseDown = (id: number) => {
    setIsDragging(true);
    setSelectedIds([id]);
  };

  const handleMouseEnter = (id: number) => {
    if (!isDragging) return;

    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMouseUp = () => setIsDragging(false);

  // ================= PDF =================

const generatePDF = () => {
  const selectedRows = rows.filter((r) => selectedIds.includes(r.tx.id));

  if (selectedRows.length === 0) {
    alert("Please select rows / કૃપા કરીને રો પસંદ કરો");
    return;
  }

  const doc = new jsPDF();

  // ⭐ SAME FONT as Token PDF (Gujarati supported)
  doc.setFont("NotoSansGujarati-Regular", "normal");
  doc.setFontSize(14);

  doc.text("Transaction Report / ટ્રાન્ઝેક્શન રિપોર્ટ", 14, 15);

  autoTable(doc, {
    startY: 22,
    styles: {
      font: "NotoSansGujarati-Regular", // ⭐ VERY IMPORTANT
      fontSize: 10,
    },
    head: [[
      "User",
      "Date",
      "Flyash",
      "Bedash",
      "Total ",
      "Flyash Tons",
      "Bedash Tons",
      "Payment ",
    ]],
    body: selectedRows.map(({ user, tx }) => [
      user.userName,
      new Date(tx.date).toLocaleString(),
      tx.flyashAmount,
      tx.bedashAmount,
      tx.totalAmount,
      tx.flyashTons,
      tx.bedashTons,
      tx.paymentMode,
    ]),
  });

  doc.save("transactions.pdf");
};


  // =================================================

  return (
    <Box p={3} onMouseUp={handleMouseUp}>
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

      {/* PDF BUTTON */}
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
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(({ user, tx }) => {
              const selected = selectedIds.includes(tx.id);

              return (
                <TableRow
                  key={tx.id}
                  hover
                  onMouseDown={() => handleMouseDown(tx.id)}
                  onMouseEnter={() => handleMouseEnter(tx.id)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selected ? "#e3f2fd" : "inherit",
                  }}
                >
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell>₹{tx.flyashAmount}</TableCell>
                  <TableCell>₹{tx.bedashAmount}</TableCell>
                  <TableCell>₹{tx.totalAmount}</TableCell>
                  <TableCell>{user.flyash.remaining}</TableCell>
                  <TableCell>{user.bedash.remaining}</TableCell>
                  <TableCell>{tx.paymentMode}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AllTransection;
