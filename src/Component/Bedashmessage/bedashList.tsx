import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Button,
  Chip,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  getBedashListAction,
  confirmBedashAction,
} from "../../Actions/Auth/bedash";
import AddBedashDialog from "./add";

interface BedashItem {
  id: number;
  userName: string;
  materialType: string;
  remainingTons: number;
  status: "pending" | "completed";
  customDate: string | null;
  targetDate: string;
  createdAt: string;
}

const BedashList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.bedash);
  const [openAdd, setOpenAdd] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    dispatch(getBedashListAction());
  }, [dispatch]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleConfirm = async (id: number) => {
    await dispatch(confirmBedashAction(id));
  };

  const filteredData: BedashItem[] =
    data?.filter((item) => {
      const query = search.toLowerCase();
      return (
        item.userName.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.materialType.toLowerCase().includes(query)
      );
    }) || [];

  if (loading) {
    return (
      <Box
        sx={{
          textAlign: "center",
          p: 5,
          fontWeight: 500,
          color: "text.secondary",
        }}
      >
        Loading...
      </Box>
    );
  }

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
          Bedash Material List
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Search Material"
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
            onClick={() => setOpenAdd(true)}
            sx={{
              backgroundColor: "white",
              color: "#1976d2",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            Add Material
          </Button>
        </Box>
      </Box>

      {/* 📋 Table Section */}
      <TableContainer
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <Table stickyHeader aria-label="bedash table">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
                "& th": { color: "blue", fontWeight: 600 },
              }}
            >
              <TableCell>ID</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Material Type</TableCell>
              <TableCell>Remaining Tons</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Custom Date</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        transition: "0.2s",
                      },
                    }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.userName}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {item.materialType}
                    </TableCell>
                    <TableCell>{item.remainingTons.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={
                          item.status === "completed" ? "success" : "warning"
                        }
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>{item.customDate || "-"}</TableCell>
                    <TableCell>{item.targetDate}</TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {item.status === "pending" ? (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleConfirm(item.id)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Confirm
                        </Button>
                      ) : (
                        <Chip label="Completed" color="success" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No Bedash materials found
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
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: "white",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      />

      {/* ➕ Add Dialog */}
      <AddBedashDialog open={openAdd} onClose={() => setOpenAdd(false)} />
    </Paper>
  );
};

export default BedashList;
