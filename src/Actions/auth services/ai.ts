import api from "../../expireToken";
import { API_AI_COMMAND } from "../API End point";

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
   SEND AI COMMAND
======================================================= */
export const sendAiCommandService = async (command: string) => {
  try {
    const { data } = await api.post(
      API_AI_COMMAND,
      { command },
      {
        headers: authHeader(),
      }
    );

    return data;
  } catch (error: any) {
    console.error("❌ sendAiCommandService:", error.response?.data || error.message);
    throw error;
  }
};