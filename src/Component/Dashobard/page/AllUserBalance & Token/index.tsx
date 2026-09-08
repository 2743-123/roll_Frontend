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
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
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

    return `${d}d ${h}h ${m}m ${s}s`;
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
          "Created At",
          "Confirmed At",
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
        t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
        t.confirmedAt ? new Date(t.confirmedAt).toLocaleString() : "-",
      ]),
    });

    doc.save("Token-Report.pdf");
  };

  /* ================= FORMAT CURRENCY ================= */
  const formatCur = (val: string | number) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  /* ================= LOADING & ERROR ================= */
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" variant="h6" sx={{ mt: 5 }}>
        {error}
      </Typography>
    );

  // ================= UI =================
  return (
    <Box p={3} onMouseUp={handleMouseUp} sx={{ background: "#f8f9fa", minHeight: "85vh", borderRadius: 4 }}>
      
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          borderRadius: 3,
          px: 3,
          py: 2.5,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <SupervisorAccountIcon sx={{ fontSize: 30, color: "#81c784" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
              All User Tokens Report
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Total Tokens: <strong>{totalTokens}</strong>
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search tokens..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              width: { xs: "100%", sm: "260px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            disabled={!selectedIds.length}
            onClick={handleDownloadPDF}
            sx={{
              backgroundColor: "#ffeb3b",
              color: "#000",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              "&:hover": { backgroundColor: "#fbc02d" },
              "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" }
            }}
          >
            Download PDF ({selectedIds.length})
          </Button>
        </Box>
      </Box>

      {/* ================= TABLE CONTAINER ================= */}
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          maxHeight: "68vh",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {[
                { label: "User", align: "left" },
                { label: "Customer", align: "left" },
                { label: "Truck", align: "left" },
                { label: "Material", align: "left" },
                { label: "Weight", align: "right" },
                { label: "Carry ₹", align: "right" },
                { label: "Remaining", align: "right" },
                { label: "Timer", align: "center" },
                { label: "Status", align: "center" },
                { label: "Created At", align: "left" },
                { label: "Confirmed At", align: "left" },
              ].map((col) => (
                <TableCell
                  key={col.label}
                  align={col.align as any}
                  sx={{
                    backgroundColor: "#f4f6f8",
                    color: "#333",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTokens.length > 0 ? (
              filteredTokens.map((t) => {
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
                        ? "#e3f2fd !important"
                        : low
                          ? "#ffebee !important"
                          : "inherit",
                      animation: !selected && low ? "blink 1.5s infinite" : "none",
                      "& td": { borderBottom: "1px solid #f0f0f0" },

                      "@keyframes blink": {
                        "0%": { backgroundColor: "#ffebee" },
                        "50%": { backgroundColor: "#ffcdd2" },
                        "100%": { backgroundColor: "#ffebee" },
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>{t.userName}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t.customerName}</TableCell>
                    <TableCell>
                      <Chip label={t.truckNumber || "N/A"} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize", color: t.materialType?.toLowerCase() === 'bedash' ? '#ed6c02' : '#757575', fontWeight: 500 }}>
                      {t.materialType}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>{t.weight} T</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCur(t.carryForward)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: low ? "#d32f2f" : "#2e7d32" }}>
                      {t.remainingTons} T
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600 }}>
                      {t.status === "completed" ? getRemainingTime(t.confirmedAt) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={t.status}
                        size="small"
                        color={getStatusColor(t.status) as any}
                        sx={{ textTransform: "capitalize", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true
                      }) : "-"}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {t.confirmedAt ? new Date(t.confirmedAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true
                      }) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Tokens Found</Typography>
                    <Typography variant="body2">Try adjusting your search criteria.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* ================= HOVER POPUP ================= */}
      {hoverInfo && (
        <Box
          sx={{
            position: "fixed",
            top: hoverInfo.y + 15,
            left: hoverInfo.x + 15,
            background: "rgba(15, 32, 39, 0.95)",
            color: "#fff",
            p: 2,
            borderRadius: 2.5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 9999,
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: 260,
          }}
        >
          <Typography variant="caption" sx={{ color: "#81c784", fontWeight: 700, textTransform: "uppercase" }}>
            {hoverInfo.userName}
          </Typography>
          <Typography fontWeight={700} color="#ffb74d" variant="subtitle1" mb={1}>
            {hoverInfo.customerName}
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="body2">
              Active Tokens: <strong>{hoverInfo.tokenCount}</strong>
            </Typography>
            <Typography variant="body2">
              Possible tokens (27T): <strong style={{ color: "#64b5f6" }}>{hoverInfo.possible}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, pt: 0.5, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              Carry Status: <strong style={{ color: hoverInfo.carryText.includes("baki") ? "#ef5350" : "#81c784" }}>{hoverInfo.carryText}</strong>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AllUserTokens;