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
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getAdminTokensAction } from "../../../../Actions/Auth/TokenAction";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../../fonts/NotoSans-Regular";

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

const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

const AllUserTokens: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, totalTokens, loading, error } = useSelector(
    (state: RootState) => state.adminTokenReducer,
  );

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  /** ⭐ force re-render every second for timer */
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  // ================= REMOVE AFTER 15 DAYS =================

  const visibleTokens = tokens.filter((t) => {
    if (t.status !== "completed" || !t.confirmedAt) return true;

    const confirmedTime = new Date(t.confirmedAt).getTime();
    return Date.now() - confirmedTime < FIFTEEN_DAYS;
  });

  // ================= SEARCH =================

  const filteredTokens = visibleTokens.filter((t) => {
    const q = search.toLowerCase();

    return (
      t.customerName?.toLowerCase().includes(q) ||
      t.userName?.toLowerCase().includes(q) ||
      t.truckNumber?.toLowerCase().includes(q) ||
      t.materialType?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

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

  // ================= COUNTDOWN =================

  const getRemainingTime = (confirmedAt: string | null) => {
    if (!confirmedAt) return "";

    const diff = FIFTEEN_DAYS - (Date.now() - new Date(confirmedAt).getTime());
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    return `${days}d ${hours}h ${mins}m ${secs}`;
  };

  // ================= PDF =================

  const handleDownloadPDF = () => {
    const selectedTokens = filteredTokens.filter((t) =>
      selectedIds.includes(t.tokenId),
    );

    if (selectedTokens.length === 0) {
      alert("Please select at least one row");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("NotoSans-Regular", "normal");
    doc.setFontSize(14);

    doc.text("Admin Token Report", 14, 15);

    autoTable(doc, {
      startY: 22,
      styles: { font: "NotoSans-Regular", fontSize: 10 },
      head: [
        [
          "User",
          "Customer",
          "Truck",
          "Material",
          "Weight",
          "Carry ₹",
          "Remaining Tons",
          "Status",
        ],
      ],
      body: selectedTokens.map((t) => [
        t.userName,
        t.customerName,
        t.truckNumber,
        t.materialType,
        t.weight,
        `₹${t.carryForward}`,
        t.remainingTons,
        t.status.toUpperCase(),
      ]),
    });

    doc.save("Token-Report.pdf");
  };

  // ================= UI =================

  return (
    <Box p={3} onMouseUp={handleMouseUp}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Admin Token Report
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Total Tokens: {totalTokens}
      </Typography>

      {/* SEARCH */}
      <Box mb={2}>
        <TextField
          label="Search..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* PDF BUTTON */}
      <Box mb={2}>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0}
          onClick={handleDownloadPDF}
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
              <TableCell sx={{ color: "#fff" }}>Customer</TableCell>
              <TableCell sx={{ color: "#fff" }}>Truck</TableCell>
              <TableCell sx={{ color: "#fff" }}>Material</TableCell>
              <TableCell sx={{ color: "#fff" }}>Weight</TableCell>
              <TableCell sx={{ color: "#fff" }}>Carry ₹</TableCell>
              <TableCell sx={{ color: "#fff" }}>Remaining</TableCell>
              <TableCell sx={{ color: "#fff" }}>Timer</TableCell>
              <TableCell sx={{ color: "#fff" }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTokens.map((t) => {
              const selected = selectedIds.includes(t.tokenId);

              return (
                <TableRow
                  key={t.tokenId}
                  hover
                  onMouseDown={() => handleMouseDown(t.tokenId)}
                  onMouseEnter={() => handleMouseEnter(t.tokenId)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selected ? "#e3f2fd" : "inherit",
                  }}
                >
                  <TableCell>{t.userName}</TableCell>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.truckNumber}</TableCell>
                  <TableCell>{t.materialType}</TableCell>
                  <TableCell>{t.weight}</TableCell>
                  <TableCell>₹{t.carryForward}</TableCell>
                  <TableCell>{t.remainingTons}</TableCell>

                  {/* ⏳ TIMER */}
                  <TableCell>
                    {t.status === "completed"
                      ? getRemainingTime(t.confirmedAt)
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
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AllUserTokens;
