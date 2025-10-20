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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getTokenAction } from "../../Actions/Auth/TokenAction";
import AddTokenDialog from "./add";
import EditTokenDialog from "./edit"; // Edit dialog import

const TokenPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { tokens, loading, error } = useSelector(
    (state: RootState) => state.token
  );

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);

  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  }, [dispatch, selectedUser?.id]);

  const handleEditClick = (token: any) => {
    setSelectedToken(token);
    setOpenEditDialog(true);
  };

  const handleDataRefresh = () => {
    if (selectedUser?.id) {
      dispatch(getTokenAction(selectedUser.id));
    }
  };

  if (!selectedUser)
    return <Typography align="center">Select a user first</Typography>;
  if (loading)
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Tokens for: {selectedUser.name}</Typography>
        <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
          + Add Token
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "black" }}>ID</TableCell>
              <TableCell sx={{ color: "black" }}>Customer</TableCell>
              <TableCell sx={{ color: "black" }}>Truck No</TableCell>
              <TableCell sx={{ color: "black" }}>Material</TableCell>
              <TableCell sx={{ color: "black" }}>Weight</TableCell>
              <TableCell sx={{ color: "black" }}>Rate</TableCell>
              <TableCell sx={{ color: "black" }}>Commission</TableCell>
              <TableCell sx={{ color: "black" }}>Total</TableCell>
              <TableCell sx={{ color: "black" }}>Paid</TableCell>
              <TableCell sx={{ color: "black" }}>Carry Forward</TableCell>
              <TableCell sx={{ color: "black" }}>Status</TableCell>
              <TableCell sx={{ color: "black" }}>Date</TableCell>
              <TableCell sx={{ color: "black" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tokens?.length ? (
              tokens.map((token: any) => (
                <TableRow
                  key={token.id}
                  hover
                  sx={{ "&:hover": { backgroundColor: "#e3f2fd" } }}
                >
                  <TableCell>{token.id}</TableCell>
                  <TableCell>{token.customerName}</TableCell>
                  <TableCell>{token.truckNumber}</TableCell>
                  <TableCell>{token.materialType}</TableCell>
                  <TableCell>{token.weight}</TableCell>
                  <TableCell>{token.ratePerTon}</TableCell>
                  <TableCell>{token.commission}</TableCell>
                  <TableCell>{token.totalAmount}</TableCell>
                  <TableCell>{token.paidAmount}</TableCell>
                  <TableCell>{token.carryForward}</TableCell>
                  <TableCell
                    sx={{
                      color: token.status === "completed" ? "green" : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {token.status.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(token.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {token.status !== "completed" && (
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => handleEditClick(token)}
                      >
                        Confirm Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  No tokens found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Box>
  );
};

export default TokenPage;
