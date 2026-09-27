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
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PaidIcon from "@mui/icons-material/Paid";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { 
  getPaymentRecoveryAction,
  settlePaymentRecoveryAction 
} from "../../../../Actions/Auth/paymentHistoryAction";

/** ==============================================
 *  ROW COMPONENT (COLLAPSIBLE)
 *  ============================================== */
interface RecoveryRowProps {
  row: any;
  onOpenSettleModal: (row: any) => void;
}

const RecoveryRow: React.FC<RecoveryRowProps> = ({ row, onOpenSettleModal }) => {
  const [open, setOpen] = useState(false);

  const getTypeColor = (type: string) => {
    if (type === "Customer") return "primary";
    if (type === "Carting") return "error";
    return "secondary";
  };

  return (
    <React.Fragment>
      {/* 🟢 MAIN PARENT ROW */}
      <TableRow
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          backgroundColor: open ? "#f4f6f8" : "inherit",
          transition: "0.3s",
        }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography fontWeight="800" color="text.primary" variant="body1">
            {row.entityName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📞 {row.entityPhone || "N/A"}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={row.entityType} 
            size="small" 
            color={getTypeColor(row.entityType)} 
            sx={{ fontWeight: 700, borderRadius: 1 }} 
          />
        </TableCell>
        <TableCell>
          <Chip label={row.dealerName || "N/A"} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
        </TableCell>
        <TableCell align="right">
          <Typography fontWeight="800" color="error.main" variant="h6">
            ₹{Number(row.totalOverallDue || 0).toLocaleString("en-IN")}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            {/* 💰 ACTION BUTTON: Settle / Adjust */}
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<PaidIcon />}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
              onClick={() => onOpenSettleModal(row)}
            >
              Action / Paid
            </Button>

            {/* 🔔 REMIND BUTTON */}
            <Button
              variant="outlined"
              size="small"
              color="warning"
              startIcon={<NotificationsActiveIcon />}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
              onClick={() => alert(`Reminder feature coming soon for ${row.entityName}!`)}
            >
              Remind
            </Button>
          </Stack>
        </TableCell>
      </TableRow>

      {/* 🔴 COLLAPSED CHILD ROW (TOKEN DETAILS) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, border: "1px dashed #ccc", borderRadius: 2, backgroundColor: "#fafafa" }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={700} color="text.secondary">
                PENDING TOKENS BREAKDOWN FOR {row.entityName.toUpperCase()} ({row.entityType.toUpperCase()})
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Token #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Material & Truck</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Calculation Details</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">Amount Due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.tokens.map((token: any) => {
                    let calcText = "";
                    if (row.entityType === "Customer") {
                      const rate = token.materialType === "bedash" ? token.sellRate : token.ratePerTon;
                      calcText = `${token.weight || 0}T × ₹${rate || 0} ${Number(token.commission) > 0 ? `+ Comm: ₹${token.commission}` : ''}`;
                    } else if (row.entityType === "Carting") {
                      calcText = `${token.weight || 0}T × ₹${token.cartingRate || 0}`;
                    } else if (row.entityType === "Token Owner") {
                      calcText = `${token.weight || 0}T × ₹${token.tokenOwnerRate || 0}`;
                    }

                    return (
                      <TableRow key={token.tokenId}>
                        <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>#{token.tokenId}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                          {token.date ? new Date(token.date).toLocaleDateString("en-IN") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: "capitalize", fontWeight: 600, color: token.materialType === "bedash" ? "#ed6c02" : "inherit" }}>
                            {token.materialType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            🚛 {token.truckNumber || "Pending"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block" color="text.secondary" fontWeight={500}>
                            👤 <b>User:</b> {token.userName || "Unknown"}
                          </Typography>
                          <Typography variant="caption" display="block" fontWeight={700} color="#0d47a1" sx={{ mt: 0.3 }}>
                            🧮 {calcText}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={token.status.toUpperCase()} 
                            size="small" 
                            color={token.status === "updated" ? "warning" : "info"} 
                            sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "error.main" }}>
                          ₹{Number(token.dueAmount || 0).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

/** ==============================================
 *  MAIN PAGE COMPONENT
 *  ============================================== */
const PaymentRecoveryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { recoveryData, loading, error } = useSelector(
    (state: RootState) => state.paymentHistoryReducer
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ⭐ Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [actionType, setActionType] = useState<"positive" | "negative">("positive");
  const [amountInput, setAmountInput] = useState<string>("");
  const [reasonInput, setReasonInput] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getPaymentRecoveryAction());
  }, [dispatch]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const handleOpenSettleModal = (row: any) => {
    setSelectedRow(row);
    setActionType("positive"); // Default always positive payment
    setAmountInput(String(row.totalOverallDue || ""));
    setReasonInput("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setSubmitting(false);
  };

  const handleProcessSettlement = async () => {
    const numericVal = parseFloat(amountInput);
    if (!numericVal || isNaN(numericVal) || numericVal <= 0) {
      setFormError("Kripya 0 se bada valid amount enter karein");
      return;
    }

    if (!reasonInput.trim()) {
      setFormError("Reason / Remarks likhna zaroori hai");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    // Negative action me value minus banegi
    const finalAmount = actionType === "positive" ? numericVal : -numericVal;

    const res: any = await dispatch(settlePaymentRecoveryAction({
      entityName: selectedRow.entityName,
      entityType: selectedRow.entityType,
      amount: finalAmount,
      reason: reasonInput.trim()
    }));

    setSubmitting(false);
    if (res?.success) {
      handleCloseModal();
      // Optional: Refresh the recovery list after successful settlement
      dispatch(getPaymentRecoveryAction());
    } else {
      setFormError(res?.msg || "Process karne me error aaya.");
    }
  };

  const recoveryList = Array.isArray(recoveryData) ? recoveryData : recoveryData?.data || [];
  
  const filteredRecovery = recoveryList.filter((item: any) => {
    const query = search.toLowerCase();
    return (
      (item.entityName || "").toLowerCase().includes(query) ||
      (item.entityPhone || "").includes(query) ||
      (item.entityType || "").toLowerCase().includes(query) ||
      (item.dealerName || "").toLowerCase().includes(query)
    );
  });

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={50} thickness={4} /></Box>;
  if (error) return <Typography color="error" align="center" variant="h6" sx={{ mt: 5 }}>{error}</Typography>;

  return (
    <Paper elevation={4} sx={{ p: { xs: 1, sm: 3 }, borderRadius: 4, background: "#ffffff", width: "100%", minHeight: "80vh" }}>
      {/* 🎨 HEADER SECTION */}
      <Box sx={{ 
        background: "linear-gradient(135deg, #b71c1c 0%, #d32f2f 50%, #f44336 100%)", 
        color: "white", borderRadius: 3, px: { xs: 2, sm: 3 }, py: 2.5, mb: 3, 
        display: "flex", flexDirection: { xs: "column", md: "row" }, 
        justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, 
        gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" 
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AccountBalanceWalletIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: "#ffcdd2" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
              Payment Recovery (Outstanding Dues)
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Total Accounts with pending dues: <strong>{filteredRecovery.length}</strong>
            </Typography>
          </Box>
        </Box>

        <TextField
          placeholder="Search name, phone or type..." 
          variant="outlined" size="small" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "gray" }} /></InputAdornment>) }}
          sx={{ 
            backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: "320px" }, 
            "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "transparent" } } 
          }}
        />
      </Box>

      {/* 📊 MAIN TABLE */}
      <TableContainer sx={{ borderRadius: 3, border: "1px solid #e0e0e0", backgroundColor: "white", maxHeight: "65vh" }}>
        <Table stickyHeader size="medium" sx={{ minWidth: 800 }}> 
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f4f6f8", width: "50px" }} />
              <TableCell sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Name & Phone
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Role / Type
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Assigned Dealer
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Total Outstanding
              </TableCell>
              <TableCell align="center" sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecovery.length ? (
              filteredRecovery.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => (
                <RecoveryRow key={index} row={row} onOpenSettleModal={handleOpenSettleModal} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="h6" color="text.secondary">No Outstanding Dues Found 🎉</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📄 PAGINATION */}
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]} component="div" count={filteredRecovery.length}
          page={page} rowsPerPage={rowsPerPage} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderBottom: "none" }}
        />
      </Box>

      {/* ⭐ SETTLEMENT / ADJUSTMENT DIALOG (MODAL) */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {selectedRow?.entityName} ({selectedRow?.entityType})
          <Typography variant="body2" color="text.secondary">
            Current Outstanding Due: <strong>₹{Number(selectedRow?.totalOverallDue || 0).toLocaleString("en-IN")}</strong>
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* ⭐ Nature Selection: Token Owner ke case me Negative hide rahega */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>Transaction Nature</FormLabel>
              <RadioGroup row value={actionType} onChange={(e) => setActionType(e.target.value as any)}>
                <FormControlLabel 
                  value="positive" 
                  control={<Radio color="success" />} 
                  label="Paid (+) Due Kam Karein" 
                />
                {selectedRow?.entityType !== "Token Owner" && (
                  <FormControlLabel 
                    value="negative" 
                    control={<Radio color="error" />} 
                    label="Add Due (-) Bakaya Badhayein" 
                  />
                )}
              </RadioGroup>
            </FormControl>

            {/* Amount Input */}
            <TextField
              label={actionType === "positive" ? "Paid Amount (₹)" : "Extra Due Amount (₹)"}
              type="number"
              fullWidth
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText={
                actionType === "positive" 
                  ? "Puraane tokens se shuru hokar naye tokens tak auto-settle hoga." 
                  : "Yeh amount recovery ledger me add ho jayega (Payment History me tab aayega jab token confirm hoga)."
              }
            />

            {/* Reason Input */}
            <TextField
              label="Reason / Remarks"
              placeholder="e.g. Cash received by driver / Token penalty adjustment / Dispute"
              fullWidth
              multiline
              rows={2}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleProcessSettlement} 
            variant="contained" 
            color={actionType === "positive" ? "success" : "error"}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : actionType === "positive" ? (
              "Confirm Settlement"
            ) : (
              "Confirm Due Addition"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PaymentRecoveryPage;