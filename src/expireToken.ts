import axios from "axios";
// jahan tum token store/clear karte ho

import { toast } from "react-toastify";
import { LOGOUT } from "./ActionType/auth";
import store from "./store";
import { clearAccessToken } from "./AuthToekn";
import ENVIRONMENT_VARIABLES from "./environment.config";

const api = axios.create({
  baseURL: ENVIRONMENT_VARIABLES.Base_API_URL,withCredentials: true,
});

// 🔹 Request interceptor — token attach karega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Response interceptor — 401 aate hi auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error("Session expired. Please login again.");

      // Redux logout action
      store.dispatch({ type: LOGOUT });

      // Token clear from localStorage
      clearAccessToken();

      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
