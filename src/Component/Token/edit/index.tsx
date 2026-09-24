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
  Divider,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
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

  const isBedash = token?.materialType?.toLowerCase() === "bedash";
  const [tokenStatus, setTokenStatus] = useState(token?.status);
  
  // 🟢 COMMON FIELDS (Used for both Flyash & Bedash)
  const [truckNumber, setTruckNumber] = useState("");
  const [weight, setWeight] = useState("");
  const [manualDate, setManualDate] = useState("");

  // 🟠 FLYASH SPECIFIC FIELDS
  const [commission, setCommission] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | "">(""); // Original simple paid amount

  // 🔵 BEDASH SPECIFIC FIELDS (Triple Ledger Rates)
  const [sellRate, setSellRate] = useState<number>(750);
  const [cartingRate, setCartingRate] = useState<number>(225);
  const [tokenOwnerRate, setTokenOwnerRate] = useState<number>(330);

  // 🔵 BEDASH SPECIFIC FIELDS (Triple Ledger Payments)
  const [custPayNow, setCustPayNow] = useState<number | "">("");
  const [cartingPayNow, setCartingPayNow] = useState<number | "">("");
  const [ownerPayNow, setOwnerPayNow] = useState<number | "">("");

  useEffect(() => {
    if (token && open) {
      setTokenStatus(token.status);
      setTruckNumber(token.truckNumber || "");
      setWeight(token.weight ? String(token.weight) : "");
      
      if (token.createdAt) {
        const dateObj = new Date(token.createdAt);
        setManualDate(new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
      } else { 
        setManualDate(""); 
      }

      if (isBedash) {
        // Bedash Rates Setup
        setSellRate(Number(token.sellRate) || 750);
        setCartingRate(Number(token.cartingRate) || 225);
        setTokenOwnerRate(Number(token.tokenOwnerRate) || 330);
        
        // Reset Bedash Payments
        setCustPayNow(""); 
        setCartingPayNow(""); 
        setOwnerPayNow("");
      } else {
        // Flyash Setup
        setCommission(Number(token.commission) || 0);
        
        // Reset Flyash Payment
        setPaidAmount("");
      }
    }
  }, [token, open, isBedash]);

  /** 🔄 Handle Update Details */
  const handleUpdate = async () => {
    // Shared Update Payload
    const payload: any = {
      tokenId: token.id,
      userId: token.user.id,
      truckNumber,
      weight,
      manualDate: manualDate || undefined,
    };

    // Inject Material-Specific Update Fields
    if (isBedash) {
      payload.sellRate = sellRate;
      payload.cartingRate = cartingRate;
      payload.tokenOwnerRate = tokenOwnerRate;
    } else {
      payload.commission = commission;
    }

    await dispatch(updateTokenAction(payload));
    setTokenStatus("updated");
    onRefresh();
  };

  /** 💰 Handle Confirm Payment */
  const handleConfirmPayment = async () => {
    const paymentPayload: any = {
      tokenId: token.id,
    };

    if (isBedash) {
      paymentPayload.paidAmount = Number(custPayNow || 0);
      paymentPayload.cartingPaidAmount = Number(cartingPayNow || 0);
      paymentPayload.tokenOwnerPaidAmount = Number(ownerPayNow || 0);
    } else {
      paymentPayload.paidAmount = Number(paidAmount || 0);
    }

    await dispatch(confirmPaymentAction(paymentPayload));
    onClose();
    onRefresh();
  };

  const isPaidDisabled = tokenStatus !== "updated";
  const w = Number(weight) || 0;
  
  // Real-time Preview Calculation for Bedash Commission
  let bedashFinalComm = 0;
  if (isBedash) {
    bedashFinalComm = token?.tokenOwnerType === "another" 
      ? (sellRate - cartingRate - tokenOwnerRate) * w 
      : (sellRate - cartingRate - 180) * w;
  }

  // Real-time Preview Calculation for Flyash Total
  let flyashFinalTotal = 0;
  if (!isBedash) {
    flyashFinalTotal = (w * 180) + Number(commission);
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" } }}
    >
      <DialogTitle 
        sx={{ 
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", 
          color: "white", 
          display: "flex", 
          alignItems: "center",
          gap: 1.5,
          p: 2.5
        }}
      >
        <EditNoteIcon sx={{ fontSize: 30, color: "#64b5f6" }} /> 
        <Box>
          Edit Token #{token?.id}
          {isBedash && (
            <Typography component="span" sx={{ color: "#ffb74d", ml: 1, fontWeight: 600, fontSize: "0.9rem" }}>
              (Bedash Engine)
            </Typography>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
          
          {/* 🟢 COMMON FIELDS */}
          <Grid container spacing={2}>
            <Grid>
              <TextField 
                label="Truck Number" 
                fullWidth 
                value={truckNumber} 
                onChange={e => setTruckNumber(e.target.value)} 
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
            <Grid>
              <TextField 
                label="Weight (Tons)" 
                fullWidth 
                type="number" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
            <Grid>
              <TextField 
                label="Manual Date & Time" 
                type="datetime-local" 
                fullWidth 
                value={manualDate} 
                onChange={e => setManualDate(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
          </Grid>

          {/* 🟠 MATERIAL SPECIFIC RATE & CALCULATION SECTION */}
          {isBedash ? (
            /* BEDASH ENGINE UI */
            <Box sx={{ p: 2, bgcolor: "#fff8e1", borderRadius: 2, border: "1px solid #ffe0b2" }}>
              <Typography variant="subtitle2" fontWeight={700} color="#e65100" mb={2}>
                Adjust Bedash Rates (Auto-Calculates Limits)
              </Typography>
              <Grid container spacing={2}>
                <Grid>
                  <TextField label="Sell Rate" type="number" fullWidth value={sellRate} onChange={e => setSellRate(Number(e.target.value))} size="small" sx={{ bgcolor: 'white' }}/>
                </Grid>
                <Grid>
                  <TextField label="Carting Rate" type="number" fullWidth value={cartingRate} onChange={e => setCartingRate(Number(e.target.value))} size="small" sx={{ bgcolor: 'white' }}/>
                </Grid>
                {token?.tokenOwnerType === "another" && (
                  <Grid>
                    <TextField label="Owner Rate" type="number" fullWidth value={tokenOwnerRate} onChange={e => setTokenOwnerRate(Number(e.target.value))} size="small" sx={{ bgcolor: 'white' }}/>
                  </Grid>
                )}
              </Grid>
              <Typography variant="body2" fontWeight={700} color="success.main" mt={2}>
                👉 Expected Commission Preview: ₹{bedashFinalComm}
              </Typography>
            </Box>
          ) : (
            /* FLYASH ENGINE UI (OLD SIMPLE STYLE) */
            <Grid container spacing={2}>
              <Grid>
                <TextField label="Rate / Ton" fullWidth value={180} disabled type="number" sx={{ bgcolor: 'white' }}/>
              </Grid>
              <Grid>
                <TextField 
                  label="Commission (₹)" 
                  fullWidth 
                  type="number" 
                  value={commission} 
                  onChange={e => setCommission(Number(e.target.value))} 
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
            </Grid>
          )}

          <Divider sx={{ my: 1 }} />

          {/* 💰 PAYMENTS SECTION */}
          {isBedash ? (
            /* BEDASH TRIPLE LEDGER PAYMENT UI */
            <>
              <Typography variant="subtitle2" fontWeight={700} color="primary">Enter Amounts to Pay Now (Triple Ledger):</Typography>
              <Grid container spacing={2}>
                <Grid>
                  <TextField 
                    label={`Customer Pay (Due: ₹${Number(token?.totalAmount||0) - Number(token?.paidAmount||0)})`} 
                    type="number" 
                    fullWidth 
                    value={custPayNow} 
                    onChange={e => setCustPayNow(Number(e.target.value))} 
                    disabled={isPaidDisabled} 
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>
                <Grid >
                  <TextField 
                    label={`Carting Pay (Due: ₹${Number(token?.totalCarting||0) - Number(token?.cartingPaidAmount||0)})`} 
                    type="number" 
                    fullWidth 
                    value={cartingPayNow} 
                    onChange={e => setCartingPayNow(Number(e.target.value))} 
                    disabled={isPaidDisabled} 
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>
                {token?.tokenOwnerType === "another" && (
                  <Grid>
                    <TextField 
                      label={`Owner Pay (Due: ₹${Number(token?.totalTokenOwnerAmount||0) - Number(token?.tokenOwnerPaidAmount||0)})`} 
                      type="number" 
                      fullWidth 
                      value={ownerPayNow} 
                      onChange={e => setOwnerPayNow(Number(e.target.value))} 
                      disabled={isPaidDisabled} 
                      sx={{ bgcolor: 'white' }}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            /* FLYASH SIMPLE PAYMENT UI */
            <Grid container spacing={2}>
              <Grid>
                <TextField 
                  label="Paid Amount (₹)" 
                  name="paidAmount" 
                  fullWidth 
                  value={paidAmount} 
                  onChange={e => setPaidAmount(Number(e.target.value))} 
                  type="number" 
                  disabled={isPaidDisabled} 
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
            </Grid>
          )}

          {/* 💰 FINAL TOTAL DISPLAY FOR FLYASH */}
          {!isBedash && (
            <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2, textAlign: "center", border: "1px solid #c8e6c9" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                💰 Final Total Amount: ₹{flyashFinalTotal.toFixed(2)}
              </Typography>
            </Box>
          )}

        </Box>
      </DialogContent>

      {/* ================= FOOTER ================= */}
      <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa", justifyContent: "space-between" }}>
        <Button variant="outlined" color="error" onClick={onClose} sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}>
          Cancel
        </Button>
        <Box display="flex" gap={1.5}>
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, px: 3, fontWeight: 600 }} onClick={handleUpdate}>
            Update Details
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none" }} 
            onClick={handleConfirmPayment} 
            disabled={isPaidDisabled || (isBedash ? (!custPayNow && !cartingPayNow && !ownerPayNow) : !paidAmount)}
          >
            Confirm Payments
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditTokenDialog;