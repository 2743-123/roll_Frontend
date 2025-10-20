import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
// import { addBalance, updateBalance, deleteBalance } from "../../../slices/balanceSlice";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBalanceDialog from "./AddBalance";
import { getBalanceAction } from "../../Actions/Auth/balance";

interface BalanceType {
  name: string;
  total: string;
  used: string;
  remaining: string;
}

export default function BalanceTable() {
  // ✅ Get data from Redux reducer

  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.balance);
  const { selectedUser } = useSelector((state: RootState) => state.user);

  React.useEffect(() => {
    const userId = selectedUser?.id;
    if (userId) dispatch(getBalanceAction(userId));
  }, [selectedUser, dispatch]);

  // Example data structure coming from reducer:
  // balance = {
  //   bedash: { total: '250.00', used: '0.00', remaining: '250.00' },
  //   flyash: { total: '333.33', used: '0.00', remaining: '333.33' },
  //   user: 6
  // }

  // Convert reducer data into array for table
  const balanceList: BalanceType[] = data
    ? [
        { name: "Bedash", ...data.bedash },
        { name: "Flyash", ...data.flyash },
      ]
    : [];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState("");

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

  const [openAdd, setOpenAdd] = React.useState(false);

  const handleAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  // ✅ Button actions
  // const handleAdd = () => {
  //   console.log("Add new balance");
  //   // dispatch(addBalance(...))
  // };

  const handleEdit = (row: BalanceType) => {
    console.log("Edit balance:", row);
    // dispatch(updateBalance(...))
  };

  const handleDelete = (name: string) => {
    console.log("Delete balance:", name);
    // dispatch(deleteBalance(name))
  };

  // ✅ Filter balances
  const filteredBalances = balanceList.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Paper sx={{ width: "100%", padding: 2 }}>
      {/* 🔍 Search + Add Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
        />
        <AddBalanceDialog open={openAdd} onClose={handleCloseAdd} />

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Balance
        </Button>
      </div>

      {/* 📋 Table */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="balance table">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Used</TableCell>
              <TableCell align="right">Remaining</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBalances
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.total}</TableCell>
                  <TableCell align="right">{row.used}</TableCell>
                  <TableCell align="right">{row.remaining}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📄 Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={filteredBalances.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
