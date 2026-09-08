import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  TablePagination,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getPaymentHistoryAction } from "../../../../Actions/Auth/paymentHistoryAction";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../../fonts/NotoSans-Regular";

const PaymentHistoryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { data, loading, error } = useSelector(
    (state: RootState) => state.paymentHistoryReducer
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // ⭐ Selection State

  useEffect(() => {
    dispatch(getPaymentHistoryAction());
  }, [dispatch]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const historyList = Array.isArray(data) ? data : data?.data || [];
  
  const filteredHistory = historyList.filter((item: any) => {
    const query = search.toLowerCase();
    const customer = item.details?.confirmedTokens?.[0]?.customerName?.toLowerCase() || "";
    return (
      item.userName?.toLowerCase().includes(query) ||
      customer.includes(query) ||
      item.adminName?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.amount?.toString().includes(query)
    );
  });

  // ================= DOUBLE CLICK SELECT =================
  const handleDoubleClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  /** 📝 HELPER: Render Detailed Bill (For UI) */
  const renderDetails = (item: any) => {
    if (item.type === "add_balance") {
      return (
        <Box sx={{ p: 1.5, backgroundColor: "#f1f8e9", borderLeft: "4px solid #4caf50", borderRadius: 1.5 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            <b>Mode:</b> {item.details?.paymentMode || "N/A"}
          </Typography>
          {item.details?.referenceNumber && (
            <Typography variant="caption" display="block" color="text.secondary">
              <b>Ref:</b> {item.details.referenceNumber}
            </Typography>
          )}
          <Typography variant="caption" display="block" mt={0.5} fontWeight={600} color="text.primary">
            Flyash: ₹{item.details?.flyashAmount || 0} | Bedash: ₹{item.details?.bedashAmount || 0}
          </Typography>
        </Box>
      );
    } else if (item.type === "token_payment") {
      const tokens = item.details?.confirmedTokens || [];
      return (
        <Box display="flex" flexDirection="column" gap={1}>
          {tokens.map((t: any, index: number) => (
            <Box 
              key={index} 
              sx={{ 
                borderLeft: t.dueNow > 0 ? "4px solid #ed6c02" : "4px solid #2e7d32", 
                pl: 1.5, 
                py: 1,
                backgroundColor: "#f8f9fa",
                borderRadius: 1.5,
                border: "1px solid #e0e0e0"
              }}
            >
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {t.customerName || "N/A"} <span style={{ color: "gray", fontSize: "11px", fontWeight: 400 }}>(Token #{t.tokenId})</span>
              </Typography>
              
              <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: "capitalize", my: 0.3 }}>
                <b>User:</b> {t.userName} | <b>Truck:</b> {t.truckNumber || "N/A"} | <b>Material:</b> {t.materialType || "N/A"}
              </Typography>
              
              <Typography variant="caption" display="block">
                Bill: {t.weight}T × ₹{t.ratePerTon} + ₹{t.commission} = <b>₹{t.totalAmount}</b>
              </Typography>
              
              <Typography variant="caption" display="block" mt={0.5}>
                Paid: <span style={{ color: "#2e7d32", fontWeight: "bold" }}>₹{t.paidThisTime}</span>
                
                {t.dueNow > 0 ? (
                  <span style={{ color: "#d32f2f", marginLeft: 6 }}>
                    <b>| Due: -₹{t.dueNow}</b>
                  </span>
                ) : (
                  <span style={{ color: "#2e7d32", marginLeft: 6, backgroundColor: "#e8f5e9", padding: "1px 5px", borderRadius: "4px" }}>
                    <b>✔️ Cleared</b>
                  </span>
                )}
              </Typography>
            </Box>
          ))}
          
          {item.details?.advanceLeft > 0 && (
            <Typography variant="caption" color="success.main" fontWeight="bold">
              Advance Left (Ledger): ₹{item.details.advanceLeft}
            </Typography>
          )}
        </Box>
      );
    }
    return "-";
  };

  /** 📝 HELPER: Convert Details to String (For PDF) */
  const getDetailsTextForPDF = (item: any) => {
    if (item.type === "add_balance") {
      return `Mode: ${item.details?.paymentMode || "N/A"}\nRef: ${item.details?.referenceNumber || "N/A"}\nFlyash: Rs ${item.details?.flyashAmount || 0} | Bedash: Rs ${item.details?.bedashAmount || 0}`;
    } else if (item.type === "token_payment") {
      const tokens = item.details?.confirmedTokens || [];
      // ⭐ Updated PDF details to show Truck, Material, Weight, and full Bill Calculation
      const txt = tokens.map((t: any) => 
        `Token #${t.tokenId} | ${t.customerName}\n` +
        `Truck: ${t.truckNumber || "N/A"} | Mat: ${t.materialType || "N/A"} | Wt: ${t.weight} T\n` +
        `Bill: ${t.weight}T x Rs ${t.ratePerTon} + Comm Rs ${t.commission} = Total Rs ${t.totalAmount}\n` +
        `Paid: Rs ${t.paidThisTime} | Due: Rs ${t.dueNow}`
      ).join("\n----------------------------\n");
      
      const adv = item.details?.advanceLeft > 0 ? `\n\nAdvance Left: Rs ${item.details.advanceLeft}` : "";
      return txt + adv;
    }
    return "-";
  };

  const shortDateForPDF = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) + 
           " " + 
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // ================= PDF GENERATION =================
  const handleDownloadPDF = () => {
    const selectedRows = filteredHistory.filter((item: any) =>
      selectedIds.includes(item.id)
    );

    if (!selectedRows.length) {
      alert("Please select rows first by double-clicking on them.");
      return;
    }

    const doc = new jsPDF("landscape");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 32, 39);
    doc.text("Payment History Report", 14, 15);

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
        0: { halign: "center", cellWidth: 15 },   // ID
        1: { halign: "center", cellWidth: 35 },   // Date
        2: { halign: "center", cellWidth: 30 },   // Type
        3: { halign: "right", cellWidth: 25 },    // Total Pay
        4: { halign: "left", cellWidth: 40 },     // User/Customer
        5: { halign: "center", cellWidth: 25 },   // Admin
        6: { halign: "left" },                    // Details (Takes remaining space)
      },
      head: [
        [
          "ID",
          "Date & Time",
          "Type",
          "Total Pay",
          "User / Customer",
          "Admin",
          "Calculations & Details",
        ],
      ],
      body: selectedRows.map((item: any) => [
        `#${item.id}`,
        shortDateForPDF(item.date),
        item.type === "add_balance" ? "Balance Added" : "Token Payment",
        `Rs ${Number(item.amount || 0).toLocaleString("en-IN")}`,
        item.type === "token_payment" && item.details?.confirmedTokens?.length > 0 
          ? item.details.confirmedTokens[0].customerName 
          : item.userName,
        item.adminName || "-",
        getDetailsTextForPDF(item) // ⭐ This uses our updated helper
      ]),
      didDrawPage: function (data: any) {
        const str = "Page " + data.pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      },
    });

    doc.save(`Payment-History-${new Date().getTime()}.pdf`);
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
    <Paper 
      elevation={4} 
      sx={{ 
        p: { xs: 1, sm: 3 }, 
        borderRadius: 4, 
        background: "#ffffff", 
        width: "100%",
        minHeight: "80vh"
      }}
    >
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
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <HistoryIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: "#f48fb1" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
              Payment History
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Records: <strong>{filteredHistory.length}</strong> • <span style={{ color: "#ffeb3b" }}>Double tap row to select for PDF</span>
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
          <TextField
            placeholder="Search history..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
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
              width: { xs: "100%", sm: "280px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              }
            }}
          />

          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            disabled={!selectedIds.length}
            onClick={handleDownloadPDF}
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
        sx={{ 
          borderRadius: 3, 
          border: "1px solid #e0e0e0", 
          backgroundColor: "white", 
          maxHeight: "65vh",
          overflowX: "auto" 
        }}
      >
        <Table stickyHeader size="medium" sx={{ minWidth: 1000 }}> 
          <TableHead>
            <TableRow>
              {[
                { label: "ID", align: "left" },
                { label: "Date & Time", align: "left" },
                { label: "Type", align: "center" },
                { label: "Total Pay", align: "right" },
                { label: "User / Customer", align: "left" },
                { label: "Admin", align: "center" },
                { label: "Calculations & Details", align: "left" },
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
            {filteredHistory.length ? (
              filteredHistory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item: any) => {
                  const selected = selectedIds.includes(item.id);

                  return (
                    <TableRow 
                      key={item.id} 
                      hover 
                      onDoubleClick={() => handleDoubleClick(item.id)} // ⭐ Selection Logic
                      sx={{ 
                        cursor: "pointer",
                        backgroundColor: selected ? "#e3f2fd !important" : "inherit",
                        "&:hover": { backgroundColor: selected ? "#bbdefb !important" : "#f9fafb" }, 
                        "& td": { borderBottom: "1px solid #f0f0f0" } 
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>#{item.id}</TableCell>
                      
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {(() => {
                          if (!item.date) return "N/A";
                          const d = new Date(item.date);
                          d.setHours(d.getHours() + 5);
                          d.setMinutes(d.getMinutes() + 30);
                          return d.toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: true,
                          });
                        })()}
                      </TableCell>

                      <TableCell align="center">
                        <Chip 
                          label={item.type === "add_balance" ? "Balance Added" : "Token Payment"} 
                          color={item.type === "add_balance" ? "success" : "info"} 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 700, color: item.type === "add_balance" ? "success.main" : "info.main", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
                        + ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.type === "token_payment" && item.details?.confirmedTokens?.length > 0 ? (
                          <Box>
                            <Typography fontWeight="700" color="primary.main" variant="body2">
                              {item.details.confirmedTokens[0].customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Customer</Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography fontWeight="700" variant="body2">{item.userName}</Typography>
                            <Typography variant="caption" color="text.secondary">System User</Typography>
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <Chip label={item.adminName || "N/A"} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500 }} />
                      </TableCell>
                      
                      <TableCell sx={{ minWidth: "280px" }}>{renderDetails(item)}</TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No History Found</Typography>
                    <Typography variant="body2">Try adjusting your search query.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= PAGINATION ================= */}
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredHistory.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderBottom: "none" }}
        />
      </Box>
    </Paper>
  );
};

export default PaymentHistoryPage;