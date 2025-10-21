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

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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

  if (loading) return <p>Loading...</p>;

  return (
    <Paper sx={{ width: "100%", padding: 2 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TextField
          label="Search Transactions"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Balance
        </Button>
        <AddBalanceDialog open={openAdd} onClose={handleCloseAdd} />
      </div>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="balance table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Flyash (₹)</TableCell>
              <TableCell align="right">Flyash (Tons)</TableCell>
              <TableCell align="right">Bedash (₹)</TableCell>
              <TableCell align="right">Bedash (Tons)</TableCell>
              <TableCell align="right">Total Amount (₹)</TableCell>
              <TableCell align="center">Payment Mode</TableCell>
              <TableCell align="center">Bank Name</TableCell>
              <TableCell align="center">Account Holder</TableCell>
              <TableCell align="center">Reference No.</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((tx) => (
                <TableRow hover key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell align="right">{tx.flyashAmount}</TableCell>
                  <TableCell align="right">{tx.flyashTons}</TableCell>
                  <TableCell align="right">{tx.bedashAmount}</TableCell>
                  <TableCell align="right">{tx.bedashTons}</TableCell>
                  <TableCell align="right">{tx.totalAmount}</TableCell>
                  <TableCell align="center">
                    {tx.paymentMode === "cash" ? "Cash" : "Online"}
                  </TableCell>
                  <TableCell align="center">{tx.bankName || "-"}</TableCell>
                  <TableCell align="center">
                    {tx.accountHolder || "-"}
                  </TableCell>
                  <TableCell align="center">
                    {tx.referenceNumber || "-"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(tx)}>
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
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={filteredTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default BalanceTable;
