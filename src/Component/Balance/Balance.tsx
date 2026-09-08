import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { AppDispatch, RootState } from "../../store";
import {
  getBalanceAction,
  editBalanceAction,
  deleteBalanceAction,
} from "../../Actions/Auth/balance";

import AddBalanceDialog from "./AddBalance";

interface Transaction {
  id: number;
  date: string;
  flyashAmount: string | number;
  bedashAmount: string | number;
  totalAmount: string | number;
  flyashTons: string | number;
  bedashTons: string | number;
  paymentMode: "cash" | "online";
  bankName?: string | null;
  accountHolder?: string | null;
  referenceNumber?: string | null;
}

const BalanceTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.balance);
  const { selectedUser } = useSelector((state: RootState) => state.user);

  /** 🔹 Pagination & search */
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState("");

  /** 🔹 Dialog states */
  const [openAdd, setOpenAdd] = React.useState(false);
  const [editTx, setEditTx] = React.useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  /** 🔄 Fetch balance */
  React.useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getBalanceAction(selectedUser.id));
    }
  }, [selectedUser, dispatch]);

  /** 🔹 Pagination handlers */
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  /** 🔹 Search */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  /** 🔹 Formatter Helpers */
  const formatCur = (val: string | number) => `₹${Number(val || 0).toLocaleString("en-IN")}`;
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  /** 🔹 CRUD handlers */
  const handleAdd = () => setOpenAdd(true);
  const handleEdit = (tx: Transaction) => setEditTx(tx);
  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!selectedUser || !deleteId) return;
    await dispatch(deleteBalanceAction(deleteId, selectedUser.id));
    setDeleteId(null);
  };

  const confirmEdit = async () => {
    if (!selectedUser || !editTx) return;
    await dispatch(
      editBalanceAction(
        editTx.id,
        {
          flyashAmount: Number(editTx.flyashAmount),
          bedashAmount: Number(editTx.bedashAmount),
        },
        selectedUser.id
      )
    );
    setEditTx(null);
  };

  /** 🔹 Filter */
  const filteredTransactions: Transaction[] =
    data?.transactions?.filter((tx: Transaction) => {
      const query = search.toLowerCase();
      return (
        tx.date?.toLowerCase().includes(query) ||
        tx.flyashAmount?.toString().includes(query) ||
        tx.bedashAmount?.toString().includes(query) ||
        tx.totalAmount?.toString().includes(query) ||
        tx.paymentMode?.toLowerCase().includes(query) ||
        tx.accountHolder?.toLowerCase().includes(query) ||
        tx.bankName?.toLowerCase().includes(query) ||
        tx.referenceNumber?.toLowerCase().includes(query)
      );
    }) || [];

  if (!selectedUser) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center", bgcolor: "#f8f9fa" }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Please select a user to view their balance transactions.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 4, background: "#ffffff", minHeight: "80vh" }}>
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
          <AccountBalanceWalletIcon sx={{ fontSize: 28, color: "#4caf50" }} />
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
            Balance <span style={{ opacity: 0.7, fontWeight: 400 }}>| {selectedUser.name}</span>
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search transactions..."
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
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              backgroundColor: "#ffeb3b",
              color: "#000",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              "&:hover": { backgroundColor: "#fbc02d" },
            }}
          >
            Add Balance
          </Button>
        </Box>
      </Box>

      {/* ================= TABLE ================= */}
      <TableContainer
        sx={{
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          backgroundColor: "white",
          maxHeight: "65vh",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {[
                { label: "Date", align: "left" },
                { label: "Flyash Tons", align: "right" },
                { label: "Flyash ₹", align: "right" },
                { label: "Bedash Tons", align: "right" },
                { label: "Bedash ₹", align: "right" },
                { label: "Total ₹", align: "right" },
                { label: "Mode", align: "center" },
                { label: "Bank Details", align: "left" },
                { label: "Actions", align: "center" },
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tx) => (
                  <TableRow
                    key={tx.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f9fafb" },
                      "& td": { borderBottom: "1px solid #f0f0f0" },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>
                      {formatDate(tx.date)}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 500 }}>{Number(tx.flyashTons) > 0 ? `${tx.flyashTons} T` : "-"}</TableCell>
                    <TableCell align="right">{Number(tx.flyashAmount) > 0 ? formatCur(tx.flyashAmount) : "-"}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, color: "#ed6c02" }}>{Number(tx.bedashTons) > 0 ? `${tx.bedashTons} T` : "-"}</TableCell>
                    <TableCell align="right">{Number(tx.bedashAmount) > 0 ? formatCur(tx.bedashAmount) : "-"}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#2e7d32", fontSize: "0.95rem" }}>
                      {formatCur(tx.totalAmount)}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={tx.paymentMode}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          backgroundColor: tx.paymentMode === "online" ? "#e3f2fd" : "#fff3e0",
                          color: tx.paymentMode === "online" ? "#1565c0" : "#e65100",
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {tx.paymentMode === "online" ? (
                        <Box display="flex" flexDirection="column">
                          <Typography variant="caption" fontWeight={600} color="primary.main">
                            {tx.bankName || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ref: {tx.referenceNumber || "N/A"}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">Not Applicable</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(tx)} 
                          size="small" 
                          sx={{ mr: 1, backgroundColor: "#f0f7ff", "&:hover": { backgroundColor: "#e3f2fd" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(tx.id)} 
                          size="small"
                          sx={{ backgroundColor: "#fff0f0", "&:hover": { backgroundColor: "#ffebee" } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Transactions Found</Typography>
                    <Typography variant="body2">Try adjusting your search or add a new balance entry.</Typography>
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
          component="div"
          count={filteredTransactions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderBottom: "none" }}
        />
      </Box>

      {/* ================= ADD DIALOG ================= */}
      <AddBalanceDialog open={openAdd} onClose={() => setOpenAdd(false)} />

      {/* ================= EDIT DIALOG ================= */}
      <Dialog 
        open={!!editTx} 
        onClose={() => setEditTx(null)}
        PaperProps={{ sx: { borderRadius: 3, padding: 1, minWidth: "350px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1976d2" }}>Edit Balance Entry</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Flyash Amount (₹)"
              type="number"
              fullWidth
              value={editTx?.flyashAmount || ""}
              onChange={(e) =>
                setEditTx((prev) => prev ? { ...prev, flyashAmount: e.target.value } : prev)
              }
            />
            <TextField
              label="Bedash Amount (₹)"
              type="number"
              fullWidth
              value={editTx?.bedashAmount || ""}
              onChange={(e) =>
                setEditTx((prev) => prev ? { ...prev, bedashAmount: e.target.value } : prev)
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditTx(null)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={confirmEdit} sx={{ fontWeight: 600, borderRadius: 2, px: 3 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRM ================= */}
      <Dialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3, padding: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#d32f2f" }}>Delete Transaction?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this balance entry? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} sx={{ fontWeight: 600, borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BalanceTable;