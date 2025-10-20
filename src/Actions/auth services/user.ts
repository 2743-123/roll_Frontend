import axios from "axios";
import { getAccessToken } from "../../AuthToekn";
import {
  API_ADD_USER,
  API_DELETE_USER,
  API_UPDATE_USER,
  API_USER_GET,
} from "../API End point";
import api from "../../expireToken";

export const getUserService = async () => {
  const token = getAccessToken();
  const { data } = await api.get(API_USER_GET, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
export const addUserService = async (userData: {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
}) => {
  try {
    const token = localStorage.getItem("accessToken"); // spelling check
    const { data } = await axios.post(API_ADD_USER, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error: any) {
    console.error("Add user error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUserService = async (
  id: number,
  userData: any,
  token: string
) => {
  // Replace :userId with actual ID
  const url = API_UPDATE_USER.replace(":userId", id.toString());

  const response = await axios.put(url, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteUserService = async (id: number, token: string) => {
  const url = API_DELETE_USER.replace(":userId", id.toString());

  const response = await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
