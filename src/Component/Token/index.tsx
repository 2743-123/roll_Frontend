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
  Divider,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getTokenAction, deleteTokenAction } from "../../Actions/Auth/TokenAction";
import AddTokenDialog from "./add";
import EditTokenDialog from "./edit";

const TokenPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { tokens, loading, error } = useSelector(
    (state: RootState) => state.token
  );

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [search, setSearch] = useState("");

  /** 🔄 Fetch tokens */
  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  }, [dispatch, selectedUser?.id]);

  /** ✏️ Edit click */
  const handleEditClick = (token: any) => {
    setSelectedToken(token);
    setOpenEditDialog(true);
  };

  /** 🗑 Delete click */
  const handleDeleteClick = (tokenId: number) => {
    if (!selectedUser?.id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pending token?"
    );

    if (confirmDelete) {
      dispatch(deleteTokenAction(tokenId, selectedUser.id));
    }
  };

  /** 🔄 Manual refresh */
  const handleDataRefresh = () => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  };

  /** ❌ No user selected */
  if (!selectedUser)
    return (
      <Typography
        align="center"
        sx={{ mt: 5, color: "text.secondary", fontWeight: 500 }}
      >
        Please select a user to view tokens.
      </Typography>
    );

  /** ⏳ Loading */
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  /** ❌ Error */
  if (error)
    return (
      <Typography color="error" align="center" sx={{ mt: 5 }}>
        {error}
      </Typography>
    );

  /** 🔍 Search filter */
  const filteredTokens = tokens?.filter((token: any) => {
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
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f9fafb 0%, #eef2f6 100%)",
        width: "100%",
      }}
    >
      {/* 🔹 Header */}
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
          Tokens — {selectedUser.name}
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Search Token"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              width: 250,
            }}
          />
          <Button
            variant="contained"
            color="inherit"
            onClick={() => setOpenAddDialog(true)}
            sx={{
              backgroundColor: "white",
              color: "#1976d2",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            + Add Token
          </Button>
        </Box>
      </Box>

      {/* 📋 Table */}
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
              <TableCell>Customer</TableCell>
              <TableCell>Truck No</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Commission</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Carry Forward</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTokens?.length ? (
              filteredTokens.map((token: any) => (
                <TableRow
                  key={token.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f1f5f9", transition: "0.2s" },
                  }}
                >
                  <TableCell>{token.id}</TableCell>
                  <TableCell>{token.customerName}</TableCell>
                  <TableCell>{token.truckNumber}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {token.materialType}
                  </TableCell>
                  <TableCell>{token.weight}</TableCell>
                  <TableCell>{token.ratePerTon}</TableCell>
                  <TableCell>{token.commission}</TableCell>
                  <TableCell>{token.totalAmount}</TableCell>
                  <TableCell>{token.paidAmount}</TableCell>
                  <TableCell>{token.carryForward}</TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={token.status}
                      color={
                        token.status === "completed" ? "success" : "warning"
                      }
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>

                  <TableCell>
                    {new Date(token.createdAt).toLocaleString()}
                  </TableCell>

                  {/* 🔻 Actions */}
                  <TableCell align="center">
                    {/* Delete only if pending */}
                    {token.status === "pending" && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ textTransform: "none", fontWeight: 600, mr: 1 }}
                        onClick={() => handleDeleteClick(token.id)}
                      >
                        Delete
                      </Button>
                    )}

                    {/* Confirm allowed if not completed */}
                    {token.status !== "completed" && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                        onClick={() => handleEditClick(token)}
                      >
                        Confirm Payment
                      </Button>
                    )}

                    {/* Completed */}
                    {token.status === "completed" && (
                      <Chip label="Completed" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No tokens found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ mt: 2 }} />

      {/* Dialogs */}
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
