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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddUsers from "../Users/Add";
import EditUser from "../Users/Update";
import DeleteUserDialog from "../Users/delete";
import { deleteUserAction } from "../../../../Actions/Auth/user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  isActive: boolean;
}

const AdminList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState("");
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = React.useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setSelectedUser(null);
    setOpenEdit(false);
  };
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
        await dispatch(deleteUserAction(deleteUserId));
        setDeleteUserId(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const userList: User[] = Array.isArray(users)
    ? users.filter((u) => u && u.id)
    : [];

  const filteredUsers = userList
    .filter((u) => u.role === "admin" || u.role === "superadmin")
    .filter(
      (u) =>
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.role || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Paper
      sx={{
        width: "100%",
        p: 3,
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        background: "linear-gradient(180deg, #ffffff 0%, #f5faff 100%)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2" }}>
          👥 Admin & SuperAdmin List
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Search Users"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          {loggedInUser?.role !== "user" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  transform: "scale(1.05)",
                  background: "linear-gradient(90deg, #42a5f5 0%, #64b5f6 100%)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {/* Modals */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        userName={userList.find((u) => u.id === deleteUserId)?.name || ""}
      />
      <AddUsers open={openAdd} onClose={handleCloseAdd} />
      {selectedUser && (
        <EditUser open={openEdit} onClose={handleCloseEdit} user={selectedUser} />
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(90deg, #bbdefb 0%, #e3f2fd 100%)",
              }}
            >
              {["ID", "Name", "Email", "Role", "Status", "Actions"].map(
                (header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 700,
                      color: "#0d47a1",
                      fontSize: "0.95rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f1f9ff",
                        transform: "scale(1.01)",
                      },
                    }}
                  >
                    <TableCell>{u.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {u.role}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: u.isActive ? "#4caf50" : "#f44336",
                          }}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {loggedInUser?.role !== "user" && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(u)}
                            sx={{
                              transition: "all 0.2s ease",
                              "&:hover": { transform: "scale(1.2)" },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDelete(u.id)}
                            sx={{
                              transition: "all 0.2s ease",
                              "&:hover": { transform: "scale(1.2)" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
        sx={{
          mt: 2,
          "& .MuiTablePagination-actions": {
            color: "#1976d2",
          },
        }}
      />
    </Paper>
  );
};

export default AdminList;
