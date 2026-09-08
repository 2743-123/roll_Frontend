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
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
    if (window.confirm("Are you sure you want to confirm this material?")) {
      await dispatch(confirmBedashAction(id));
    }
  };

  /** 📅 Date Formatting Helpers */
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  const formatDateOnly = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const filteredData: BedashItem[] =
    data?.filter((item) => {
      const query = search.toLowerCase();
      return (
        item.userName?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query) ||
        item.materialType?.toLowerCase().includes(query)
      );
    }) || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "#ffffff",
        width: "100%",
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
          <InventoryIcon sx={{ fontSize: 28, color: "#ffb74d" }} />
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
            Material Inventory
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search material..."
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
            onClick={() => setOpenAdd(true)}
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
            Add Material
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
                { label: "ID", align: "left" },
                { label: "Customer Name", align: "left" },
                { label: "Material", align: "center" },
                { label: "Remaining Tons", align: "right" },
                { label: "Target Date", align: "left" },
                { label: "Custom Date", align: "left" },
                { label: "Created At", align: "left" },
                { label: "Status", align: "center" },
                { label: "Action", align: "center" },
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
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f9fafb" },
                      "& td": { borderBottom: "1px solid #f0f0f0" },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>
                      #{item.id}
                    </TableCell>
                    
                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                      {item.userName}
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={item.materialType}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          backgroundColor: item.materialType.toLowerCase() === "bedash" ? "#fff3e0" : "#f5f5f5",
                          color: item.materialType.toLowerCase() === "bedash" ? "#ed6c02" : "#616161",
                          border: `1px solid ${item.materialType.toLowerCase() === "bedash" ? "#ffcc80" : "#e0e0e0"}`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, color: "#2e7d32", fontSize: "0.95rem" }}>
                      {Number(item.remainingTons).toFixed(2)} T
                    </TableCell>

                    <TableCell sx={{ color: "text.secondary", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {formatDateOnly(item.targetDate)}
                    </TableCell>
                    
                    <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {formatDateOnly(item.customDate)}
                    </TableCell>
                    
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {formatDateTime(item.createdAt)}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          backgroundColor: item.status === "completed" ? "#e8f5e9" : "#ffebee",
                          color: item.status === "completed" ? "#2e7d32" : "#c62828",
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {item.status === "pending" ? (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon fontSize="small" />}
                          onClick={() => handleConfirm(item.id)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 1.5,
                            boxShadow: "none",
                            "&:hover": { boxShadow: "0 2px 8px rgba(46,125,50,0.3)" },
                          }}
                        >
                          Confirm
                        </Button>
                      ) : (
                        <Chip label="Confirmed" size="small" variant="outlined" color="success" sx={{ border: "none", fontWeight: 600 }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Materials Found</Typography>
                    <Typography variant="body2">Try adjusting your search query or add a new material.</Typography>
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
          count={filteredData.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderBottom: "none" }}
        />
      </Box>

      {/* ➕ Add Dialog */}
      <AddBedashDialog open={openAdd} onClose={() => setOpenAdd(false)} />
    </Paper>
  );
};

export default BedashList;