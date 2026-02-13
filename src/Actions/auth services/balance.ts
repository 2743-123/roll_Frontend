import axios from "axios";
import { API_ADMIN_BALANCE, API_BALANCE_ADD, API_BALANCE_GET } from "../API End point"; // ✅ correct import path
import api from "../../expireToken";
import { AdminBalanceResponse } from "../../ActionType/balancetype.ts/balance";

interface AddBalancePayload {
  userId: number | string;
  flyashAmount: number;
  bedashAmount: number;
}

export const getBalanceService = async (userId: number | string) => {
  try {
    // 🔹 Get token safely
    const accessToken = localStorage.getItem("accessToken");
    const token =
      accessToken && accessToken !== "undefined" ? accessToken : null;

    // 🔹 Replace :userId in URL
    const url = API_BALANCE_GET.replace(":userId", String(userId));

    // 🔹 Axios request
    const response = await api.get(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    // 🔹 Return data
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error in getBalanceService:",
      error.response?.data || error.message
    );

    // Optionally handle 401 (unauthorized)
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid. Redirect to login?");
      // e.g. window.location.href = '/login';
    }

    throw error; // rethrow so Redux action can catch it
  }
};

export const addBalanceService = async (payload: AddBalancePayload) => {
  try {
    // 🔹 Get access token safely
    const accessToken = localStorage.getItem("accessToken");
    const token =
      accessToken && accessToken !== "undefined" ? accessToken : null;

    // 🔹 Axios request
    const response = await axios.post(API_BALANCE_ADD, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    // 🔹 Return success data
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error in addBalanceService:",
      error.response?.data || error.message
    );

    // 🔸 Optionally handle 401 errors globally
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid — redirecting to login...");
      // window.location.href = "/login";
    }

    throw error; // let Redux or component handle it
  }
};

export const getAdminBalanceService = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const token =
      accessToken && accessToken !== "undefined" ? accessToken : null;

    const response = await api.get(API_ADMIN_BALANCE, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    return response.data as AdminBalanceResponse;
  } catch (error: any) {
    console.error(
      "❌ Error in getAdminBalanceService:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      console.warn("Token expired or invalid.");
    }

    throw error;
  }
};
