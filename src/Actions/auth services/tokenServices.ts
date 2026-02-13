import api from "../../expireToken";
import {
  API_CONFIRM_TOKEN,
  API_CREATE_TOKEN,
  API_DELETE_TOKEN,
  API_GET_ALL_USER_TOKEN,
  API_GET_TOKENS,
  API_UPDATE_TOKEN,
} from "../API End point";

export const getTokensService = async (userId: number | string) => {
  const url = API_GET_TOKENS.replace(":userId", String(userId));
  const { data } = await api.get(url);
  return data.data; // backend response ke "data" part me tokens hain
};

export const createTokenService = async (tokenData: any) => {
  try {
    // POST request to backend
    const { data } = await api.post(API_CREATE_TOKEN, tokenData);
    return data; // returns success message + new token
  } catch (error: any) {
    throw error.response?.data?.msg || "Failed to create token";
  }
};

export const updateTokenService = async (payload: any) => {
  const { data } = await api.put(API_UPDATE_TOKEN, payload);
  return data;
};

export const confirmPaymentService = async (payload: any) => {
  const { data } = await api.put(API_CONFIRM_TOKEN, payload);
  return data;
};

export const getAdminTokensService = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const response = await api.get(API_GET_ALL_USER_TOKEN, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Admin token fetch error:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const deleteTokenService = async (tokenId: number | string) => {
  const url = API_DELETE_TOKEN.replace(":tokenId", String(tokenId));

  const { data } = await api.delete(url);
  return data;
};
