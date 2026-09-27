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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
    const customer = item.details?.confirmedTokens?.[0]?.customerName?.toLowerCase() || item.details?.entityName?.toLowerCase() || item.details?.customerName?.toLowerCase() || "";
    const reason = (item.details?.reason || "").toLowerCase();
    return (
      (item.userName || "").toLowerCase().includes(query) ||
      customer.includes(query) ||
      reason.includes(query) ||
      (item.adminName || "").toLowerCase().includes(query) ||
      (item.type || "").toLowerCase().includes(query) ||
      (item.amount || "").toString().includes(query)
    );
  });

  const handleDoubleClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  /** 📝 HELPER: Render Detailed Bill */
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
    } 
    
    // ⭐ SINGLE TOKEN PAYMENT RECOVERY (Timeline & Rich Details)
    if (item.details?.isSingleTokenRecord || item.details?.paymentTimeline) {
      const d = item.details;
      const timeline = d.paymentTimeline || [];
      const isConfirmed = item.type === "Token Confirmed" || d.status === "Token Confirmed" || d.status === "completed";
      const isBedash = (d.material || d.materialType || "").toLowerCase() === "bedash";

      const titleName = d.entityName && d.entityType ? `${d.entityName} (${d.entityType})` : (d.customerName || item.userName || "N/A");

      return (
        <Box sx={{ p: 1.5, backgroundColor: isConfirmed ? "#f1f8e9" : "#fff8e1", borderLeft: isConfirmed ? "4px solid #2e7d32" : "4px solid #ed6c02", borderRadius: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {titleName} <span style={{ color: "gray", fontSize: "11px", fontWeight: 400 }}>(Token #{d.tokenId})</span>
            </Typography>
            <Chip 
              label={isConfirmed ? "Confirmed" : "Updated"} 
              size="small" 
              color={isConfirmed ? "success" : "warning"} 
              sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }} 
            />
          </Box>

          {/* ⭐ GLOBAL REASON: Agar pehle ka koi akela reason bacha ho */}
          {d.reason && (!timeline.length || !timeline[0].reason) && (
            <Box sx={{ mt: 0.5, mb: 0.5, px: 1, py: 0.5, backgroundColor: "#fff8e1", borderLeft: "3px solid #ffb300", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                📝 <b>Global Reason:</b> {d.reason}
              </Typography>
            </Box>
          )}

          <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: "capitalize", mt: 0.5 }}>
            <b>Truck:</b> {d.truckNumber || "N/A"} | <b>Material:</b> <span style={{color: isBedash ? '#ed6c02' : 'inherit', fontWeight: 600}}>{d.material || "N/A"}</span>
          </Typography>

          <Box sx={{ p: 1, bgcolor: "#e3f2fd", borderRadius: 1, border: "1px dashed #90caf9" }}>
            <Typography variant="caption" display="block" fontWeight={700} color="#1565c0" mb={0.5}>
              🧮 Bill Calculation Details:
            </Typography>
            {isBedash ? (
              <>
                {d.customerName && (
                  <Typography variant="caption" display="block">
                    Cu ({d.customerName}): {d.weight || 0}T × ₹{d.sellRate || 0} = <b>₹{d.totalAmount || 0}</b>
                  </Typography>
                )}
                {d.cartingOwnerName && (
                  <Typography variant="caption" display="block">
                    Ca ({d.cartingOwnerName}): {d.weight || 0}T × ₹{d.cartingRate || 0} = <b>₹{d.totalCarting || 0}</b>
                  </Typography>
                )}
                {d.anotherTokenOwnerName && (
                  <Typography variant="caption" display="block">
                    Ow ({d.anotherTokenOwnerName}): {d.weight || 0}T × ₹{d.tokenOwnerRate || 0} = <b>₹{d.totalTokenOwnerAmount || 0}</b>
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="caption" display="block">
                Bill: {d.weight || 0}T × ₹{d.ratePerTon || 0} + ₹{d.commission || 0} = <b>₹{d.totalAmount || 0}</b>
              </Typography>
            )}
          </Box>

          {/* ⭐ TIMELINE RENDERER WITH ADVANCE BREAKDOWN & INDIVIDUAL REASONS */}
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" display="block" fontWeight={700} color="text.secondary" mb={0.5}>
              ⏳ Payment Timeline:
            </Typography>
            {timeline.map((t: any, idx: number) => {
              const isNegative = t.amount < 0;
              const absoluteAmount = Math.abs(Number(t.amount || 0));
              const actionLabel = isNegative ? "Adjusted/Deducted" : "Ledger Entry (+)";
              const color = isNegative ? "#d32f2f" : "#2e7d32";
              const sign = isNegative ? "-" : ""; 

              const advanceLeft = Number(t.advanceLeft || 0);
              const remainingDue = Number(t.remainingDue || 0);
              const billAmount = Number(t.billAmount || 0);
              
              let breakdownText = "";
              if (t.stakeholder?.includes("Auto-Paid from Advance") && billAmount > 0) {
                  breakdownText = `(Bill Paid: ₹${billAmount.toLocaleString("en-IN")})`;
              } else if (advanceLeft > 0 && absoluteAmount > advanceLeft && !isNegative) {
                  const usedForBill = absoluteAmount - advanceLeft;
                  breakdownText = `(Bill Paid: ₹${usedForBill.toLocaleString("en-IN")})`;
              }

              return (
                <Box key={idx} sx={{ borderBottom: "1px dashed #cfd8dc", pb: 0.5, mb: 0.5 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      <b>{t.stakeholder}</b> <br/><span style={{fontSize: "0.65rem"}}>{t.date}</span>
                    </Typography>
                    <Typography variant="caption" textAlign="right">
                      <span style={{ color: color, fontWeight: "bold" }}>
                        {actionLabel}: {sign}₹{absoluteAmount.toLocaleString("en-IN")}
                      </span>
                      {breakdownText && <><br/><span style={{ color: "#757575", fontSize: "0.65rem", fontWeight: 600 }}>{breakdownText}</span></>}
                      <br/>
                      {remainingDue > 0 ? (
                        <span style={{ color: "#d32f2f", fontWeight: 600 }}>Pending Due: ₹{remainingDue.toLocaleString("en-IN")}</span>
                      ) : advanceLeft > 0 ? (
                        <span style={{ color: "#0288d1", fontWeight: 600 }}>Advance Carry Fwd: ₹{advanceLeft.toLocaleString("en-IN")}</span>
                      ) : (
                        <span style={{ color: "#2e7d32", fontWeight: 600 }}>Pending Due: ₹0</span>
                      )}
                    </Typography>
                  </Box>
                  
                  {/* ⭐ NAYA HISSA: Har entry ka Apna Reason yahan dikhega */}
                  {t.reason && (
                    <Box sx={{ mt: 0.5, pl: 1, borderLeft: "2px solid #ffb300" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        📝 Reason: {t.reason}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    }

    // 3. PURANA REGULAR TOKEN CONFIRM PAYMENT (Fallback)
    else if (item.type === "token_payment" && !item.details?.isSingleTokenRecord) {
      const tokens = item.details?.confirmedTokens || [];
      return (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {item.details?.reason && (
            <Box sx={{ px: 1, py: 0.5, backgroundColor: "#fff8e1", borderLeft: "3px solid #ffb300", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                📝 <b>Reason / Note:</b> {item.details.reason}
              </Typography>
            </Box>
          )}

          {tokens.map((t: any, index: number) => (
            <Box 
              key={index} 
              sx={{ 
                borderLeft: t.dueNow > 0 ? "4px solid #ed6c02" : "4px solid #2e7d32", 
                pl: 1.5, py: 1, pr: 1, backgroundColor: "#f8f9fa", borderRadius: 1.5, border: "1px solid #e0e0e0" 
              }}
            >
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {t.customerName || "N/A"} <span style={{ color: "gray", fontSize: "11px", fontWeight: 400 }}>(Token #{t.tokenId})</span>
              </Typography>
              
              <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: "capitalize", my: 0.3 }}>
                <b>User:</b> {t.userName} | <b>Truck:</b> {t.truckNumber || "N/A"} | <b>Material:</b> {t.materialType || "N/A"}
              </Typography>
              
              <Typography variant="caption" display="block">
                Bill: {t.weight}T × ₹{t.ratePerTon} = <b>₹{t.totalAmount}</b>
              </Typography>
              <Typography variant="caption" display="block" mt={0.5}>
                Paid: <span style={{ color: "#2e7d32", fontWeight: "bold" }}>₹{t.paidThisTime}</span>
                {t.dueNow > 0 ? (
                  <span style={{ color: "#d32f2f", marginLeft: 6 }}><b>| Due: -₹{t.dueNow}</b></span>
                ) : (
                  <span style={{ color: "#2e7d32", marginLeft: 6 }}><b>✔️ Cleared</b></span>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return "-";
  };

  /** 📝 HELPER: Convert Details to String (For Professional PDF Export) */
  const getDetailsTextForPDF = (item: any) => {
    if (item.type === "add_balance") {
      return `Mode: ${item.details?.paymentMode || "N/A"}\nRef: ${item.details?.referenceNumber || "N/A"}\nFlyash: Rs ${item.details?.flyashAmount || 0} | Bedash: Rs ${item.details?.bedashAmount || 0}`;
    } 
    
    // ⭐ PROFESSIONAL PDF LOGIC FOR TIMELINE
    if (item.details?.isSingleTokenRecord || item.details?.paymentTimeline) {
      let str = `Token #${item.details.tokenId} | Mat: ${item.details.material} | Truck: ${item.details.truckNumber}\n`;
      if (item.details.reason && (!item.details.paymentTimeline || !item.details.paymentTimeline.some((t:any) => t.reason))) {
        str += `Reason: ${item.details.reason}\n`;
      }
      
      str += `--------- TIMELINE ---------\n`;
      (item.details.paymentTimeline || []).forEach((t: any) => {
        const isNeg = t.amount < 0;
        const absAmount = Math.abs(Number(t.amount || 0));
        const actionText = isNeg ? "Deducted/Adjusted" : "Ledger Entry (+)";
        
        const advanceLeft = Number(t.advanceLeft || 0);
        const remainingDue = Number(t.remainingDue || 0);
        const billAmount = Number(t.billAmount || 0);
        
        let usedText = "";
        if (t.stakeholder?.includes("Auto-Paid from Advance") && billAmount > 0) {
            usedText = ` | (Bill Paid: Rs ${billAmount.toLocaleString("en-IN")})`;
        } else if (advanceLeft > 0 && absAmount > advanceLeft && !isNeg) {
          usedText = ` | (Bill Paid: Rs ${absAmount - advanceLeft})`;
        }

        let statusStr = `Pending Due: Rs ${remainingDue}`;
        if (advanceLeft > 0) {
          statusStr = `Advance Carry Fwd: Rs ${advanceLeft}`;
        }

        str += `📅 [${t.date}] - ${t.stakeholder}\n`;
        str += `   -> ${actionText}: Rs ${absAmount.toLocaleString("en-IN")}${usedText} | ${statusStr}\n`;
        // ⭐ PDF ME BHI INDIVIDUAL REASON
        if (t.reason) {
          str += `   📝 Reason: ${t.reason}\n`;
        }
      });
      return str;
    }

    if (item.type === "token_payment" && !item.details?.isSingleTokenRecord) {
      const tokens = item.details?.confirmedTokens || [];
      let txt = "";
      if (item.details?.reason) txt += `Reason: ${item.details.reason}\n\n`;

      txt += tokens.map((t: any) => {
        let textStr = `Token #${t.tokenId} | Customer: ${t.customerName}\n` +
                      `Truck: ${t.truckNumber || "N/A"} | Mat: ${t.materialType} | Wt: ${t.weight} T\n`;
        textStr += `Bill: Total Rs ${t.totalAmount}\n` +
                   `Paid: Rs ${t.paidThisTime} | Due: Rs ${t.dueNow}`;
        return textStr;
      }).join("\n---\n");
      return txt;
    }
    return "-";
  };

  const shortDateForPDF = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) + 
           " " + 
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

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
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: [20, 48, 59], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "center", cellWidth: 35 },
        2: { halign: "center", cellWidth: 30 },
        3: { halign: "right", cellWidth: 25 },
        4: { halign: "left", cellWidth: 40 },
        5: { halign: "center", cellWidth: 25 },
        6: { halign: "left" },
      },
      head: [["ID", "Date & Time", "Type", "Total Pay", "User / Dealer", "Admin", "Detailed Breakdown"]],
      body: selectedRows.map((item: any) => {
        let typeStr = item.type;
        if(item.details?.isSingleTokenRecord) typeStr = item.details.status || "Token Updated";
        else if(item.details?.category === "RECOVERY_PAYMENT") typeStr = "Recovery Settlement";
        else if(item.type === "add_balance") typeStr = "Balance Added";
        else if(item.type === "token_payment") typeStr = "Token Payment";

        const userDisplay = item.details?.entityName && item.details?.entityType
          ? `${item.details.entityName} (${item.details.entityType})`
          : item.details?.customerName || (item.details?.confirmedTokens?.length > 0 ? item.details.confirmedTokens[0].customerName : item.userName || "-");

        let pdfAmountStr = "";
        if (item.details?.isSingleTokenRecord) {
          if (item.details?.entityType === "Customer") {
            pdfAmountStr = `Rs ${Number(item.amount || 0).toLocaleString("en-IN")}`;
          } else {
            pdfAmountStr = `Rs ${Number(item.amount || 0).toLocaleString("en-IN")}`; 
          }
        } else if (item.details?.confirmedTokens?.length > 0) {
          const customerPaid = item.details.confirmedTokens.reduce((sum: number, t: any) => sum + Number(t.paidThisTime || 0), 0);
          pdfAmountStr = `Rs ${customerPaid.toLocaleString("en-IN")}`;
        } else {
          pdfAmountStr = `Rs ${Number(item.amount || 0).toLocaleString("en-IN")}`;
        }

        return [
          `#${item.id}`,
          shortDateForPDF(item.date),
          typeStr,
          pdfAmountStr,
          userDisplay,
          item.adminName || "-",
          getDetailsTextForPDF(item)
        ];
      }),
      didDrawPage: function (data: any) {
        const str = "Page " + data.pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageSize = doc.internal.pageSize;
        doc.text(str, data.settings.margin.left, pageSize.getHeight() - 10);
      },
    });

    doc.save(`Payment-History-${new Date().getTime()}.pdf`);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={50} thickness={4} /></Box>;
  if (error) return <Typography color="error" align="center" variant="h6" sx={{ mt: 5 }}>{error}</Typography>;

  return (
    <Paper elevation={4} sx={{ p: { xs: 1, sm: 3 }, borderRadius: 4, background: "#ffffff", width: "100%", minHeight: "80vh" }}>
      <Box sx={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", color: "white", borderRadius: 3, px: { xs: 2, sm: 3 }, py: 2.5, mb: 3, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <HistoryIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: "#f48fb1" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>Payment History</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Records: <strong>{filteredHistory.length}</strong> • <span style={{ color: "#ffeb3b" }}>Double tap row to select for PDF</span></Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
          <TextField
            placeholder="Search history..." variant="outlined" size="small" value={search} onChange={handleSearchChange}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "gray" }} /></InputAdornment>) }}
            sx={{ backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: "280px" }, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "transparent" } } }}
          />
          <Button
            variant="contained" startIcon={<PictureAsPdfIcon />} disabled={!selectedIds.length} onClick={handleDownloadPDF} fullWidth={window.innerWidth < 600}
            sx={{ backgroundColor: "#ffeb3b", color: "#000", fontWeight: 700, borderRadius: 2, px: 3, textTransform: "none", "&:hover": { backgroundColor: "#fbc02d" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0" } }}
          >
            Download PDF ({selectedIds.length})
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 3, border: "1px solid #e0e0e0", backgroundColor: "white", maxHeight: "65vh", overflowX: "auto" }}>
        <Table stickyHeader size="medium" sx={{ minWidth: 1000 }}> 
          <TableHead>
            <TableRow>
              {["ID", "Date & Time", "Type", "Total Pay", "User / Dealer", "Admin", "Detailed Stakeholder Calculations & Carry"].map((col) => (
                <TableCell key={col} sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory.length ? (
              filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item: any) => {
                const selected = selectedIds.includes(item.id);
                
                let chipColor: any = "info";
                let chipLabel = item.type;
                if(item.type === "Token Confirmed" || item.details?.status === "Token Confirmed") { chipLabel = "Token Confirmed"; chipColor = "success"; }
                else if (item.type === "Token Updated" || item.details?.status === "Token Updated") { chipLabel = "Token Updated"; chipColor = "warning"; }
                else if (item.details?.category === "RECOVERY_PAYMENT") { chipLabel = "Recovery Paid"; chipColor = "primary"; }
                else if (item.type === "add_balance") { chipLabel = "Balance Added"; chipColor = "success"; }

                const userDisplay = item.details?.entityName && item.details?.entityType
                  ? `${item.details.entityName} (${item.details.entityType})`
                  : item.details?.customerName || (item.details?.confirmedTokens?.length > 0 ? item.details.confirmedTokens[0].customerName : item.userName || "N/A");

                return (
                  <TableRow 
                    key={item.id} hover onDoubleClick={() => handleDoubleClick(item.id)}
                    sx={{ cursor: "pointer", backgroundColor: selected ? "#e3f2fd !important" : "inherit", "&:hover": { backgroundColor: selected ? "#bbdefb !important" : "#f9fafb" }, "& td": { borderBottom: "1px solid #f0f0f0" } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>#{item.id}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {item.date ? new Date(item.date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={chipLabel} 
                        color={chipColor} 
                        size="small" 
                        sx={{ fontWeight: 600 }} 
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: item.amount < 0 ? "error.main" : "success.main", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
                      {(() => {
                        if (item.details?.isSingleTokenRecord) {
                          if (item.details?.entityType === "Customer") {
                            return `+ ₹${Number(item.amount || 0).toLocaleString("en-IN")}`;
                          } else {
                            return `₹0`;
                          }
                        }
                        else if (item.details?.confirmedTokens?.length > 0) {
                          const customerPaid = item.details.confirmedTokens.reduce((sum: number, t: any) => sum + Number(t.paidThisTime || 0), 0);
                          return `+ ₹${customerPaid.toLocaleString("en-IN")}`;
                        }
                        return `${item.amount > 0 ? "+" : ""} ₹${Number(item.amount || 0).toLocaleString("en-IN")}`;
                      })()}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography fontWeight="700" color="primary.main" variant="body2">
                        {userDisplay}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Chip label={item.adminName || "N/A"} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500 }} />
                    </TableCell>
                    <TableCell sx={{ minWidth: "320px" }}>{renderDetails(item)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography variant="h6" color="text.secondary">No History Found</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" mt={1}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={filteredHistory.length}
          page={page} rowsPerPage={rowsPerPage} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderBottom: "none" }}
        />
      </Box>
    </Paper>
  );
};

export default PaymentHistoryPage;