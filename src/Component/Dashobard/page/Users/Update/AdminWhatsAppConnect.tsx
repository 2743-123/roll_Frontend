import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";

// ⭐ 1. Yahan par apna global API URL config import karein
// (Aapko apne folder structure ke hisaab se path adjust karna padh sakta hai)
import ENVIRONMENT_VARIABLES from "../../../../../environment.config";

interface AdminWhatsAppConnectProps {
  adminId: string;
}

export default function AdminWhatsAppConnect({ adminId }: AdminWhatsAppConnectProps) {
  const [qrCode, setQrCode] = useState("");
  const [waStatus, setWaStatus] = useState("CHECKING"); // CHECKING, DISCONNECTED, QR_READY, CONNECTED
  const [loadingQr, setLoadingQr] = useState(false);

  // ⭐ API Base URL dynamic le rahe hain
  const BASE_API = ENVIRONMENT_VARIABLES.Base_API_URL;

  // 1. Initial Check: Kya ye admin pehle se WhatsApp se connected hai?
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        // ⭐ Localhost hata diya, dynamic URL lagaya
        const res = await fetch(`${BASE_API}/whatsapp/status/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setWaStatus(data.status); 
      } catch (error) {
        setWaStatus("DISCONNECTED");
      }
    };
    checkInitialStatus();
  }, [adminId, BASE_API]);

  // 2. Generate QR Code API Call
  const handleGenerateQR = async () => {
    setLoadingQr(true);
    try {
      const token = localStorage.getItem("accessToken");
      // ⭐ Localhost hata diya, dynamic URL lagaya
      const response = await fetch(`${BASE_API}/whatsapp/generate-qr/${adminId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.qr) {
        setQrCode(data.qr);
        setWaStatus("QR_READY");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingQr(false);
    }
  };

  // 3. Polling: Jab QR generate ho jaye, toh har 2 second me check karo ki scan hua ya nahi
  useEffect(() => {
    let interval: any;
    if (waStatus === "QR_READY") {
      interval = setInterval(async () => {
        const token = localStorage.getItem("accessToken");
        // ⭐ Localhost hata diya, dynamic URL lagaya
        const res = await fetch(`${BASE_API}/whatsapp/status/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === "CONNECTED") {
          setWaStatus("CONNECTED");
          setQrCode(""); // Scan hone ke baad QR hata do
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [waStatus, adminId, BASE_API]);

  if (waStatus === "CHECKING") {
    return (
      <Box mt={2} display="flex" justifyContent="center">
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2} textAlign="center" bgcolor="#f9f9f9">
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        WhatsApp Integration
      </Typography>

      {waStatus === "CONNECTED" ? (
        <Box>
          <Typography color="green" fontWeight="bold">✅ Admin's WhatsApp is Linked!</Typography>
          <Typography variant="body2" color="textSecondary">
            This admin can now send messages directly from their own number.
          </Typography>
        </Box>
      ) : (
        <Box>
          {!qrCode ? (
            <Button variant="outlined" color="primary" onClick={handleGenerateQR} disabled={loadingQr}>
              {loadingQr ? <CircularProgress size={20} /> : "Link Admin's WhatsApp (Generate QR)"}
            </Button>
          ) : (
            <Box>
              <QRCodeSVG value={qrCode} size={180} />
              <Typography mt={1} variant="body2" color="textSecondary">
                Scan this QR code from the Admin's phone to link.
              </Typography>
              <Box mt={1} display="flex" alignItems="center" justifyContent="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2">Waiting for scan...</Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}