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
  CircularProgress,
  InputAdornment,
  TableContainer,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../../store";
import { getAdminBalanceAction } from "../../../../Actions/Auth/balance";
import { AdminUserBalance } from "../../../../ActionType/balancetype.ts/balance";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../../fonts/NotoSans-Regular";

type SortField = "none" | "flyash" | "bedash";

const AllTransection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminBalanceReducer,
  );

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sortField, setSortField] = useState<SortField>("none");

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
    (u.transactions || [])
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

  /* ================= DATE SORT ================= */
  rows = rows.sort(
    (a, b) => new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime(),
  );

  /* ================= REMAINING SORT ================= */
  if (sortField !== "none") {
    rows = [...rows].sort((a, b) => {
      const aVal =
        sortField === "flyash"
          ? Number(a.user.flyash?.remaining ?? 0)
          : Number(a.user.bedash?.remaining ?? 0);

      const bVal =
        sortField === "flyash"
          ? Number(b.user.flyash?.remaining ?? 0)
          : Number(b.user.bedash?.remaining ?? 0);

      return bVal - aVal;
    });
  }

  const toggleSort = (field: SortField) => {
    setSortField(sortField === field ? "none" : field);
  };

  /* ================= CURRENT MONTH TOTAL ================= */
  const getCurrentMonthTotal = (user: AdminUserBalance) => {
    const now = new Date();
    return (user.transactions || [])
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);
  };

  /* ================= DOUBLE CLICK SELECT ================= */
  const handleDoubleClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  /* ================= DRAG SELECT (Optional Backup) ================= */
  const handleMouseDown = (id: number) => {
    setIsDragging(true);
  };

  const handleMouseEnterSelect = (id: number) => {
    if (!isDragging) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMouseUp = () => setIsDragging(false);

  /* ================= POPUP ================= */
  const handleRowHover = (user: AdminUserBalance, event: React.MouseEvent) => {
    const total = getCurrentMonthTotal(user);
    setPopup({
      userName: user.userName,
      total,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleLeave = () => setPopup(null);

  /* ================= FORMAT CURRENCY ================= */
  const formatCur = (val: string | number) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  const shortDateForPDF = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) + 
           " " + 
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  /* ================= PDF GENERATION ================= */
  const generatePDF = () => {
    const selectedRows = rows.filter((r) => selectedIds.includes(r.tx.id));

    if (!selectedRows.length) {
      alert("Please select rows");
      return;
    }

    const doc = new jsPDF("landscape"); // Landscape mode
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 32, 39);
    doc.text("Transaction Report", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 22);
    doc.text(`Total Selected Records: ${selectedRows.length}`, 14, 27);

    autoTable(doc, {
      startY: 32,
      theme: "grid",
      styles: { 
        fontSize: 8, 
        cellPadding: 3, 
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [20, 48, 59], 
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left" },    // User
        1: { halign: "center" },  // Date
        2: { halign: "right" },   // Flyash (Rs)
        3: { halign: "right" },   // Bedash (Rs)
        4: { halign: "right" },   // Total (Rs)
        5: { halign: "right" },   // Flyash (Tons)
        6: { halign: "right" },   // Bedash (Tons)
        7: { halign: "right" },   // Flyash Rem
        8: { halign: "right" },   // Bedash Rem
        9: { halign: "center" },  // Payment Status
      },
      head: [
        [
          "User",
          "Date & Time",
          "Flyash (Rs)",
          "Bedash (Rs)",
          "Total (Rs)",
          "Flyash (T)",
          "Bedash (T)",
          "Flyash Rem.",
          "Bedash Rem.",
          "Payment",
        ],
      ],
      body: selectedRows.map(({ user, tx }) => [
        user.userName,
        shortDateForPDF(tx.date),
        Number(tx.flyashAmount) > 0 ? Number(tx.flyashAmount).toLocaleString("en-IN") : "-",
        Number(tx.bedashAmount) > 0 ? Number(tx.bedashAmount).toLocaleString("en-IN") : "-",
        Number(tx.totalAmount).toLocaleString("en-IN"),
        Number(tx.flyashTons) > 0 ? `${tx.flyashTons}` : "-",
        Number(tx.bedashTons) > 0 ? `${tx.bedashTons}` : "-",
        `${Number(user.flyash?.remaining ?? 0).toFixed(2)}`,
        `${Number(user.bedash?.remaining ?? 0).toFixed(2)}`,
        tx.paymentMode.toUpperCase(),
      ]),
      didDrawPage: function (data: any) {
        // Page numbers
        const str = "Page " + data.pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      },
    });

    doc.save(`Transactions-Report-${new Date().getTime()}.pdf`);
  };

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

  /* ================= UI ================= */
  return (
    <Box p={{ xs: 1, sm: 3 }} onMouseUp={handleMouseUp} sx={{ background: "#f8f9fa", minHeight: "85vh", borderRadius: 4 }}>
      
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          borderRadius: 3,
          px: { xs: 2, sm: 3 },
          py: 2.5,
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <ReceiptLongIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: "#64b5f6" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
              All Transactions
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Total Records: <strong>{rows.length}</strong> • <span style={{ color: "#ffeb3b" }}>Double tap row to select for PDF</span>
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
          <TextField
            placeholder="Search transactions..."
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
            onClick={generatePDF}
            fullWidth={window.innerWidth < 600}
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
      <TableContainer
        component={Paper}
        elevation={4}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          maxHeight: "68vh",
          overflowX: "auto",
        }}
      >
        <Table stickyHeader size="medium" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              {[
                { label: "User", align: "left" },
                { label: "Date", align: "left" },
                { label: "Flyash ₹", align: "right" },
                { label: "Bedash ₹", align: "right" },
                { label: "Total ₹", align: "right" },
                { label: "Flyash Tons", align: "right" },
                { label: "Bedash Tons", align: "right" },
                { label: `Flyash Remaining ${sortField === "flyash" ? "🔽" : ""}`, align: "right", sortable: true, field: "flyash" },
                { label: `Bedash Remaining ${sortField === "bedash" ? "🔽" : ""}`, align: "right", sortable: true, field: "bedash" },
                { label: "Payment", align: "center" },
              ].map((col) => (
                <TableCell
                  key={col.label}
                  align={col.align as any}
                  onClick={col.sortable ? () => toggleSort(col.field as SortField) : undefined}
                  sx={{
                    backgroundColor: "#f4f6f8",
                    color: "#333",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none",
                    "&:hover": col.sortable ? { backgroundColor: "#e2e8f0" } : {}
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map(({ user, tx }) => {
                const selected = selectedIds.includes(tx.id);

                const flyashRemaining = Number(user.flyash?.remaining ?? 0);
                const bedashRemaining = Number(user.bedash?.remaining ?? 0);
                const used = Number(tx.flyashTons || 0);

                let light: "green" | "yellow" | "red" | "blue" | "none" = "none";

                if (flyashRemaining === 0) light = "blue";
                else if (flyashRemaining <= 27) light = "red";
                else if (flyashRemaining < used) light = "yellow";
                else if (flyashRemaining >= used) light = "green";

                const blink =
                  light === "green"
                    ? "greenBlink 2s ease-in-out infinite"
                    : light === "yellow"
                      ? "yellowBlink 2s ease-in-out infinite"
                      : light === "red"
                        ? "redBlink 2s ease-in-out infinite"
                        : light === "blue"
                          ? "blueBlink 2s ease-in-out infinite"
                          : "none";

                return (
                  <TableRow
                    key={tx.id}
                    hover
                    onDoubleClick={() => handleDoubleClick(tx.id)}
                    onMouseDown={() => handleMouseDown(tx.id)}
                    onMouseEnter={(e) => {
                      handleMouseEnterSelect(tx.id);
                      handleRowHover(user, e);
                    }}
                    onMouseLeave={handleLeave}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: selected ? "#e3f2fd !important" : "inherit",
                      animation: !selected ? blink : "none",
                      "& td": { borderBottom: "1px solid #f0f0f0" },

                      "@keyframes greenBlink": {
                        "0%": { backgroundColor: "#f1f8f4" },
                        "50%": { backgroundColor: "#d1e7dd" },
                        "100%": { backgroundColor: "#f1f8f4" },
                      },

                      "@keyframes yellowBlink": {
                        "0%": { backgroundColor: "#fffef5" },
                        "50%": { backgroundColor: "#fff3cd" },
                        "100%": { backgroundColor: "#fffef5" },
                      },

                      "@keyframes redBlink": {
                        "0%": { backgroundColor: "#fff5f5" },
                        "50%": { backgroundColor: "#f8d7da" },
                        "100%": { backgroundColor: "#fff5f5" },
                      },

                      "@keyframes blueBlink": {
                        "0%": { backgroundColor: "#f3f8fd" },
                        "50%": { backgroundColor: "#cff4fc" },
                        "100%": { backgroundColor: "#f3f8fd" },
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2", whiteSpace: "nowrap" }}>{user.userName}</TableCell>
                    <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {new Date(tx.date).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true
                      })}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{Number(tx.flyashAmount) > 0 ? formatCur(tx.flyashAmount) : "-"}</TableCell>
                    <TableCell align="right" sx={{ color: "#ed6c02", whiteSpace: "nowrap" }}>{Number(tx.bedashAmount) > 0 ? formatCur(tx.bedashAmount) : "-"}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#2e7d32", whiteSpace: "nowrap" }}>{formatCur(tx.totalAmount)}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{Number(tx.flyashTons) > 0 ? `${tx.flyashTons} T` : "-"}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{Number(tx.bedashTons) > 0 ? `${tx.bedashTons} T` : "-"}</TableCell>
                    
                    {/* ✅ Safe Remaining Display */}
                    <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{flyashRemaining.toFixed(3)} T</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#ed6c02", whiteSpace: "nowrap" }}>{bedashRemaining.toFixed(3)} T</TableCell>
                    
                    <TableCell align="center" sx={{ textTransform: "capitalize", fontWeight: 600, whiteSpace: "nowrap" }}>
                       <Chip 
                          label={tx.paymentMode} 
                          size="small" 
                          sx={{ 
                            fontWeight: 700, 
                            bgcolor: tx.paymentMode === 'online' ? '#e3f2fd' : '#f5f5f5',
                            color: tx.paymentMode === 'online' ? '#1565c0' : '#424242'
                          }} 
                        />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Transactions Found</Typography>
                    <Typography variant="body2">Try adjusting your search criteria.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= HOVER POPUP ================= */}
      {popup && (
        <Box
          sx={{
            position: "fixed",
            top: popup.y + 15,
            left: popup.x + 15,
            background: "rgba(15, 32, 39, 0.95)",
            color: "#fff",
            p: 2,
            borderRadius: 2.5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 9999,
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <Typography fontWeight={700} color="#ffb74d" mb={0.5}>{popup.userName}</Typography>
          <Typography variant="body2">
            This Month Total:{" "}
            <strong style={{ color: "#81c784" }}>₹{popup.total.toLocaleString("en-IN")}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AllTransection;