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
  Divider,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
  flyashAmount: string;
  bedashAmount: string;
  totalAmount: string;
  flyashTons: string;
  bedashTons: string;
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

  /** 🔹 CRUD handlers */
  const handleAdd = () => setOpenAdd(true);
  const handleEdit = (tx: Transaction) => setEditTx(tx);
  const handleDelete = (id: number) => setDeleteId(id);

  /** 🔹 Confirm delete */
  const confirmDelete = async () => {
    if (!selectedUser || !deleteId) return;

    await dispatch(deleteBalanceAction(deleteId, selectedUser.id));
    setDeleteId(null);
  };

  /** 🔹 Confirm edit */
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
        tx.date.toLowerCase().includes(query) ||
        tx.flyashAmount.toLowerCase().includes(query) ||
        tx.bedashAmount.toLowerCase().includes(query) ||
        tx.totalAmount.toLowerCase().includes(query) ||
        tx.paymentMode.toLowerCase().includes(query) ||
        tx.accountHolder?.toLowerCase().includes(query) ||
        tx.bankName?.toLowerCase().includes(query) ||
        tx.referenceNumber?.toLowerCase().includes(query)
      );
    }) || [];

  /** 🔹 Loading */
  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
          borderRadius: 2,
          px: 3,
          py: 2,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Balance Transactions
        </Typography>

        <Box display="flex" gap={2}>
          <TextField
            label="Search"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ background: "white", borderRadius: 1 }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ background: "white", color: "#1976d2" }}
          >
            Add Balance
          </Button>
        </Box>
      </Box>

      {/* ================= TABLE ================= */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                "Date",
                "Flyash ₹",
                "Flyash Tons",
                "Bedash ₹",
                "Bedash Tons",
                "Total ₹",
                "Mode",
                "Bank",
                "Holder",
                "Ref No",
                "Actions",
              ].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.flyashAmount}</TableCell>
                    <TableCell>{tx.flyashTons}</TableCell>
                    <TableCell>{tx.bedashAmount}</TableCell>
                    <TableCell>{tx.bedashTons}</TableCell>
                    <TableCell>{tx.totalAmount}</TableCell>

                    <TableCell>
                      <Chip
                        label={tx.paymentMode}
                        color={tx.paymentMode === "cash" ? "warning" : "success"}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>{tx.bankName || "-"}</TableCell>
                    <TableCell>{tx.accountHolder || "-"}</TableCell>
                    <TableCell>{tx.referenceNumber || "-"}</TableCell>

                    <TableCell>
                      <IconButton onClick={() => handleEdit(tx)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton color="error" onClick={() => handleDelete(tx.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= PAGINATION ================= */}
      <Divider sx={{ mt: 1 }} />
      <TablePagination
        component="div"
        count={filteredTransactions.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* ================= ADD DIALOG ================= */}
      <AddBalanceDialog open={openAdd} onClose={() => setOpenAdd(false)} />

      {/* ================= EDIT DIALOG ================= */}
      <Dialog open={!!editTx} onClose={() => setEditTx(null)}>
        <DialogTitle>Edit Balance</DialogTitle>
        <DialogContent>
          <TextField
            label="Flyash Amount"
            fullWidth
            margin="dense"
            value={editTx?.flyashAmount || ""}
            onChange={(e) =>
              setEditTx((prev) =>
                prev ? { ...prev, flyashAmount: e.target.value } : prev
              )
            }
          />
          <TextField
            label="Bedash Amount"
            fullWidth
            margin="dense"
            value={editTx?.bedashAmount || ""}
            onChange={(e) =>
              setEditTx((prev) =>
                prev ? { ...prev, bedashAmount: e.target.value } : prev
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTx(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DELETE CONFIRM ================= */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete this transaction?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BalanceTable;
