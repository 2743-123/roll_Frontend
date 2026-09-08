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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  getBedashListAction,
  confirmBedashAction,
} from "../../Actions/Auth/bedash";
import AddBedashDialog from "./add";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../fonts/NotoSans-Regular";

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
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]); // ⭐ Selection State

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

  // ================= DOUBLE CLICK SELECT =================
  const handleDoubleClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
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

  // ================= PDF GENERATION =================
  const handleDownloadPDF = () => {
    const selectedRows = filteredData.filter((item) =>
      selectedIds.includes(item.id)
    );

    if (!selectedRows.length) {
      alert("Please select rows first by double-clicking on them.");
      return;
    }

    const doc = new jsPDF("landscape");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 32, 39);
    doc.text("Material Inventory Report", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 22);
    doc.text(`Total Selected Records: ${selectedRows.length}`, 14, 27);

    autoTable(doc, {
      startY: 32,
      theme: "grid",
      styles: { 
        fontSize: 8, 
        cellPadding: 3, 
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [20, 48, 59], 
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 20 },   // ID
        1: { halign: "left" },                    // Customer
        2: { halign: "center" },                  // Material
        3: { halign: "right" },                   // Remaining Tons
        4: { halign: "center" },                  // Target Date
        5: { halign: "center" },                  // Custom Date
        6: { halign: "center" },                  // Created At
        7: { halign: "center" },                  // Status
      },
      head: [
        [
          "ID",
          "Customer Name",
          "Material",
          "Remaining Tons",
          "Target Date",
          "Custom Date",
          "Created At",
          "Status",
        ],
      ],
      body: selectedRows.map((item) => [
        `#${item.id}`,
        item.userName,
        item.materialType.toUpperCase(),
        `${Number(item.remainingTons).toFixed(2)} T`,
        formatDateOnly(item.targetDate),
        formatDateOnly(item.customDate),
        formatDateTime(item.createdAt),
        item.status.toUpperCase(),
      ]),
      didDrawPage: function (data: any) {
        const str = "Page " + data.pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      },
    });

    doc.save(`Material-Inventory-${new Date().getTime()}.pdf`);
  };

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
        p: { xs: 1, sm: 3 },
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
          px: { xs: 2, sm: 3 },
          py: 2.5,
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <InventoryIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: "#ffb74d" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
              Material Inventory
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Total Records: <strong>{filteredData.length}</strong> • <span style={{ color: "#ffeb3b" }}>Double tap row to select for PDF</span>
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
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
              width: { xs: "100%", sm: "240px" },
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
            startIcon={<PictureAsPdfIcon />}
            disabled={!selectedIds.length}
            onClick={handleDownloadPDF}
            fullWidth={window.innerWidth < 600}
            sx={{
              backgroundColor: "#ffeb3b",
              color: "#000",
              fontWeight: 700,
              borderRadius: 2,
              px: 2,
              textTransform: "none",
              "&:hover": { backgroundColor: "#fbc02d" },
              "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" }
            }}
          >
            PDF ({selectedIds.length})
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            fullWidth={window.innerWidth < 600}
            sx={{
              backgroundColor: "#4caf50",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              "&:hover": { backgroundColor: "#388e3c" },
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
          overflowX: "auto", // ⭐ Mobile Scroll
        }}
      >
        <Table stickyHeader size="medium" sx={{ minWidth: 1000 }}> {/* ⭐ Fixed min-width for table */}
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
                .map((item) => {
                  const selected = selectedIds.includes(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      onDoubleClick={() => handleDoubleClick(item.id)} // ⭐ Selection Logic
                      sx={{
                        cursor: "pointer",
                        backgroundColor: selected ? "#e3f2fd !important" : "inherit",
                        "&:hover": { backgroundColor: selected ? "#bbdefb !important" : "#f9fafb" },
                        "& td": { borderBottom: "1px solid #f0f0f0" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>
                        #{item.id}
                      </TableCell>
                      
                      <TableCell sx={{ fontWeight: 600, color: "text.primary", whiteSpace: "nowrap" }}>
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

                      <TableCell align="right" sx={{ fontWeight: 700, color: "#2e7d32", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
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
                  );
                })
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