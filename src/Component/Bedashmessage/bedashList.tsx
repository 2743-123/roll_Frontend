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

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
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

  if (loading) return <p>Loading...</p>;

  return (
    <Paper sx={{ width: "100%", padding: 2 }}>
      {/* 🔍 Search + Add */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TextField
          label="Search Material"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAdd(true)}
        >
          Add Material
        </Button>
      </div>

      {/* 📋 Table */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="bedash table">
          <TableHead>
            <TableRow>
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
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow hover key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.userName}</TableCell>
                  <TableCell>{item.materialType}</TableCell>
                  <TableCell>{item.remainingTons.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={
                        item.status === "completed" ? "success" : "warning"
                      }
                      size="small"
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
                      >
                        Confirm
                      </Button>
                    ) : (
                      <Chip label="Completed" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddBedashDialog open={openAdd} onClose={() => setOpenAdd(false)} />
    </Paper>
    
  );
};

export default BedashList;
