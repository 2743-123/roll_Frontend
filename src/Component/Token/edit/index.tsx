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

  /** 📦 Form State */
  const [formData, setFormData] = useState({
    truckNumber: "",
    weight: "",
    ratePerTon: 180, // ⭐ fixed rate
    commission: 0,
    paidAmount: 0,
  });

  const [tokenStatus, setTokenStatus] = useState(token.status);

  /** 🔄 Load token data when dialog opens */
  useEffect(() => {
    setTokenStatus(token.status);

    setFormData({
      truckNumber: token.truckNumber || "",
      weight: token.weight || "",
      ratePerTon: 180, // ⭐ always fixed
      commission: token.commission || 0,
      paidAmount: token.paidAmount || 0,
    });
  }, [token]);

  /** ✏️ Handle input change */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** 🔄 Update token (truck + billing) */
  const handleUpdate = async () => {
    await dispatch(
      updateTokenAction({
        tokenId: token.id,
        truckNumber: formData.truckNumber,
        weight: formData.weight,
        commission: formData.commission,
        userId: token.user.id,
      }),
    );

    setTokenStatus("updated");
    onRefresh();
  };

  /** 💰 Confirm payment */
  const handleConfirmPayment = async () => {
    await dispatch(
      confirmPaymentAction({
        tokenId: token.id,
        paidAmount: formData.paidAmount,
      }),
    );

    onClose();
    onRefresh();
  };

  /** 🧮 Total calculation */
  const totalAmount =
    Number(formData.weight) * 180 + Number(formData.commission);

  /** 🔒 Paid field rule */
  const isPaidDisabled = tokenStatus !== "updated";

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
            {/* 🚛 Truck Number */}
            <Grid>
              <TextField
                label="Truck Number"
                name="truckNumber"
                fullWidth
                value={formData.truckNumber}
                onChange={handleChange}
              />
            </Grid>

            {/* ⚖ Weight */}
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

            {/* 💵 Rate (Fixed 180) */}
            <Grid>
              <TextField
                label="Rate / Ton"
                fullWidth
                value={180}
                disabled
                type="number"
              />
            </Grid>

            {/* 🧾 Commission */}
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

            {/* 💰 Paid Amount */}
            <Grid>
              <TextField
                label="Paid Amount"
                name="paidAmount"
                fullWidth
                value={formData.paidAmount}
                onChange={handleChange}
                type="number"
                disabled={isPaidDisabled} // ⭐ disabled until updated
              />
            </Grid>
          </Grid>

          {/* 💰 Total Display */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              💰 Total Amount:{" "}
              <span style={{ color: "#43a047" }}>
                ₹{totalAmount.toFixed(2)}
              </span>
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        {/* Cancel */}
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
          {/* Update */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              mr: 2,
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
            }}
            onClick={handleUpdate}
          >
            Update Token
          </Button>

          {/* Confirm */}
          <Button
            variant="contained"
            color="success"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(90deg, #43a047 0%, #66bb6a 100%)",
            }}
            onClick={handleConfirmPayment}
            disabled={tokenStatus !== "updated"}
          >
            Confirm Payment
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditTokenDialog;
