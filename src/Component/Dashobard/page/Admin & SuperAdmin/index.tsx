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
  Chip,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page on search
  };

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
        (u.role || "").toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <Paper
      elevation={4}
      sx={{
        width: "100%",
        p: 3,
        borderRadius: 4,
        background: "#ffffff",
        minHeight: "80vh",
      }}
    >
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
          <AdminPanelSettingsIcon sx={{ fontSize: 30, color: "#ffb74d" }} />
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
            Admin Management
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search admins..."
            size="small"
            value={search}
            onChange={handleSearch}
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
          {loggedInUser?.role !== "user" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
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
              Add Admin
            </Button>
          )}
        </Box>
      </Box>

      {/* ================= MODALS ================= */}
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
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                { label: "ID", align: "left" },
                { label: "Admin Name", align: "left" },
                { label: "Email", align: "left" },
                { label: "Role", align: "center" },
                { label: "Status", align: "center" },
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
            {filteredUsers.length > 0 ? (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f9fafb" },
                      "& td": { borderBottom: "1px solid #f0f0f0" },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>#{u.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>{u.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{u.email}</TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          backgroundColor: u.role === "superadmin" ? "#f3e5f5" : "#e3f2fd",
                          color: u.role === "superadmin" ? "#6a1b9a" : "#1565c0",
                          border: `1px solid ${u.role === "superadmin" ? "#ce93d8" : "#90caf9"}`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={u.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: u.isActive ? "#e8f5e9" : "#ffebee",
                          color: u.isActive ? "#2e7d32" : "#c62828",
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {loggedInUser?.role !== "user" ? (
                        <>
                          <Tooltip title="Edit Admin">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEdit(u)}
                              size="small"
                              sx={{ mr: 1, backgroundColor: "#f0f7ff", "&:hover": { backgroundColor: "#e3f2fd" } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Admin">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDelete(u.id)}
                              size="small"
                              sx={{ backgroundColor: "#fff0f0", "&:hover": { backgroundColor: "#ffebee" } }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.disabled">No Access</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Admins Found</Typography>
                    <Typography variant="body2">Try adjusting your search criteria.</Typography>
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderBottom: "none" }}
        />
      </Box>
    </Paper>
  );
};

export default AdminList;