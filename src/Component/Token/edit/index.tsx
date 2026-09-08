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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

  /** 📦 Form State (Standard) */
  const [formData, setFormData] = useState({
    truckNumber: "",
    weight: "",
    ratePerTon: 180, 
    commission: 0,
    paidAmount: 0,
  });

  const [tokenStatus, setTokenStatus] = useState(token?.status);
  const isBedash = token?.materialType?.toLowerCase() === "bedash";

  /** 🚚 BEDASH Specific State */
  const [sellRate, setSellRate] = useState<number>(750);
  const [cartingRate, setCartingRate] = useState<number>(225);
  const [truckOwnerType, setTruckOwnerType] = useState<"owner" | "another">("owner");
  const [anotherRate, setAnotherRate] = useState<number>(330);
  
  /** 📅 Manual Date State */
  const [manualDate, setManualDate] = useState("");

  /** 🔄 Load token data when dialog opens */
  useEffect(() => {
    if (token && open) {
      setTokenStatus(token.status);
      
      const w = Number(token.weight) || 0;
      const c = Number(token.commission) || 0;
      const t = Number(token.totalAmount) || 0;

      setFormData({
        truckNumber: token.truckNumber || "",
        weight: w ? w.toString() : "",
        ratePerTon: 180,
        commission: c,
        paidAmount: token.paidAmount || 0,
      });

      // Format current token date for datetime-local input
      if (token.createdAt) {
        const dateObj = new Date(token.createdAt);
        const localISO = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setManualDate(localISO);
      } else {
        setManualDate("");
      }

      // ⭐ SMART REVERSE CALCULATION FOR BEDASH RATES
      if (isBedash && w > 0 && token.status !== "pending") {
        // Agar token already updated hai toh purane rate extract karo
        const derivedSellRate = t / w;
        setSellRate(derivedSellRate);

        // Commission = (SellRate - CartingRate - FixRate) * Weight
        // Toh => CartingRate = SellRate - FixRate - (Commission / Weight)
        const marginPerTon = c / w;

        // Default to "owner" logic to guess carting rate
        // We assume 180 is Fix Rate for Owner. 
        // Agar (Sell - 180 - Margin) ki value 225 ke aas paas ho toh owner hai
        let derivedCarting = derivedSellRate - 180 - marginPerTon;

        // Agar carting ki value kuch ajeeb negative ban rahi hai matlab ye "another" type hai (Fix rate = 330)
        if (derivedCarting < 0 || Math.abs(derivedCarting - 225) > Math.abs(derivedSellRate - anotherRate - marginPerTon)) {
           setTruckOwnerType("another");
           // Yaha another rate set karne ki koshish (defaulting to 330 agar manually another rate pe tha)
           setAnotherRate(330); 
           derivedCarting = derivedSellRate - 330 - marginPerTon;
        } else {
           setTruckOwnerType("owner");
        }

        setCartingRate(Math.round(derivedCarting)); // Round off to avoid decimals

      } else {
        // Default Bedash Reset (Agar first time update ho raha hai)
        setSellRate(750);
        setCartingRate(225);
        setTruckOwnerType("owner");
        setAnotherRate(330);
      }
    }
  }, [token, open, isBedash, anotherRate]); // Dependency array updated safely

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** 🧮 TOTAL & COMMISSION CALCULATION */
  const w = Number(formData.weight) || 0;
  let finalTotalAmount = 0;
  let finalCommission = Number(formData.commission);
  let bedashMarginPerTon = 0;

  if (isBedash) {
    finalTotalAmount = sellRate * w;
    if (truckOwnerType === "owner") {
      bedashMarginPerTon = sellRate - cartingRate - 180;
    } else {
      bedashMarginPerTon = sellRate - cartingRate - anotherRate;
    }
    finalCommission = bedashMarginPerTon * w;
  } else {
    finalTotalAmount = (w * 180) + Number(formData.commission);
  }

  /** 🔄 Update token */
  const handleUpdate = async () => {
    await dispatch(
      updateTokenAction({
        tokenId: token.id,
        truckNumber: formData.truckNumber,
        weight: formData.weight,
        commission: finalCommission,
        userId: token.user.id,
        totalAmount: finalTotalAmount,
        manualDate: manualDate || undefined,
      })
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
      })
    );
    onClose();
    onRefresh();
  };

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
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)", 
          overflow: "hidden" 
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          color: "white",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.5,
        }}
      >
        <EditNoteIcon sx={{ color: "#64b5f6", fontSize: 30 }} /> 
        <Box>
          Edit Token #{token?.id}
          {isBedash && (
            <Typography component="span" sx={{ color: "#ffb74d", ml: 1, fontWeight: 600, fontSize: "0.9rem" }}>
              (Bedash Material)
            </Typography>
          )}
        </Box>
      </DialogTitle>

      {/* ================= CONTENT ================= */}
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
        <Box 
          display="flex" 
          flexDirection="column" 
          gap={2.5} 
          mt={1}
          sx={{
            "& .MuiTextField-root, & .MuiFormControl-root": {
              backgroundColor: "white",
              borderRadius: 1,
            },
          }}
        >
          {/* 🟢 COMMON FIELDS */}
          <Grid container spacing={2}>
            <Grid >
              <TextField 
                label="Truck Number" 
                name="truckNumber" 
                fullWidth 
                value={formData.truckNumber} 
                onChange={handleChange} 
              />
            </Grid>
            <Grid >
              <TextField 
                label="Weight (Tons)" 
                name="weight" 
                fullWidth 
                value={formData.weight} 
                onChange={handleChange} 
                type="number" 
              />
            </Grid>

            {/* FLYASH: Normal Rate & Manual Commission */}
            {!isBedash && (
              <>
                <Grid>
                  <TextField label="Rate / Ton" fullWidth value={180} disabled type="number" />
                </Grid>
                <Grid >
                  <TextField 
                    label="Commission (₹)" 
                    name="commission" 
                    fullWidth 
                    value={formData.commission} 
                    onChange={handleChange} 
                    type="number" 
                  />
                </Grid>
              </>
            )}

            {/* 📅 Manual Date Picker */}
            <Grid >
              <TextField 
                label="Manual Date & Time" 
                type="datetime-local" 
                fullWidth 
                value={manualDate} 
                onChange={(e) => setManualDate(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>

            <Grid>
              <TextField 
                label="Paid Amount (₹)" 
                name="paidAmount" 
                fullWidth 
                value={formData.paidAmount} 
                onChange={handleChange} 
                type="number" 
                disabled={isPaidDisabled} 
              />
            </Grid>
          </Grid>

          {/* 🟠 BEDASH CUSTOM LIVE UI */}
          {isBedash && (
            <Box sx={{ mt: 1, p: 2.5, bgcolor: "#fff8e1", borderRadius: 2, border: "1px solid #ffe0b2", display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#e65100">
                Bedash Dynamic Calculation Engine
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid>
                  <TextField 
                    label="Sell Rate" 
                    type="number" 
                    size="small" 
                    fullWidth
                    value={sellRate} 
                    onChange={(e) => setSellRate(Number(e.target.value))} 
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid>
                  <Typography variant="body2" fontWeight="600" color="primary.main">
                    {sellRate} × {w} = ₹{sellRate * w}
                  </Typography>
                </Grid>

                <Grid>
                  <TextField 
                    label="Carting Rate" 
                    type="number" 
                    size="small" 
                    fullWidth
                    value={cartingRate} 
                    onChange={(e) => setCartingRate(Number(e.target.value))} 
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid>
                  <Typography variant="body2" fontWeight="600" color="error.main">
                    {cartingRate} × {w} = ₹{cartingRate * w}
                  </Typography>
                </Grid>

                <Grid>
                  <TextField label="Fix Rate" type="number" size="small" disabled value={180} fullWidth sx={{ bgcolor: "#f5f5f5" }} />
                </Grid>
                <Grid>
                  <Typography variant="body2" fontWeight="600" color="error.main">
                    180 × {w} = ₹{180 * w}
                  </Typography>
                </Grid>

                <Grid>
                  <FormControl size="small" fullWidth sx={{ bgcolor: "white" }}>
                    <InputLabel>Truck Owner Type</InputLabel>
                    <Select value={truckOwnerType} label="Truck Owner Type" onChange={(e) => setTruckOwnerType(e.target.value as "owner" | "another")}>
                      <MenuItem value="owner">Selected Owner</MenuItem>
                      <MenuItem value="another">Another Owner</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {truckOwnerType === "another" && (
                  <>
                    <Grid>
                      <TextField 
                        label="Another Rate" 
                        type="number" 
                        size="small" 
                        fullWidth
                        value={anotherRate} 
                        onChange={(e) => setAnotherRate(Number(e.target.value))} 
                        sx={{ bgcolor: "white" }}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant="body2" fontWeight="600" color="error.main">
                        {anotherRate} × {w} = ₹{anotherRate * w}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>

              <Box mt={1} p={1.5} bgcolor="#ffffff" borderRadius={1.5} border="1px dashed #ffb74d">
                <Typography variant="body2" color="text.secondary">
                  {truckOwnerType === "owner" 
                    ? `${sellRate} - ${cartingRate} - 180 = ${bedashMarginPerTon} Margin/Ton`
                    : `${sellRate} - ${cartingRate} - ${anotherRate} = ${bedashMarginPerTon} Margin/Ton`
                  }
                </Typography>
                <Typography variant="body1" fontWeight={700} mt={0.5} color="success.main">
                  👉 Auto Commission: {bedashMarginPerTon} × {w} Tons = ₹{finalCommission}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 0.5 }} />

          {/* 💰 Final Total Display Box */}
          <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2, textAlign: "center", border: "1px solid #c8e6c9" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              💰 Final Total Amount: ₹{finalTotalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* ================= FOOTER ================= */}
      <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Button variant="outlined" color="error" onClick={onClose} sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}>
          Cancel
        </Button>
        <Box display="flex" gap={1.5}>
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, px: 3, fontWeight: 600 }} onClick={handleUpdate}>
            Update Token
          </Button>
          <Button variant="contained" color="success" sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none" }} onClick={handleConfirmPayment} disabled={isPaidDisabled}>
            Confirm Payment
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditTokenDialog;