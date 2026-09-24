import React, { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Chip, TextField,
  InputAdornment, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getTokenAction, deleteTokenAction } from "../../Actions/Auth/TokenAction";
import AddTokenDialog from "./add";
import EditTokenDialog from "./edit";
import { Token } from "../../ActionType/UserTokenTypes";

const TokenPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  
  const { tokens, loading, error } = useSelector((state: RootState) => state.token) as { tokens: Token[], loading: boolean, error: string | null };

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [search, setSearch] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (selectedUser?.id) dispatch(getTokenAction(selectedUser.id));
  }, [dispatch, selectedUser?.id]);

  const handleEditClick = (token: Token) => {
    setSelectedToken(token);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (tokenId: number) => {
    setTokenToDelete(tokenId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tokenToDelete && selectedUser?.id) {
      dispatch(deleteTokenAction(tokenToDelete, selectedUser.id));
    }
    setDeleteDialogOpen(false);
    setTokenToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTokenToDelete(null);
  };

  const handleDataRefresh = () => {
    if (selectedUser?.id) dispatch(getTokenAction(selectedUser.id));
  };

  // Safe Currency Formatter
  const formatCur = (val: number | string | null | undefined) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  // Safe Date Formatter
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  if (!selectedUser)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff", maxWidth: 400 }}>
          <Typography variant="h6" color="text.primary" fontWeight={700} gutterBottom>No User Selected</Typography>
          <Typography variant="body2" color="text.secondary">Please select a customer from the top navigation dropdown.</Typography>
        </Paper>
      </Box>
    );

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={50} thickness={4} /></Box>;
  if (error) return <Typography color="error" align="center" variant="h6" sx={{ mt: 5 }}>{error}</Typography>;

  // Safe Search Filter
  const filteredTokens = (tokens || []).filter((token: Token) => {
    const query = search.toLowerCase();
    return (
      (token.customerName || "").toLowerCase().includes(query) ||
      (token.truckNumber || "").toLowerCase().includes(query) ||
      (token.materialType || "").toLowerCase().includes(query) ||
      (token.status || "").toLowerCase().includes(query) ||
      (token.cartingOwnerName || "").toLowerCase().includes(query) ||
      (token.anotherTokenOwnerName || "").toLowerCase().includes(query)
    );
  });

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 4, background: "#ffffff", width: "100%", minHeight: "80vh" }}>
      {/* HEADER */}
      <Box sx={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", color: "white", borderRadius: 3, px: 3, py: 2.5, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <ReceiptIcon sx={{ fontSize: 30, color: "#81c784" }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>Tokens Management</Typography>
            <Typography variant="caption">Active Customer: <strong>{selectedUser.name}</strong></Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search tokens..." variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "gray" }} /></InputAdornment>) }}
            sx={{ backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: "280px" } }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)} sx={{ backgroundColor: "#ffeb3b", color: "#000", fontWeight: 700, borderRadius: 2, px: 3, "&:hover": { backgroundColor: "#fbc02d" } }}>
            Add Token
          </Button>
        </Box>
      </Box>

      {/* TABLE */}
      <TableContainer sx={{ borderRadius: 3, border: "1px solid #e0e0e0", backgroundColor: "white", maxHeight: "68vh" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["ID", "Customer / Stakeholders", "Truck", "Material", "Weight", "Rate", "Commission", "Total Amount", "Paid", "Carry Fwd", "Status", "Dates", "Action"].map((col) => (
                <TableCell key={col} sx={{ backgroundColor: "#f4f6f8", color: "#333", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTokens.length ? filteredTokens.map((token: Token) => {
              
              const isBedash = (token.materialType || "").toLowerCase() === "bedash";
              const isAnother = (token.tokenOwnerType || "").toLowerCase() === "another";
              const isPending = (token.status || "").toLowerCase() === "pending";
              const isCompleted = (token.status || "").toLowerCase() === "completed";

              return (
                <TableRow key={token.id} hover sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}>
                  <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>#{token.id}</TableCell>
                  
                  {/* 🟢 STAKEHOLDERS COLUMN */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{token.customerName || "N/A"}</Typography>
                    {isBedash && (
                      <Box mt={0.5}>
                        {token.cartingOwnerName && (
                          <Typography variant="caption" display="block" color="error.main">
                            <b>Ca:</b> {token.cartingOwnerName}
                          </Typography>
                        )}
                        {isAnother && token.anotherTokenOwnerName && (
                          <Typography variant="caption" display="block" color="secondary.main">
                            <b>Ow:</b> {token.anotherTokenOwnerName}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell><Chip label={token.truckNumber || "N/A"} size="small" variant="outlined" /></TableCell>
                  <TableCell sx={{ textTransform: "capitalize", fontWeight: 600, color: isBedash ? '#ed6c02' : '#757575' }}>
                    {token.materialType || "N/A"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{token.weight || 0} T</TableCell>

                  {/* 💰 RATES */}
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {isBedash ? (
                      <>
                        <Typography variant="caption" display="block">Cu: <b>{formatCur(token.sellRate)}</b></Typography>
                        <Typography variant="caption" display="block" color="error.main">Ca: <b>{formatCur(token.cartingRate)}</b></Typography>
                        {isAnother && <Typography variant="caption" display="block" color="secondary.main">Ow: <b>{formatCur(token.tokenOwnerRate)}</b></Typography>}
                      </>
                    ) : (
                      <Typography variant="body2">{formatCur(token.ratePerTon)}</Typography>
                    )}
                  </TableCell>

                  {/* 💰 COMMISSION */}
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {isBedash ? (
                      <Typography variant="caption" display="block" color="primary.main">Comm: <b>{formatCur(token.commission)}</b></Typography>
                    ) : (
                      <Typography variant="body2">{formatCur(token.commission)}</Typography>
                    )}
                  </TableCell>

                  {/* 💰 TOTALS */}
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {isBedash ? (
                      <>
                        <Typography variant="caption" display="block" color="success.main">Bill: <b>{formatCur(token.totalAmount)}</b></Typography>
                        <Typography variant="caption" display="block" color="error.main">Cart: <b>{formatCur(token.totalCarting)}</b></Typography>
                        {isAnother && <Typography variant="caption" display="block" color="secondary.main">Own: <b>{formatCur(token.totalTokenOwnerAmount)}</b></Typography>}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2e7d32" }}>{formatCur(token.totalAmount)}</Typography>
                    )}
                  </TableCell>

                  {/* 💰 PAID */}
                  <TableCell sx={{ fontWeight: 600 }}>{formatCur(token.paidAmount)}</TableCell>

                  {/* 📊 CARRY FORWARD */}
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {isBedash ? (
                      <>
                        <Typography variant="caption" display="block" color={Number(token.carryForward) < 0 ? "error.main" : "text.secondary"}>
                          Cu: <b>{formatCur(token.carryForward)}</b>
                        </Typography>
                        <Typography variant="caption" display="block" color="warning.main">
                          Ca: <b>+{formatCur(token.cartingCarryForward)}</b>
                        </Typography>
                        {isAnother && (
                          <Typography variant="caption" display="block" color="info.main">
                            Ow: <b>+{formatCur(token.tokenOwnerCarryForward)}</b>
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" fontWeight={700} color={Number(token.carryForward) < 0 ? "error.main" : "text.secondary"}>
                        {formatCur(token.carryForward)}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Chip label={token.status || "Unknown"} size="small" sx={{ textTransform: "capitalize", fontWeight: 700, backgroundColor: isCompleted ? "#e8f5e9" : isPending ? "#ffebee" : "#fff3e0", color: isCompleted ? "#2e7d32" : isPending ? "#c62828" : "#ef6c00" }} />
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {token.createdAt && <Typography variant="caption" color="text.secondary"><b>Cr:</b> {formatDateTime(token.createdAt)}</Typography>}
                      {token.updatedAt && <Typography variant="caption" color="primary.main"><b>Up:</b> {formatDateTime(token.updatedAt)}</Typography>}
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {isPending && (
                      <Tooltip title="Delete Token">
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteClick(token.id)} sx={{ minWidth: "36px", p: 0, mr: 1 }}><DeleteOutlineIcon fontSize="small" /></Button>
                      </Tooltip>
                    )}
                    {!isCompleted ? (
                      <Button variant="contained" color="primary" size="small" startIcon={<PaymentIcon />} onClick={() => handleEditClick(token)} sx={{ textTransform: "none", height: "32px" }}>Pay/Edit</Button>
                    ) : <Chip label="Cleared" size="small" color="success" variant="outlined" />}
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow><TableCell colSpan={13} align="center" sx={{ py: 6 }}><Typography variant="h6" color="text.secondary">No Tokens Found</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOGS */}
      <AddTokenDialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} />
      {selectedToken && <EditTokenDialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} token={selectedToken} onRefresh={handleDataRefresh} />}
      
      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ background: "#d32f2f", color: "white" }}>Delete Token</DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}><Typography>Are you sure you want to delete this token?</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={cancelDelete} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TokenPage;