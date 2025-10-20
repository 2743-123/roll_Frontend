import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddUsers from "./Add";
import EditUser from "./Update";
import { deleteUserAction } from "../../../../Actions/Auth/user";
import DeleteUserDialog from "./delete";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  isActive: boolean;
}

const Users: React.FC = () => {
  const { users } = useSelector((state: RootState) => state.user);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState("");
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  // Handle add user modal
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  // Handle edit user modal
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setSelectedUser(null);
    setOpenEdit(false);
  };

  const [deleteUserId, setDeleteUserId] = React.useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleOpenDelete = (userId: number) => {
    setDeleteUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteUserId(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteUserId !== null) {
      try {
        await dispatch(deleteUserAction(deleteUserId)); // tumhara redux delete action
        setDeleteUserId(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Pagination handlers
  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Filter users safely
  const userList: User[] = Array.isArray(users)
    ? users.filter((u) => u && u.id)
    : [];

  const filteredUsers = userList.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Paper sx={{ width: "100%", padding: 2 }}>
      {/* Header Section */}
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
          onChange={handleSearch}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add User
        </Button>
      </div>
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        userName={userList.find((u) => u.id === deleteUserId)?.name || ""}
      />

      {/* Add Modal */}
      <AddUsers open={openAdd} onClose={handleCloseAdd} />

      {/* Edit Modal */}
      {selectedUser && (
        <EditUser
          open={openEdit}
          onClose={handleCloseEdit}
          user={selectedUser}
        />
      )}

      {/* Table Section */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Is Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: u.isActive ? "green" : "red",
                          }}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDelete(u.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        count={filteredUsers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default Users;
