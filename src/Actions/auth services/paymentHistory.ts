import api from "../../expireToken";
import { 
  API_GET_PAYMENT_HISTORY, 
  API_GET_PAYMENT_RECOVERY,
  API_SETTLE_PAYMENT_RECOVERY,
  // ⭐ MASTER LEDGER IMPORTS
  API_CREATE_MASTER_ACCOUNT,
  API_GET_MASTER_ACCOUNTS,
  API_PROCESS_MASTER_TRANSACTION,
  API_GET_MASTER_TRANSACTIONS,
  // ⭐ PENDING SETTLEMENT QUEUE IMPORTS
  API_ADD_PENDING_SETTLEMENT,
  API_GET_PENDING_SETTLEMENTS
} from "../API End point";
import { 
  PaymentHistoryResponse, 
  PaymentRecoveryResponse,
  SettleRecoveryRequest,
  SettleRecoveryResponse,
  // ⭐ MASTER LEDGER TYPES
  CreateMasterAccountRequest,
  ProcessMasterTransactionRequest
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
    console.error("❌ getPaymentHistoryService:", error.response?.data || error.message);
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
    console.error("❌ getPaymentRecoveryService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   ⭐ SETTLE PAYMENT RECOVERY (FIFO PAYMENT / ADJUSTMENT)
======================================================= */
export const settlePaymentRecoveryService = async (payload: SettleRecoveryRequest) => {
  try {
    const { data } = await api.post(API_SETTLE_PAYMENT_RECOVERY, payload, {
      headers: authHeader(),
    });
    return data as SettleRecoveryResponse;
  } catch (error: any) {
    console.error("❌ settlePaymentRecoveryService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   ⭐ MASTER LEDGER (ACCOUNT SETTLEMENT) SERVICES ⭐
======================================================= */

// 1. Naya Master Account banana
export const createMasterAccountService = async (payload: CreateMasterAccountRequest) => {
  try {
    const { data } = await api.post(API_CREATE_MASTER_ACCOUNT, payload, {
      headers: authHeader(),
    });
    return data;
  } catch (error: any) {
    console.error("❌ createMasterAccountService:", error.response?.data || error.message);
    throw error;
  }
};

// 2. Saare Master Accounts fetch karna (Blink list ke liye)
export const getMasterAccountsService = async () => {
  try {
    const { data } = await api.get(API_GET_MASTER_ACCOUNTS, {
      headers: authHeader(),
    });
    return data;
  } catch (error: any) {
    console.error("❌ getMasterAccountsService:", error.response?.data || error.message);
    throw error;
  }
};

// 3. Deposit, Withdraw ya Transfer execute karna
export const processMasterTransactionService = async (payload: ProcessMasterTransactionRequest) => {
  try {
    const { data } = await api.post(API_PROCESS_MASTER_TRANSACTION, payload, {
      headers: authHeader(),
    });
    return data;
  } catch (error: any) {
    console.error("❌ processMasterTransactionService:", error.response?.data || error.message);
    throw error;
  }
};

// 4. Kisi specific khate ki andar ki timeline dekhna
export const getMasterAccountTransactionsService = async (accountId: number) => {
  try {
    const { data } = await api.get(`${API_GET_MASTER_TRANSACTIONS}/${accountId}/transactions`, {
      headers: authHeader(),
    });
    return data;
  } catch (error: any) {
    console.error("❌ getMasterAccountTransactionsService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   ⭐ PENDING SETTLEMENT QUEUE (NEW) ⭐
======================================================= */

// 1. Naya amount database queue me bhejne ke liye
export const addPendingSettlementService = async (payload: { amount: number, sourceDetails: string }) => {
  try {
    const { data } = await api.post(API_ADD_PENDING_SETTLEMENT, payload, {
      headers: authHeader(),
    });
    return data;
  } catch (error: any) {
    console.error("❌ addPendingSettlementService:", error.response?.data || error.message);
    throw error;
  }
};

// 2. Database se saari pending lines uthane ke liye (Login hone par)
export const getPendingSettlementsService = async () => {
  try {
    const { data } = await api.get(API_GET_PENDING_SETTLEMENTS, {
      headers: authHeader(),
    });
    return data;
  } catch (error: any) {
    console.error("❌ getPendingSettlementsService:", error.response?.data || error.message);
    throw error;
  }
};