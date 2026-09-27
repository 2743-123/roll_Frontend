import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCardIcon from "@mui/icons-material/AddCard";
import HistoryIcon from "@mui/icons-material/History";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CloseIcon from "@mui/icons-material/Close";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { keyframes } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import {
  getMasterAccountsAction,
  createMasterAccountAction,
  processMasterTransactionAction,
  getMasterAccountTransactionsAction,
  getPendingSettlementsAction
} from "../../../../Actions/Auth/paymentHistoryAction";

// 🌟 Blinking Animations
const blinkAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); border-color: #4caf50; }
  70% { box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0); border-color: #81c784; }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); border-color: #4caf50; }
`;

const flashRedAnimation = keyframes`
  0%, 100% { background-color: #d32f2f; color: white; }
  50% { background-color: #ffcdd2; color: #b71c1c; }
`;

const AccountSettlementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // ⭐ Redux state se backend ki list nikal rahe hain
  const { masterAccounts, masterTransactions, loading, pendingSettlementsList } = useSelector(
    (state: RootState) => state.paymentHistoryReducer
  );

  const [currentTab, setCurrentTab] = useState(0);
  const [globalAmount, setGlobalAmount] = useState<string>("");
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [activePendingId, setActivePendingId] = useState<number | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: "", phone: "", accountType: "General" });

  const [openTxn, setOpenTxn] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<any>(null);
  
  // ⭐ Form payload me pendingSettlementId add kiya
  const [txnPayload, setTxnPayload] = useState({
    amount: "",
    type: "CREDIT",
    paymentMode: "Cash",
    reason: "",
    destAccountId: "",
    pendingSettlementId: null as number | null
  });

  const [openHistory, setOpenHistory] = useState(false);
  const [historyAcc, setHistoryAcc] = useState<any>(null);

  // 1. Initial Load: Accounts aur Pending Queue dono fetch karo
  useEffect(() => {
    dispatch(getMasterAccountsAction());
    dispatch(getPendingSettlementsAction());
  }, [dispatch]);

  // 🟢 Pending Ticket par click hone par value set karna
  const handlePendingChipClick = (pendingItem: any) => {
    setGlobalAmount(pendingItem.amount.toString());
    setIsBlinking(true);
    setActivePendingId(pendingItem.id);
    
    setTxnPayload(prev => ({
      ...prev,
      amount: pendingItem.amount.toString(),
      reason: pendingItem.sourceDetails,
      pendingSettlementId: pendingItem.id
    }));
  };

  // Agar manually amount change kiya toh ticket unselect ho jayega
  const handleGlobalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGlobalAmount(val);
    setIsBlinking(Number(val) > 0);
    if (activePendingId) {
      setActivePendingId(null);
      setTxnPayload(prev => ({ ...prev, pendingSettlementId: null, reason: "" }));
    }
  };

  const handleCreateSubmit = async () => {
    if (!newAcc.name) return alert("Name is required!");
    await dispatch(createMasterAccountAction(newAcc as any));
    setOpenCreate(false);
    setNewAcc({ name: "", phone: "", accountType: "General" });
  };

  const handleCardClick = (acc: any) => {
    setSelectedAcc(acc);
    setTxnPayload(prev => ({
      ...prev,
      amount: isBlinking ? globalAmount : "",
      type: "CREDIT",
      paymentMode: "Cash"
    }));
    setOpenTxn(true);
  };

  const handleTxnSubmit = async () => {
    if (!txnPayload.amount || Number(txnPayload.amount) <= 0) return alert("Enter valid amount!");
    if (txnPayload.type === "TRANSFER" && !txnPayload.destAccountId) return alert("Select destination account!");

    const payload = {
      sourceAccountId: selectedAcc.id,
      amount: Number(txnPayload.amount),
      type: txnPayload.type as any,
      paymentMode: txnPayload.paymentMode as any,
      reason: txnPayload.reason,
      destAccountId: txnPayload.type === "TRANSFER" ? Number(txnPayload.destAccountId) : undefined,
      // ⭐ TypeScript error fix: null ko undefined me bheja
      pendingSettlementId: txnPayload.pendingSettlementId !== null ? txnPayload.pendingSettlementId : undefined 
    };

    const res = await dispatch(processMasterTransactionAction(payload));
    if (res.success) {
      setOpenTxn(false);
      setGlobalAmount("");
      setIsBlinking(false);
      setActivePendingId(null);
      
      setTxnPayload({
        amount: "",
        type: "CREDIT",
        paymentMode: "Cash",
        reason: "",
        destAccountId: "",
        pendingSettlementId: null
      });
    }
  };

  const handleViewHistory = async (acc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryAcc(acc);
    await dispatch(getMasterAccountTransactionsAction(acc.id));
    setOpenHistory(true);
  };

  const allTransactionsList = React.useMemo(() => {
    if (!masterTransactions) return [];
    let list: any[] = [];
    Object.keys(masterTransactions).forEach((accId) => {
      const acc = masterAccounts?.find((a: any) => a.id === Number(accId));
      const txs = masterTransactions[Number(accId)] || [];
      txs.forEach((tx: any) => {
        list.push({ ...tx, accountName: acc?.name || "Unknown Account" });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [masterTransactions, masterAccounts]);

  useEffect(() => {
    if (currentTab === 1 && masterAccounts) {
      masterAccounts.forEach((acc: any) => {
        dispatch(getMasterAccountTransactionsAction(acc.id));
      });
    }
  }, [currentTab, masterAccounts, dispatch]);

  return (
    <Paper elevation={4} sx={{ p: { xs: 1, sm: 3 }, borderRadius: 4, background: "#f8f9fa", width: "100%", minHeight: "80vh" }}>
      
      {/* 🚀 1. PENDING SETTLEMENT QUEUE FROM BACKEND */}
      {(pendingSettlementsList && pendingSettlementsList.length > 0) && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "#fff3e0", borderRadius: 3, border: "1px solid #ffe0b2", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsActiveIcon color="error" sx={{ animation: `${flashRedAnimation} 2s infinite`, borderRadius: "50%" }} />
            <Typography variant="subtitle2" fontWeight={700} color="#e65100">
              Pending Settlements Queue ({pendingSettlementsList.length}):
            </Typography>
          </Box>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {pendingSettlementsList.map((item) => (
              <Chip
                key={item.id}
                label={`₹${Number(item.amount).toLocaleString()} - ${item.sourceDetails.substring(0, 25)}...`}
                onClick={() => handlePendingChipClick(item)}
                sx={{
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  animation: activePendingId === item.id ? "none" : `${flashRedAnimation} 1.5s infinite`,
                  bgcolor: activePendingId === item.id ? "#4caf50" : "error.main",
                  color: "white",
                  "&:hover": { bgcolor: "#2e7d32" },
                  boxShadow: activePendingId === item.id ? "0 0 10px #4caf50" : "none"
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 🚀 2. HEADER */}
      <Box sx={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", color: "white", borderRadius: 3, px: { xs: 2, sm: 3 }, py: 2.5, mb: 3, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AccountBalanceWalletIcon sx={{ fontSize: { xs: 24, sm: 34 }, color: "#69f0ae" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>Master Khata (Settlements)</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Manage all Cash, Bank, and Party accounts seamlessly</Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Type amount to settle..."
            variant="outlined"
            size="small"
            value={globalAmount}
            onChange={handleGlobalAmountChange}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            sx={{ backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: "220px" }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            startIcon={<AddCardIcon />}
            onClick={() => setOpenCreate(true)}
            sx={{ backgroundColor: "#ffeb3b", color: "#000", fontWeight: 700, borderRadius: 2, px: 3, textTransform: "none", "&:hover": { backgroundColor: "#fbc02d" } }}
          >
            Create Account
          </Button>
        </Box>
      </Box>

      {/* 🚀 3. TABS NAVIGATION */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newVal) => setCurrentTab(newVal)} textColor="primary" indicatorColor="primary">
          <Tab icon={<ViewModuleIcon />} iconPosition="start" label="Master Khata Cards" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="Master History (Date & Time)" sx={{ fontWeight: 700, textTransform: "none" }} />
        </Tabs>
      </Box>

      {/* 🚀 TAB 1: ACCOUNTS CARDS VIEW */}
      {currentTab === 0 && (
        <>
          {loading && !masterAccounts ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={3}>
              {(masterAccounts || []).map((acc) => (
                <Grid key={acc.id}>
                  <Card 
                    onClick={() => handleCardClick(acc)}
                    sx={{ 
                      borderRadius: 3, cursor: "pointer", transition: "all 0.3s ease",
                      border: isBlinking ? "2px solid #4caf50" : "1px solid #e0e0e0",
                      animation: isBlinking ? `${blinkAnimation} 1.5s infinite` : "none",
                      "&:hover": { transform: "translateY(-5px)", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }
                    }}
                  >
                    <CardContent sx={{ pb: "16px !important" }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight={700} color="primary.main">{acc.name}</Typography>
                        <Chip label={acc.accountType} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem" }} color={acc.accountType === "Cash" ? "success" : "info"} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>{acc.phone ? `📱 ${acc.phone}` : "No phone linked"}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={2} pt={2} sx={{ borderTop: "1px dashed #cfd8dc" }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Current Balance</Typography>
                          <Typography variant="h5" fontWeight={800} color={Number(acc.balance) < 0 ? "error.main" : "success.main"}>
                            ₹{Number(acc.balance).toLocaleString("en-IN")}
                          </Typography>
                        </Box>
                        <Button size="small" variant="outlined" startIcon={<HistoryIcon />} onClick={(e) => handleViewHistory(acc, e)} sx={{ borderRadius: 2, textTransform: "none" }}>History</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* 🚀 TAB 2: MASTER HISTORY */}
      {currentTab === 1 && (
        <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: "65vh" }}>
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow>
                  {["Date & Time", "Account Name", "Txn Details", "Mode", "In (+)", "Out (-)", "Balance After"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 700, bgcolor: "#1976d2", color: "white" }}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allTransactionsList.length > 0 ? (
                  allTransactionsList.map((tx: any, idx: number) => (
                    <TableRow key={tx.id || idx} hover>
                      <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                        {new Date(tx.date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{tx.accountName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={tx.type === "TRANSFER" ? "primary.main" : "text.primary"}>
                          {tx.type === "TRANSFER" ? `Transfer ⇆ ${tx.linkedAccountName}` : tx.reason || (tx.type === "CREDIT" ? "Deposit" : "Withdrawal")}
                        </Typography>
                      </TableCell>
                      <TableCell><Chip label={tx.paymentMode} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ color: "success.main", fontWeight: 700 }}>{tx.type === "CREDIT" ? `+ ₹${Number(tx.amount).toLocaleString()}` : "-"}</TableCell>
                      <TableCell sx={{ color: "error.main", fontWeight: 700 }}>{tx.type === "DEBIT" ? `- ₹${Math.abs(Number(tx.amount)).toLocaleString()}` : "-"}</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>₹{Number(tx.balanceAfter).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No master transactions recorded yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 🚀 MODALS (CREATE ACCOUNT, TRANSACTION, HISTORY) */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>Create Master Account<IconButton onClick={() => setOpenCreate(false)} size="small"><CloseIcon /></IconButton></DialogTitle>
        <DialogContent sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Account Name" fullWidth value={newAcc.name} onChange={(e) => setNewAcc({...newAcc, name: e.target.value})} />
          <TextField label="Phone (Optional)" fullWidth value={newAcc.phone} onChange={(e) => setNewAcc({...newAcc, phone: e.target.value})} />
          <FormControl fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select value={newAcc.accountType} label="Account Type" onChange={(e) => setNewAcc({...newAcc, accountType: e.target.value})}>
              <MenuItem value="Cash">Cash Account</MenuItem><MenuItem value="Bank">Bank Account</MenuItem><MenuItem value="Customer">Customer</MenuItem><MenuItem value="Carting">Carting</MenuItem><MenuItem value="General">General</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenCreate(false)}>Cancel</Button><Button onClick={handleCreateSubmit} variant="contained">Save</Button></DialogActions>
      </Dialog>

      <Dialog open={openTxn} onClose={() => setOpenTxn(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: "#f4f6f8", fontWeight: 700, pb: 2 }}>
          Transact with: <span style={{ color: "#1976d2" }}>{selectedAcc?.name}</span>
          <Typography variant="caption" display="block" mt={0.5} color="text.secondary">Current Balance: ₹{Number(selectedAcc?.balance || 0).toLocaleString("en-IN")}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ p: 1.5, bgcolor: "#fff3e0", borderRadius: 2, border: "1px solid #ffe0b2" }}>
            <Typography variant="caption" fontWeight={700} color="#e65100">1. Action Type</Typography>
            <RadioGroup row value={txnPayload.type} onChange={(e) => setTxnPayload({...txnPayload, type: e.target.value})}>
              <FormControlLabel value="CREDIT" control={<Radio color="success" />} label={<span style={{fontWeight: 600, color: "#2e7d32"}}>Add (+)</span>} />
              <FormControlLabel value="DEBIT" control={<Radio color="error" />} label={<span style={{fontWeight: 600, color: "#d32f2f"}}>Withdraw (-)</span>} />
              <FormControlLabel value="TRANSFER" control={<Radio color="primary" />} label={<span style={{fontWeight: 600, color: "#1565c0"}}>Transfer ({"->"})</span>} />
            </RadioGroup>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 2, border: "1px solid #bbdefb" }}>
            <Typography variant="caption" fontWeight={700} color="#1565c0">2. Payment Mode</Typography>
            <RadioGroup row value={txnPayload.paymentMode} onChange={(e) => setTxnPayload({...txnPayload, paymentMode: e.target.value})}>
              <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
              <FormControlLabel value="Online" control={<Radio />} label="Online / Bank" />
            </RadioGroup>
          </Box>
          {txnPayload.type === "TRANSFER" && (
            <FormControl fullWidth>
              <InputLabel>Transfer To</InputLabel>
              <Select value={txnPayload.destAccountId} label="Transfer To" onChange={(e) => setTxnPayload({...txnPayload, destAccountId: e.target.value})}>
                {(masterAccounts || []).filter(a => a.id !== selectedAcc?.id).map(acc => (
                  <MenuItem key={acc.id} value={acc.id}>{acc.name} (Bal: ₹{Number(acc.balance).toLocaleString("en-IN")})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField label="Amount (₹)" type="number" fullWidth value={txnPayload.amount} onChange={(e) => setTxnPayload({...txnPayload, amount: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { fontSize: "1.2rem", fontWeight: "bold" } }} />
          <TextField label="Reason / Note" fullWidth value={txnPayload.reason} onChange={(e) => setTxnPayload({...txnPayload, reason: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f9fafb" }}>
          <Button onClick={() => setOpenTxn(false)}>Cancel</Button>
          <Button onClick={handleTxnSubmit} variant="contained" disabled={loading} startIcon={<SyncAltIcon />} sx={{ bgcolor: txnPayload.type === "DEBIT" ? "#d32f2f" : "#2e7d32" }}>Confirm</Button>
        </DialogActions>
      </Dialog>
      
      {/* 🚀 MODAL 3 (HISTORY TIMELINE) */}
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#f4f6f8", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>History: <span style={{ color: "#1976d2" }}>{historyAcc?.name}</span></Box>
          <IconButton onClick={() => setOpenHistory(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loading && !masterTransactions?.[historyAcc?.id] ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["Date", "Txn Details", "Mode", "In (+)", "Out (-)", "Balance"].map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 700, bgcolor: "#e0e0e0" }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(masterTransactions?.[historyAcc?.id] || []).map((tx: any) => (
                    <TableRow key={tx.id} hover>
                      <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary", whiteSpace: "nowrap" }}>{new Date(tx.date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={tx.type === "TRANSFER" ? "primary.main" : "text.primary"}>
                          {tx.type === "TRANSFER" ? `Transfer ⇆ ${tx.linkedAccountName}` : tx.reason || (tx.type === "CREDIT" ? "Deposit" : "Withdrawal")}
                        </Typography>
                        {tx.type !== "TRANSFER" && tx.reason && <Typography variant="caption" color="text.secondary" fontStyle="italic">{tx.reason}</Typography>}
                      </TableCell>
                      <TableCell><Chip label={tx.paymentMode} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ color: "success.main", fontWeight: 700 }}>{tx.type === "CREDIT" ? `+ ₹${Number(tx.amount).toLocaleString()}` : "-"}</TableCell>
                      <TableCell sx={{ color: "error.main", fontWeight: 700 }}>{tx.type === "DEBIT" ? `- ₹${Math.abs(Number(tx.amount)).toLocaleString()}` : "-"}</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>₹{Number(tx.balanceAfter).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AccountSettlementPage;