import api from "../../expireToken";
import {
  API_ADD_BEDASH,
  API_CONFIRM_BEDASH,
  API_GET_BEDASH,
} from "../API End point";

/** 🔹 Common token getter & auth header */
const authHeader = () => {
  const accessToken = localStorage.getItem("accessToken");
  const token = accessToken && accessToken !== "undefined" ? accessToken : null;
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export const getBedashService = async () => {
  try {
    const response = await api.get(API_GET_BEDASH, {
      headers: authHeader(),
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching bedash list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const confirmBedashService = async (id: number) => {
  try {
    const url = API_CONFIRM_BEDASH.replace(":id", String(id));

    const response = await api.put(
      url,
      {}, 
      {
        headers: authHeader(),
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error in confirmBedashService:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const addBedashService = async (payload: any) => {
  try {
    const response = await api.post(API_ADD_BEDASH, payload, {
      headers: authHeader(),
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error in addBedashService:",
      error.response?.data || error.message,
    );
    throw error;
  }
};