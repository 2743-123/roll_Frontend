import React, { useState, useEffect } from "react";
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

  // Track updated token status locally
  const [tokenStatus, setTokenStatus] = useState(token.status);

  useEffect(() => {
    setTokenStatus(token.status); // update status if token changes
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

    // Simulate backend response (you can replace this with actual new status)
    setTokenStatus("updated"); // <-- Enable confirm button after update
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

  const isConfirmDisabled = tokenStatus === "pending"; // Disable if pending

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Token (#{token.id})</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid>
              <TextField
                label="Weight (tons)"
                name="weight"
                fullWidth
                value={formData.weight}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid>
              <TextField
                label="Rate / Ton"
                name="ratePerTon"
                fullWidth
                value="180"
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid>
              <TextField
                label="Commission"
                name="commission"
                fullWidth
                value={formData.commission}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid>
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
            <Typography variant="subtitle1">
              💰 <strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        <Button variant="outlined" color="error" onClick={onClose}>
          Cancel
        </Button>

        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleUpdate}
          >
            Update Token
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmPayment}
            disabled={isConfirmDisabled} // disable confirm until update
          >
            Confirm Payment
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditTokenDialog;
