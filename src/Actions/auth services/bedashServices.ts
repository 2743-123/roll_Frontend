import api from "../../expireToken";
import { API_ADD_BEDASH, API_CONFIRM_BEDASH, API_GET_BEDASH } from "../API End point";

export const getBedashService = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const token = accessToken && accessToken !== "undefined" ? accessToken : null;

    const response = await api.get(API_GET_BEDASH, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching bedash list:", error.response?.data || error.message);
    throw error;
  }
};


export const confirmBedashService = async (id: number) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const token = accessToken && accessToken !== "undefined" ? accessToken : null;

    const url = API_CONFIRM_BEDASH.replace(":id", String(id));

    const response = await api.put(
      url,
      {}, // body empty hai kyunki sirf status update kar rahe ho
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Error in confirmBedashService:", error.response?.data || error.message);
    throw error;
  }
};

export const addBedashService = async (payload: any) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await api.post(API_ADD_BEDASH, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error in addBedashService:", error.response?.data || error.message);
    throw error;
  }
};