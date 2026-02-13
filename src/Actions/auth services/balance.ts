import api from "../../expireToken";
import {
  API_ADMIN_BALANCE,
  API_BALANCE_ADD,
  API_BALANCE_GET,
  API_BALANCE_EDIT,
  API_BALANCE_DELETE,
} from "../API End point";

import { AdminBalanceResponse } from "../../ActionType/balancetype.ts/balance";

interface AddBalancePayload {
  userId: number | string;
  flyashAmount: number;
  bedashAmount: number;
}

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
   GET USER BALANCE
======================================================= */
export const getBalanceService = async (userId: number | string) => {
  try {
    const url = API_BALANCE_GET.replace(":userId", String(userId));

    const { data } = await api.get(url, {
      headers: authHeader(),
    });

    return data;
  } catch (error: any) {
    console.error("❌ getBalanceService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   ADD BALANCE
======================================================= */
export const addBalanceService = async (payload: AddBalancePayload) => {
  try {
    const { data } = await api.post(API_BALANCE_ADD, payload, {
      headers: authHeader(),
    });

    return data;
  } catch (error: any) {
    console.error("❌ addBalanceService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   EDIT BALANCE
======================================================= */
export const editBalanceService = async (
  transactionId: number,
  payload: Partial<AddBalancePayload>
) => {
  try {
    const url = API_BALANCE_EDIT.replace(":transactionId", String(transactionId));

    const { data } = await api.put(url, payload, {
      headers: authHeader(),
    });

    return data;
  } catch (error: any) {
    console.error("❌ editBalanceService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   DELETE BALANCE
======================================================= */
export const deleteBalanceService = async (transactionId: number) => {
  try {
    const url = API_BALANCE_DELETE.replace(":transactionId", String(transactionId));

    const { data } = await api.delete(url, {
      headers: authHeader(),
    });

    return data;
  } catch (error: any) {
    console.error("❌ deleteBalanceService:", error.response?.data || error.message);
    throw error;
  }
};

/* =======================================================
   ADMIN BALANCE REPORT
======================================================= */
export const getAdminBalanceService = async () => {
  try {
    const { data } = await api.get(API_ADMIN_BALANCE, {
      headers: authHeader(),
    });

    return data as AdminBalanceResponse;
  } catch (error: any) {
    console.error(
      "❌ getAdminBalanceService:",
      error.response?.data || error.message
    );
    throw error;
  }
};
