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

  /** 🔹 Hover popup state */
  const [hoverInfo, setHoverInfo] = useState<{
    userName: string;
    customerName: string;
    possible: number;
    carryText: string;
    tokenCount: number;
    x: number;
    y: number;
  } | null>(null);

  /** ⭐ timer refresh */
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(getAdminTokensAction());
  }, [dispatch]);

  const tokens: AdminToken[] = data ?? [];

  /** 🔹 Safe number */
  const toNumber = (v: string | number) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  /** 🔹 Possible tokens after blocking pending */
  const getPossibleTokens = (userId: number, remaining: string | number) => {
    const totalRemaining = toNumber(remaining);
    if (totalRemaining <= 0) return 0;

    const pendingCount = tokens.filter(
      (t) => t.userId === userId && t.status === "pending",
    ).length;

    const adjustedRemaining = totalRemaining - pendingCount * 27;
    if (adjustedRemaining <= 0) return 0;

    return Math.floor(adjustedRemaining / 27);
  };

  /** 🔹 Negative carryForward total of SAME CUSTOMER */
  const getCustomerNegativeTotal = (customerName: string) => {
    const totalNegative = tokens
      .filter(
        (t) => t.customerName === customerName && Number(t.carryForward) < 0,
      )
      .reduce((sum, t) => sum + Number(t.carryForward), 0);

    return Math.abs(totalNegative);
  };

  /** 🔹 Active tokens count (pending + updated) */
  const getCustomerActiveTokenCount = (customerName: string) => {
    return tokens.filter(
      (t) =>
        t.customerName === customerName &&
        (t.status === "pending" || t.status === "updated"),
    ).length;
  };

  /** 🔹 Remaining < 27 */
  const isLowStock = (remaining: string | number) => toNumber(remaining) < 27;

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

  // ================= TIMER =================

  const getRemainingTime = (confirmedAt: string | null) => {
    if (!confirmedAt) return "";

    const diff = FIFTEEN_DAYS - (Date.now() - new Date(confirmedAt).getTime());
    if (diff <= 0) return "Expired";

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${d}d ${h}h ${m}m ${s}`;
  };

  // ================= HOVER =================

  const handleHover = (t: AdminToken, e: React.MouseEvent) => {
    const negativeTotal = getCustomerNegativeTotal(t.customerName);

    setHoverInfo({
      userName: t.userName,
      customerName: t.customerName,
      possible: getPossibleTokens(t.userId, t.remainingTons),
      tokenCount: getCustomerActiveTokenCount(t.customerName),
      carryText:
        negativeTotal > 0
          ? `- ₹${negativeTotal} baki hai`
          : "+ No pending balance",
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleLeaveHover = () => setHoverInfo(null);

  // ================= PDF =================

  const handleDownloadPDF = () => {
    const selected = filteredTokens.filter((t) =>
      selectedIds.includes(t.tokenId),
    );

    if (!selected.length) {
      alert("Select at least one row");
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
          "Remaining",
          "Status",
        ],
      ],
      body: selected.map((t) => [
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

      <Box mb={2}>
        <TextField
          label="Search..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Box mb={2}>
        <Button
          variant="contained"
          disabled={!selectedIds.length}
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
              {[
                "User",
                "Customer",
                "Truck",
                "Material",
                "Weight",
                "Carry ₹",
                "Remaining",
                "Timer",
                "Status",
              ].map((h) => (
                <TableCell key={h} sx={{ color: "#fff" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTokens.map((t) => {
              const selected = selectedIds.includes(t.tokenId);
              const low = isLowStock(t.remainingTons);

              return (
                <TableRow
                  key={t.tokenId}
                  hover
                  onMouseDown={() => handleMouseDown(t.tokenId)}
                  onMouseEnter={(e) => {
                    handleMouseEnter(t.tokenId);
                    handleHover(t, e);
                  }}
                  onMouseLeave={handleLeaveHover}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selected
                      ? "#e3f2fd"
                      : low
                        ? "#ffebee"
                        : "inherit",
                    animation: !selected && low ? "blink 1s infinite" : "none",
                    "@keyframes blink": {
                      "0%": { backgroundColor: "#ffebee" },
                      "50%": { backgroundColor: "#ffcdd2" },
                      "100%": { backgroundColor: "#ffebee" },
                    },
                  }}
                >
                  <TableCell>{t.userName}</TableCell>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.truckNumber}</TableCell>
                  <TableCell>{t.materialType}</TableCell>
                  <TableCell>{t.weight}</TableCell>
                  <TableCell>₹{t.carryForward}</TableCell>
                  <TableCell>{t.remainingTons}</TableCell>
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

      {/* 🔥 FINAL POPUP */}
      {hoverInfo && (
        <Box
          sx={{
            position: "fixed",
            top: hoverInfo.y + 10,
            left: hoverInfo.x + 10,
            background: "#1976d2",
            color: "#fff",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 9999,
            minWidth: 260,
          }}
        >
          <Typography variant="body2">
            Active Tokens: <strong>{hoverInfo.tokenCount}</strong>
          </Typography>
          <Typography fontWeight={700}>{hoverInfo.userName}</Typography>
          <Typography variant="body2">
            27 ton ke hisab se aur token:
            <strong> {hoverInfo.possible}</strong>
          </Typography>

          <Typography fontWeight={700}>{hoverInfo.customerName}</Typography>

          <Typography variant="body2">{hoverInfo.carryText}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AllUserTokens;
