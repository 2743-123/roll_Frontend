import api from "../../expireToken";
import { API_GET_PAYMENT_HISTORY } from "../API End point";
import { PaymentHistoryResponse } from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";

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