import {
  API_ADD_USER,
  API_DELETE_USER,
  API_UPDATE_USER,
  API_USER_GET,
} from "../API End point";
import api from "../../expireToken";

export const getUserService = async () => {
  const { data } = await api.get(API_USER_GET);
  return data;
};

export const addUserService = async (userData: {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
}) => {
  try {
    const { data } = await api.post(API_ADD_USER, userData);
    return data;
  } catch (error: any) {
    console.error("Add user error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUserService = async (
  id: number,
  userData: any,
  token?: string, // optional kyunki api interceptor khud handle kar lega
) => {
  const url = API_UPDATE_USER.replace(":userId", id.toString());
  const { data } = await api.put(url, userData);
  return data;
};

export const deleteUserService = async (id: number, token?: string) => {
  const url = API_DELETE_USER.replace(":userId", id.toString());
  const { data } = await api.delete(url);
  return data;
};