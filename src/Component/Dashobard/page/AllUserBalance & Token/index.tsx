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
  TableContainer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getAdminTokensAction } from "../../../../Actions/Auth/TokenAction";
import { AdminToken } from "../../../../ActionType/UserTokenTypes";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Agar aapke paas font file nahi hai toh aap ise comment kar sakte hain
import "../../../../fonts/NotoSans-Regular"; 

const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

const AllUserToken: React.FC = () => {
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

  const toNumber = (v: string | number | null | undefined) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const getPossibleTokens = (userId: number, remaining: string | number | null) => {
    const totalRemaining = toNumber(remaining);
    if (totalRemaining <= 0) return 0;

    const pendingCount = tokens.filter(
      (t) => t.userId === userId && t.status === "pending",
    ).length;

    const adjustedRemaining = totalRemaining - pendingCount * 27;
    if (adjustedRemaining <= 0) return 0;

    return Math.floor(adjustedRemaining / 27);
  };

  const getCustomerNegativeTotal = (customerName: string) => {
    const negativeTokens = tokens.filter(
      (t) => t.customerName === customerName && Number(t.carryForward) < 0
    );

    if (negativeTokens.length === 0) return 0;
    const minCarry = Math.min(...negativeTokens.map((t) => Number(t.carryForward)));
    return Math.abs(minCarry);
  };

  const getCustomerActiveTokenCount = (customerName: string) => {
    return tokens.filter(
      (t) => t.customerName === customerName && (t.status === "pending" || t.status === "updated"),
    ).length;
  };

  const isLowStock = (remaining: string | number | null) => toNumber(remaining) < 27;

  const getStatusColor = (status: string | null | undefined) => {
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
      (t.customerName || "").toLowerCase().includes(q) ||
      (t.userName || "").toLowerCase().includes(q) ||
      (t.truckNumber || "").toLowerCase().includes(q) ||
      (t.materialType || "").toLowerCase().includes(q) ||
      (t.status || "").toLowerCase().includes(q) ||
      (t.cartingOwnerName || "").toLowerCase().includes(q) ||
      (t.anotherTokenOwnerName || "").toLowerCase().includes(q)
    );
  });

  // ================= DOUBLE CLICK SELECT =================
  const handleDoubleClick = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]);
  };

  const handleMouseDown = (id: number) => setIsDragging(true);

  const handleMouseEnter = (id: number) => {
    if (!isDragging) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMouseUp = () => setIsDragging(false);

  // ================= TIMER =================
  const getRemainingTime = (confirmedAt: string | null | undefined) => {
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
      carryText: negativeTotal > 0 ? `- ₹${negativeTotal} baki hai` : "+ No pending balance",
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleLeaveHover = () => setHoverInfo(null);

  /* ================= HELPERS ================= */
  const formatCur = (val: string | number | null | undefined) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  const shortDateForPDF = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + " " + 
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // ================= PDF EXPORT WITH BEDASH DATA =================
  const handleDownloadPDF = () => {
    const selected = filteredTokens.filter((t) => selectedIds.includes(t.tokenId));
    if (!selected.length) { alert("Select at least one row"); return; }

    const doc = new jsPDF("landscape");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("All User Tokens Report", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 22);
    doc.text(`Total Records: ${selected.length}`, 14, 27);

    autoTable(doc, {
      startY: 32,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: [20, 48, 59], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      columnStyles: {
        0: { halign: "left" }, 1: { halign: "left" }, 2: { halign: "center" }, 3: { halign: "center" },
        4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" }, 7: { halign: "right" },
        8: { halign: "right" }, 9: { halign: "center" }, 10: { halign: "center" },
      },
      // ⭐ Updated Head for PDF
      head: [["User", "Stakeholders (Cu/Ca/Ow)", "Truck", "Mat", "Weight", "Rates", "Totals", "Carry", "Rem", "Status", "Dates"]],
      body: selected.map((t) => {
        const isBedash = (t.materialType || "").toLowerCase() === "bedash";
        const isAnother = (t.tokenOwnerType || "").toLowerCase() === "another";

        // ⭐ Stakeholders Formatting for PDF
        let stakeholdersStr = t.customerName || "N/A";
        if (isBedash) {
          if (t.cartingOwnerName) stakeholdersStr += `\nCa: ${t.cartingOwnerName}`;
          if (isAnother && t.anotherTokenOwnerName) stakeholdersStr += `\nOw: ${t.anotherTokenOwnerName}`;
        }

        let ratesStr = `Cu: ${Number(isBedash ? t.sellRate : t.ratePerTon)}`;
        let totalsStr = `Bill: ${Number(t.totalAmount)}\nComm: ${Number(t.commission)}`;
        let carryStr = `Cu: ${Number(t.carryForward)}`;

        if (isBedash) {
          ratesStr += `\nCa: ${Number(t.cartingRate)}`;
          totalsStr += `\nCart: ${Number(t.totalCarting)}`;
          carryStr += `\nCa: ${Number(t.cartingCarryForward)}`;
          if (isAnother) {
            ratesStr += `\nOw: ${Number(t.tokenOwnerRate)}`;
            totalsStr += `\nOwn: ${Number(t.totalTokenOwnerAmount)}`;
            carryStr += `\nOw: ${Number(t.tokenOwnerCarryForward)}`;
          }
        }

        const datesStr = `Cr: ${shortDateForPDF(t.createdAt)}\nCo: ${shortDateForPDF(t.confirmedAt)}`;

        return [
          t.userName, stakeholdersStr, t.truckNumber || "-", (t.materialType || "").toUpperCase(),
          `${t.weight} T`, ratesStr, totalsStr, carryStr, `${t.remainingTons} T`,
          (t.status || "").toUpperCase(), datesStr
        ];
      }),
      didDrawPage: function (data: any) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageSize = doc.internal.pageSize;
        doc.text("Page " + data.pageNumber, data.settings.margin.left, pageSize.getHeight() - 10);
      },
    });

    doc.save(`Token-Report-${new Date().getTime()}.pdf`);
  };

  /* ================= LOADING & ERROR ================= */
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={50} thickness={4} /></Box>;
  if (error) return <Typography color="error" align="center" variant="h6" sx={{ mt: 5 }}>{error}</Typography>;

  // ================= UI =================
  return (
    <Box p={{ xs: 1, sm: 3 }} onMouseUp={handleMouseUp} sx={{ background: "#f8f9fa", minHeight: "85vh", borderRadius: 4 }}>
      {/* HEADER */}
      <Box sx={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", color: "white", borderRadius: 3, px: { xs: 2, sm: 3 }, py: 2.5, mb: 3, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <SupervisorAccountIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: "#81c784" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>All User Tokens Report</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Tokens: <strong>{totalTokens}</strong> • <span style={{ color: "#ffeb3b" }}>Double tap row to select for PDF</span></Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
          <TextField
            placeholder="Search tokens..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "gray" }} /></InputAdornment>) }}
            sx={{ backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: "260px" }, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "transparent" } } }}
          />
          <Button
            variant="contained" startIcon={<PictureAsPdfIcon />} disabled={!selectedIds.length} onClick={handleDownloadPDF} fullWidth={window.innerWidth < 600}
            sx={{ backgroundColor: "#ffeb3b", color: "#000", fontWeight: 700, borderRadius: 2, px: 3, "&:hover": { backgroundColor: "#fbc02d" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0" } }}
          >
            Download PDF ({selectedIds.length})
          </Button>
        </Box>
      </Box>

      {/* TABLE CONTAINER */}
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", maxHeight: "68vh", overflowX: "auto" }}>
        <Table stickyHeader size="medium" sx={{ minWidth: 1200 }}> 
          <TableHead>
            <TableRow>
              {["User", "Stakeholders (Cu/Ca/Ow)", "Truck", "Material", "Weight", "Rates (Cu/Ca/Ow)", "Totals", "Carry Fwd", "Remaining", "Timer", "Status", "Dates"].map((col) => (
                <TableCell key={col} sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTokens.length > 0 ? (
              filteredTokens.map((t) => {
                const selected = selectedIds.includes(t.tokenId);
                const low = isLowStock(t.remainingTons);
                
                const isBedash = (t.materialType || "").toLowerCase() === "bedash";
                const isAnother = (t.tokenOwnerType || "").toLowerCase() === "another";

                return (
                  <TableRow
                    key={t.tokenId} hover
                    onDoubleClick={() => handleDoubleClick(t.tokenId)}
                    onMouseDown={() => handleMouseDown(t.tokenId)}
                    onMouseEnter={(e) => { handleMouseEnter(t.tokenId); handleHover(t, e); }}
                    onMouseLeave={handleLeaveHover}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: selected ? "#e3f2fd !important" : low ? "#ffebee !important" : "inherit",
                      animation: !selected && low ? "blink 1.5s infinite" : "none",
                      "& td": { borderBottom: "1px solid #f0f0f0" },
                      "@keyframes blink": { "0%": { backgroundColor: "#ffebee" }, "50%": { backgroundColor: "#ffcdd2" }, "100%": { backgroundColor: "#ffebee" } },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2", whiteSpace: "nowrap" }}>{t.userName}</TableCell>
                    
                    {/* ⭐ STAKEHOLDERS (Customer + Carting + Owner) */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.customerName || "N/A"}</Typography>
                      {isBedash && (
                        <Box mt={0.5}>
                          {t.cartingOwnerName && (
                            <Typography variant="caption" display="block" color="error.main">
                              <b>Ca:</b> {t.cartingOwnerName}
                            </Typography>
                          )}
                          {isAnother && t.anotherTokenOwnerName && (
                            <Typography variant="caption" display="block" color="secondary.main">
                              <b>Ow:</b> {t.anotherTokenOwnerName}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell><Chip label={t.truckNumber || "N/A"} size="small" variant="outlined" sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell sx={{ textTransform: "capitalize", color: isBedash ? '#ed6c02' : '#757575', fontWeight: 500 }}>{t.materialType}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>{t.weight} T</TableCell>
                    
                    {/* 💰 Stacked Rates */}
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      <Typography variant="caption" display="block">Cu: <b>{formatCur(isBedash ? t.sellRate : t.ratePerTon)}</b></Typography>
                      {isBedash && (
                        <>
                          <Typography variant="caption" display="block" color="error.main">Ca: <b>{formatCur(t.cartingRate)}</b></Typography>
                          {isAnother && <Typography variant="caption" display="block" color="secondary.main">Ow: <b>{formatCur(t.tokenOwnerRate)}</b></Typography>}
                        </>
                      )}
                    </TableCell>

                    {/* 💰 Stacked Totals */}
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      <Typography variant="caption" display="block" color="success.main">Bill: <b>{formatCur(t.totalAmount)}</b></Typography>
                      {isBedash && (
                        <>
                          <Typography variant="caption" display="block" color="error.main">Cart: <b>{formatCur(t.totalCarting)}</b></Typography>
                          {isAnother && <Typography variant="caption" display="block" color="secondary.main">Own: <b>{formatCur(t.totalTokenOwnerAmount)}</b></Typography>}
                        </>
                      )}
                      <Typography variant="caption" display="block" color="primary.main">Comm: <b>{formatCur(t.commission)}</b></Typography>
                    </TableCell>

                    {/* 📊 Stacked Carry Forward */}
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      <Typography variant="caption" display="block" color={Number(t.carryForward) < 0 ? "error.main" : "text.secondary"}>
                        Cu: <b>{formatCur(t.carryForward)}</b>
                      </Typography>
                      {isBedash && (
                        <>
                          <Typography variant="caption" display="block" color="warning.main">
                            Ca: <b>+{formatCur(t.cartingCarryForward)}</b>
                          </Typography>
                          {isAnother && (
                            <Typography variant="caption" display="block" color="info.main">
                              Ow: <b>+{formatCur(t.tokenOwnerCarryForward)}</b>
                            </Typography>
                          )}
                        </>
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, color: low ? "#d32f2f" : "#2e7d32", whiteSpace: "nowrap" }}>{t.remainingTons} T</TableCell>
                    <TableCell align="center" sx={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {t.status === "completed" ? getRemainingTime(t.confirmedAt) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={t.status || "Unknown"} size="small" color={getStatusColor(t.status) as any} sx={{ textTransform: "capitalize", fontWeight: 600 }} />
                    </TableCell>
                    
                    <TableCell align="left" sx={{ whiteSpace: "nowrap" }}>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {t.createdAt && <Typography variant="caption" sx={{ display: "flex", gap: 1, color: "text.secondary" }}><span style={{ fontWeight: 700, minWidth: "20px" }}>Cr:</span> {formatDateTime(t.createdAt)}</Typography>}
                        {t.updatedAt && <Typography variant="caption" sx={{ display: "flex", gap: 1, color: "primary.main" }}><span style={{ fontWeight: 700, minWidth: "20px" }}>Up:</span> {formatDateTime(t.updatedAt)}</Typography>}
                        {t.confirmedAt && <Typography variant="caption" sx={{ display: "flex", gap: 1, color: "success.main" }}><span style={{ fontWeight: 700, minWidth: "20px" }}>Co:</span> {formatDateTime(t.confirmedAt)}</Typography>}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Tokens Found</Typography>
                    <Typography variant="body2">Try adjusting your search criteria.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= HOVER POPUP ================= */}
      {hoverInfo && (
        <Box sx={{ position: "fixed", top: hoverInfo.y + 15, left: hoverInfo.x + 15, background: "rgba(15, 32, 39, 0.95)", color: "#fff", p: 2, borderRadius: 2.5, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", zIndex: 9999, pointerEvents: "none", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)", minWidth: 260 }}>
          <Typography variant="caption" sx={{ color: "#81c784", fontWeight: 700, textTransform: "uppercase" }}>{hoverInfo.userName}</Typography>
          <Typography fontWeight={700} color="#ffb74d" variant="subtitle1" mb={1}>{hoverInfo.customerName}</Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="body2">Active Tokens: <strong>{hoverInfo.tokenCount}</strong></Typography>
            <Typography variant="body2">Possible tokens (27T): <strong style={{ color: "#64b5f6" }}>{hoverInfo.possible}</strong></Typography>
            <Typography variant="body2" sx={{ mt: 0.5, pt: 0.5, borderTop: "1px solid rgba(255,255,255,0.2)" }}>Carry Status: <strong style={{ color: hoverInfo.carryText.includes("baki") ? "#ef5350" : "#81c784" }}>{hoverInfo.carryText}</strong></Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AllUserToken;