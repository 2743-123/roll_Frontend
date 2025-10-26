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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { AppDispatch, RootState } from "../../store";
import { getBalanceAction } from "../../Actions/Auth/balance";
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

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState("");
  const [openAdd, setOpenAdd] = React.useState(false);

  React.useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getBalanceAction(selectedUser.id));
    }
  }, [selectedUser, dispatch]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };
  const handleAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleEdit = (tx: Transaction) => console.log("Edit transaction:", tx);
  const handleDelete = (id: number) => console.log("Delete transaction:", id);

  const filteredTransactions: Transaction[] =
    data?.transactions?.filter((tx) => {
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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        background: "linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)", // light blue table background
        p: 2,
      }}
    >
      {/* 🔹 Header */}
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
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Balance Transactions
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Search Transactions"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              width: 250,
            }}
          />
          <Button
            variant="contained"
            color="inherit"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              backgroundColor: "white",
              color: "#1976d2",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            Add Balance
          </Button>
        </Box>
      </Box>

      {/* 📋 Table */}
      <TableContainer
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fdfdfdff",
        }}
      >
        <Table stickyHeader aria-label="balance table">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
                "& th": { color: "white", fontWeight: 600 },
              }}
            ></TableRow>
            <TableRow
              sx={{
                backgroundColor: "#0f4262ff",
                "& th": { color: "blue", fontWeight: 500 },
              }}
            >
              {[
                "Date",
                "Flyash (₹)",
                "Flyash (Tons)",
                "Bedash (₹)",
                "Bedash (Tons)",
                "Total Amount (₹)",
                "Payment Mode",
                "Bank Name",
                "Account Holder",
                "Reference No.",
                "Actions",
              ].map((head) => (
                <TableCell key={head}>{head}</TableCell>
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
                    sx={{ "&:hover": { backgroundColor: "#2d79a2ff" } }}
                  >
                    <TableCell>{tx.date}</TableCell>
                    <TableCell align="right">{tx.flyashAmount}</TableCell>
                    <TableCell align="right">{tx.flyashTons}</TableCell>
                    <TableCell align="right">{tx.bedashAmount}</TableCell>
                    <TableCell align="right">{tx.bedashTons}</TableCell>
                    <TableCell align="right">{tx.totalAmount}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={tx.paymentMode}
                        color={
                          tx.paymentMode === "cash" ? "warning" : "success"
                        }
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="center">{tx.bankName || "-"}</TableCell>
                    <TableCell align="center">
                      {tx.accountHolder || "-"}
                    </TableCell>
                    <TableCell align="center">
                      {tx.referenceNumber || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="secondary"
                        onClick={() => handleEdit(tx)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(tx.id)}
                      >
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

      {/* 🔹 Pagination */}
      <Divider sx={{ mt: 1 }} />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: "#e3f2fd",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      />

      {/* ➕ Add Dialog */}
      <AddBalanceDialog open={openAdd} onClose={handleCloseAdd} />
    </Paper>
  );
};

export default BalanceTable;
