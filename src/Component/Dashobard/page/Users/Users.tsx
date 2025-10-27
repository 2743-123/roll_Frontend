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
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddUsers from "./Add";
import EditUser from "./Update";
import DeleteUserDialog from "./delete";
import { deleteUserAction } from "../../../../Actions/Auth/user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  isActive: boolean;
  createdBy?: number | null; // 🆕 added
}

const Users: React.FC = () => {
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
      await dispatch(deleteUserAction(deleteUserId));
      setDeleteUserId(null);
      setDeleteDialogOpen(false);
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
    .filter((u) => u.role === "user")
    .filter(
      (u) =>
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.role || "").toLowerCase().includes(search.toLowerCase())
    );

  // 🆕 Helper to get creator name/email
  const getCreatorName = (createdById?: number | null): string => {
    if (!createdById) return "—";
    const creator = userList.find((u) => u.id === createdById);
    if (creator) {
      return creator.email || creator.name || `ID: ${createdById}`;
    }
    return `ID: ${createdById}`;
  };
  const getCreatorRole = (createdById?: number | null): string => {
    if (!createdById) return "—";
    const creator = userList.find((u) => u.id === createdById);
    if (creator) {
      return creator.role || creator.name || `ID: ${createdById}`;
    }
    return `ID: ${createdById}`;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        background: "linear-gradient(135deg, #f9fafb 0%, #eef2f6 100%)",
        p: 2,
      }}
    >
      {/* 🔹 Header Section */}
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
          User Management
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Search Users"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              width: 250,
            }}
          />
          {loggedInUser?.role !== "user" && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                backgroundColor: "white",
                color: "#1976d2",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {/* 🔹 Add/Edit/Delete Dialogs */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        userName={userList.find((u) => u.id === deleteUserId)?.name || ""}
      />

      <AddUsers open={openAdd} onClose={handleCloseAdd} />

      {selectedUser && (
        <EditUser
          open={openEdit}
          onClose={handleCloseEdit}
          user={selectedUser}
        />
      )}

      {/* 🔹 Table Section */}
      <TableContainer
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
                "& th": { color: "blue", fontWeight: 600 },
              }}
            >
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              {loggedInUser?.role === "superadmin" && (
                <>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created By Role</TableCell>
                </>
              )}
              <TableCell align="center">Actions</TableCell>
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
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        transition: "0.2s",
                      },
                    }}
                  >
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {u.role}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: u.isActive ? "green" : "red",
                          }}
                        />
                        <Typography variant="body2">
                          {u.isActive ? "Active" : "Inactive"}
                        </Typography>
                      </Box>
                    </TableCell>
                    {loggedInUser?.role === "superadmin" && (
                      <>
                        <TableCell>{getCreatorName(u.createdBy)}</TableCell>
                        <TableCell>{getCreatorRole(u.createdBy)}</TableCell>
                      </>
                    )}
                    {/* 🆕 */}
                    <TableCell align="center">
                      {loggedInUser?.role !== "user" && (
                        <>
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
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={2}>
                    No users found
                  </Typography>
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
        count={filteredUsers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        component="div"
        sx={{
          backgroundColor: "white",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      />
    </Paper>
  );
};

export default Users;
