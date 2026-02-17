import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  TextField,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getAdminTokensAction } from "../../../../Actions/Auth/TokenAction";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../../fonts/NotoSans-Regular";
/** 🔹 Token type */
interface AdminToken {
  tokenId: number;
  customerName: string;
  truckNumber: string;
  materialType: string;
  weight: string;
  carryForward: string;
  status: "pending" | "updated" | "completed";
  userId: number;
  userName: string;
  remainingTons: string;
  createdAt: string;
  confirmedAt: string | null;
}

const AllUserTokens: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, totalTokens, loading, error } = useSelector(
    (state: RootState) => state.adminTokenReducer,
  );

  const [search, setSearch] = useState("");

  /** ⭐ drag selection */
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(getAdminTokensAction());
  }, [dispatch]);

  const tokens: AdminToken[] = data ?? [];

  /** 🔹 Status color */
  const getStatusColor = (status: string) => {
    if (status === "completed") return "success";
    if (status === "updated") return "warning";
    return "default";
  };

  /** 🔍 Search filter */
  const filteredTokens = tokens.filter((t) => {
    const q = search.toLowerCase();

    return (
      (t.customerName ?? "").toLowerCase().includes(q) ||
      (t.userName ?? "").toLowerCase().includes(q) ||
      (t.truckNumber ?? "").toLowerCase().includes(q) ||
      (t.materialType ?? "").toLowerCase().includes(q) ||
      (t.status ?? "").toLowerCase().includes(q)
    );
  });

  /** ⭐ drag start */
  const handleMouseDown = (id: number) => {
    setIsDragging(true);
    setSelectedIds([id]);
  };

  /** ⭐ drag enter */
  const handleMouseEnter = (id: number) => {
    if (!isDragging) return;

    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  /** ⭐ drag end */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ================= PDF DOWNLOAD =================

  const handleDownloadPDF = () => {
    const selectedTokens = filteredTokens.filter((t) =>
      selectedIds.includes(t.tokenId),
    );

    if (selectedTokens.length === 0) {
      alert("Please select at least one row / કૃપા કરીને એક રો પસંદ કરો");
      return;
    }

    const doc = new jsPDF();

    // ⭐ FONT SET
    doc.setFont("NotoSansGujarati-Regular", "normal");
    doc.setFontSize(14);

    doc.text("Admin Token Report / એડમિન ટોકન રિપોર્ટ", 14, 15);

    autoTable(doc, {
      startY: 22,
      styles: {
        font: "NotoSansGujarati-Regular", // ⭐ MUST
        fontSize: 10,
      },
      head: [
        [
          "User",
          "Customer ",
          "Truck",
          "Material",
          "Weight",
          "Carry ₹",
          "Remaining Tons",
          "Created Date",
          "Confirmed Date",
          "Status",
        ],
      ],
      body: selectedTokens.map((t) => [
        t.userName,
        t.customerName,
        t.truckNumber,
        t.materialType,
        t.weight,
        `₹${t.carryForward}`,
        t.remainingTons,
        new Date(t.createdAt).toLocaleString(),
        t.confirmedAt ? new Date(t.confirmedAt).toLocaleString() : "-",
        t.status.toUpperCase(),
      ]),
    });

    doc.save("Token-Report.pdf");
  };

  // =================================================

  return (
    <Box p={3} onMouseUp={handleMouseUp}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Admin Token Report
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Total Tokens: {totalTokens}
      </Typography>

      {/* 🔍 Search */}
      <Box mb={2}>
        <TextField
          label="Search..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* 📄 PDF Button */}
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedIds.length === 0}
          onClick={handleDownloadPDF}
        >
          Download Selected PDF
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#1976d2" }}>
              <TableCell sx={{ color: "#fff" }}>User</TableCell>
              <TableCell sx={{ color: "#fff" }}>Customer</TableCell>
              <TableCell sx={{ color: "#fff" }}>Truck</TableCell>
              <TableCell sx={{ color: "#fff" }}>Material</TableCell>
              <TableCell sx={{ color: "#fff" }}>Weight</TableCell>
              <TableCell sx={{ color: "#fff" }}>Carry ₹</TableCell>
              <TableCell sx={{ color: "#fff" }}>Remaining Tons</TableCell>
              <TableCell sx={{ color: "#fff" }}>Created</TableCell>
              <TableCell sx={{ color: "#fff" }}>Confirmed</TableCell>
              <TableCell sx={{ color: "#fff" }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTokens.map((t) => {
              const selected = selectedIds.includes(t.tokenId);

              return (
                <TableRow
                  key={t.tokenId}
                  hover
                  onMouseDown={() => handleMouseDown(t.tokenId)}
                  onMouseEnter={() => handleMouseEnter(t.tokenId)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selected ? "#e3f2fd" : "inherit",
                  }}
                >
                  <TableCell>{t.userName}</TableCell>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.truckNumber}</TableCell>
                  <TableCell>{t.materialType}</TableCell>
                  <TableCell>{t.weight}</TableCell>
                  <TableCell>₹{t.carryForward}</TableCell>
                  <TableCell>{t.remainingTons}</TableCell>
                  <TableCell>
                    {new Date(t.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {t.confirmedAt
                      ? new Date(t.confirmedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.status.toUpperCase()}
                      color={getStatusColor(t.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AllUserTokens;
