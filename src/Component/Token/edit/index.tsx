import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import {
  confirmPaymentAction,
  updateTokenAction,
} from "../../../Actions/Auth/TokenAction";

interface EditTokenDialogProps {
  open: boolean;
  onClose: () => void;
  token: any;
  onRefresh: () => void;
}

const EditTokenDialog: React.FC<EditTokenDialogProps> = ({
  open,
  onClose,
  token,
  onRefresh,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    weight: token.weight || "",
    ratePerTon: token.ratePerTon || 180,
    commission: token.commission || 0,
    paidAmount: token.paidAmount || 0,
  });

  const [tokenStatus, setTokenStatus] = useState(token.status);

  useEffect(() => {
    setTokenStatus(token.status);
  }, [token.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    await dispatch(
      updateTokenAction({
        tokenId: token.id,
        weight: formData.weight,
        ratePerTon: formData.ratePerTon,
        commission: formData.commission,
        paidAmount: formData.paidAmount,
        userId: token.user.id,
      })
    );
    setTokenStatus("updated");
    onRefresh();
  };

  const handleConfirmPayment = async () => {
    await dispatch(
      confirmPaymentAction({
        tokenId: token.id,
        paidAmount: formData.paidAmount,
      })
    );
    onClose();
    onRefresh();
  };

  const totalAmount =
    Number(formData.weight) * Number(formData.ratePerTon) +
    Number(formData.commission);

  const isConfirmDisabled = tokenStatus === "pending";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          background: "#f4f6f8",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#1976d2" }}>
        Edit Token (#{token.id})
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid >
              <TextField
                label="Weight (tons)"
                name="weight"
                fullWidth
                value={formData.weight}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid >
              <TextField
                label="Rate / Ton"
                name="ratePerTon"
                fullWidth
                value={formData.ratePerTon}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid >
              <TextField
                label="Commission"
                name="commission"
                fullWidth
                value={formData.commission}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid >
              <TextField
                label="Paid Amount"
                name="paidAmount"
                fullWidth
                value={formData.paidAmount}
                onChange={handleChange}
                type="number"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              💰 Total Amount:{" "}
              <span style={{ color: "#43a047" }}>₹{totalAmount.toFixed(2)}</span>
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            "&:hover": { backgroundColor: "#ffebee", transform: "scale(1.05)" },
          }}
        >
          Cancel
        </Button>

        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{
              mr: 2,
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #64b5f6 0%, #81d4fa 100%)",
                transform: "scale(1.05)",
              },
            }}
            onClick={handleUpdate}
          >
            Update Token
          </Button>

          <Button
            variant="contained"
            color="success"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(90deg, #43a047 0%, #66bb6a 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #66bb6a 0%, #81c784 100%)",
                transform: "scale(1.05)",
              },
            }}
            onClick={handleConfirmPayment}
            disabled={isConfirmDisabled}
          >
            Confirm Payment
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditTokenDialog;
