import axios from "axios";
import { API_AUTH_LOGIN, API_AUTH_LOGOUT } from "../API End point";
import { getAccessToken } from "../../AuthToekn";

export const loginUser = async (email: string, password: string) => {
  const { data } = await axios.post(API_AUTH_LOGIN, { email, password },{ withCredentials: true });
  return data;
};

export const logoutuserServices = async () => {
  const token = getAccessToken();
  const { data } = await axios.post(
    API_AUTH_LOGOUT,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
