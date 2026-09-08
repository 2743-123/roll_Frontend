import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  getTokenAction,
  deleteTokenAction,
} from "../../Actions/Auth/TokenAction";
import AddTokenDialog from "./add";
import EditTokenDialog from "./edit";

interface Token {
  id: number;
  customerName: string;
  truckNumber: string;
  materialType: string;
  weight: number | string;
  ratePerTon: number | string;
  commission: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  carryForward: number | string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
}

const TokenPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { tokens, loading, error } = useSelector(
    (state: RootState) => state.token
  );

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  }, [dispatch, selectedUser?.id]);

  const handleEditClick = (token: Token) => {
    setSelectedToken(token);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (tokenId: number) => {
    if (!selectedUser?.id) return;
    if (window.confirm("Are you sure you want to delete this pending token?")) {
      dispatch(deleteTokenAction(tokenId, selectedUser.id));
    }
  };

  const handleDataRefresh = () => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  };

  const formatCur = (val: number | string) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  // 📅 Date Formatting Helper
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  if (!selectedUser)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: "center", bgcolor: "#ffffff", maxWidth: 400 }}>
          <Typography variant="h6" color="text.primary" fontWeight={700} gutterBottom>
            No User Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a customer from the top navigation dropdown to manage their tokens.
          </Typography>
        </Paper>
      </Box>
    );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" variant="h6" sx={{ mt: 5 }}>
        {error}
      </Typography>
    );

  const filteredTokens = tokens?.filter((token: Token) => {
    const query = search.toLowerCase();
    return (
      token.customerName?.toLowerCase().includes(query) ||
      token.truckNumber?.toLowerCase().includes(query) ||
      token.materialType?.toLowerCase().includes(query) ||
      token.status?.toLowerCase().includes(query)
    );
  });

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
          <ReceiptIcon sx={{ fontSize: 30, color: "#81c784" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
              Tokens Management
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Active Customer: <strong>{selectedUser.name}</strong>
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search tokens..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              width: { xs: "100%", sm: "280px" },
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
            onClick={() => setOpenAddDialog(true)}
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
            Add Token
          </Button>
        </Box>
      </Box>

      {/* ================= TABLE CONTAINER ================= */}
      <TableContainer
        sx={{
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          backgroundColor: "white",
          maxHeight: "68vh",
          overflowY: "auto",
        }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {[
                { label: "ID", align: "left" },
                { label: "Customer", align: "left" },
                { label: "Truck No", align: "left" },
                { label: "Material", align: "left" },
                { label: "Weight", align: "right" },
                { label: "Rate", align: "right" },
                { label: "Commission", align: "right" },
                { label: "Total", align: "right" },
                { label: "Paid", align: "right" },
                { label: "Carry Fwd", align: "right" },
                { label: "Status", align: "center" },
                { label: "Dates (Cr / Up / Co)", align: "left" },
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
            {filteredTokens?.length ? (
              filteredTokens.map((token: Token) => (
                <TableRow
                  key={token.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f9fafb" },
                    "& td": { borderBottom: "1px solid #f0f0f0" },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>#{token.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>{token.customerName}</TableCell>
                  <TableCell>
                    <Chip label={token.truckNumber || "N/A"} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                  </TableCell>
                  <TableCell sx={{ textTransform: "capitalize", fontWeight: 600, color: token.materialType?.toLowerCase() === 'bedash' ? '#ed6c02' : '#757575' }}>
                    {token.materialType}
                  </TableCell>
                  
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{token.weight} T</TableCell>
                  <TableCell align="right">{formatCur(token.ratePerTon)}</TableCell>
                  <TableCell align="right">{formatCur(token.commission)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#2e7d32" }}>{formatCur(token.totalAmount)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCur(token.paidAmount)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={Number(token.carryForward) < 0 ? "error.main" : "text.secondary"}
                    >
                      {formatCur(token.carryForward)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={token.status}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 700,
                        backgroundColor: 
                          token.status === "completed" ? "#e8f5e9" : 
                          token.status === "pending" ? "#ffebee" : "#fff3e0",
                        color: 
                          token.status === "completed" ? "#2e7d32" : 
                          token.status === "pending" ? "#c62828" : "#ef6c00",
                      }}
                    />
                  </TableCell>

                  {/* 📅 Dates Box */}
                  <TableCell align="left" sx={{ whiteSpace: "nowrap" }}>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {token.createdAt && (
                        <Typography variant="caption" sx={{ display: "flex", gap: 1, color: "text.secondary" }}>
                          <span style={{ fontWeight: 700, minWidth: "20px" }}>Cr:</span> {formatDateTime(token.createdAt)}
                        </Typography>
                      )}
                      {token.updatedAt && (
                        <Typography variant="caption" sx={{ display: "flex", gap: 1, color: "primary.main" }}>
                          <span style={{ fontWeight: 700, minWidth: "20px" }}>Up:</span> {formatDateTime(token.updatedAt)}
                        </Typography>
                      )}
                      {token.confirmedAt && (
                        <Typography variant="caption" sx={{ display: "flex", gap: 1, color: "success.main" }}>
                          <span style={{ fontWeight: 700, minWidth: "20px" }}>Co:</span> {formatDateTime(token.confirmedAt)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {token.status === "pending" && (
                      <Tooltip title="Delete Token">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(token.id)}
                          sx={{ minWidth: "36px", height: "32px", p: 0, mr: 1, borderRadius: 1.5 }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}

                    {token.status !== "completed" ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<PaymentIcon fontSize="small" />}
                        onClick={() => handleEditClick(token)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 1.5,
                          boxShadow: "none",
                          height: "32px",
                          "&:hover": { boxShadow: "0 2px 8px rgba(25,118,210,0.3)" },
                        }}
                      >
                        Action / Pay
                      </Button>
                    ) : (
                      <Chip label="Cleared" size="small" variant="outlined" color="success" sx={{ border: "none", fontWeight: 700 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ opacity: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>No Tokens Found</Typography>
                    <Typography variant="body2">Try adjusting your search query or add a new token.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= DIALOGS ================= */}
      <AddTokenDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />

      {selectedToken && (
        <EditTokenDialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          token={selectedToken}
          onRefresh={handleDataRefresh}
        />
      )}
    </Paper>
  );
};

export default TokenPage;