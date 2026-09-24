import api from "../../expireToken";
import { 
  API_GET_PAYMENT_HISTORY, 
  API_GET_PAYMENT_RECOVERY // ⭐ Naya Route Import
} from "../API End point";
import { 
  PaymentHistoryResponse, 
  PaymentRecoveryResponse // ⭐ Naya Type Import
} from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";

/** 🔹 Common token getter */
const getToken = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken && accessToken !== "undefined" ? accessToken : null;
};

/** 🔹 Common auth header */
const authHeader = () => ({
  Authorization: getToken() ? `Bearer ${getToken()}` : "",
});

/* =======================================================
   GET PAYMENT HISTORY
======================================================= */
export const getPaymentHistoryService = async () => {
  try {
    const { data } = await api.get(API_GET_PAYMENT_HISTORY, {
      headers: authHeader(),
    });

    return data as PaymentHistoryResponse;
  } catch (error: any) {
    console.error(
      "❌ getPaymentHistoryService:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* =======================================================
   ⭐ GET PAYMENT RECOVERY (PENDING DUES)
======================================================= */
export const getPaymentRecoveryService = async () => {
  try {
    const { data } = await api.get(API_GET_PAYMENT_RECOVERY, {
      headers: authHeader(),
    });

    return data as PaymentRecoveryResponse;
  } catch (error: any) {
    console.error(
      "❌ getPaymentRecoveryService:",
      error.response?.data || error.message
    );
    throw error;
  }
};