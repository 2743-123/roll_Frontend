import { jwtDecode } from "jwt-decode";
import {
  ERROR,
  IN_PROGRESS,
  LOGIN_SUCCESS,
  LOGOUT,
} from "../../ActionType/auth";
import { clearAccessToken, setAccessToken } from "../../AuthToekn"; // 'AuthToken' spelling check kar lein
import { AppDispatch } from "../../store";
import { loginUser, logoutuserServices } from "../auth services";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";

// Convention: Interfaces ka pehla letter capital hona chahiye (Role, Message)
export interface Role {
  role: string;
  token: string;
}

export interface Message {
  msg: string;
}

interface DecodedToken {
  id: number;
  name: string;
  role: string;
  exp?: number;
}

export const login =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: IN_PROGRESS });
      const data = await loginUser(email, password);
      const { token } = data;
      const decoded: DecodedToken = jwtDecode(token);
      
      const user = {
        id: decoded.id,
        name: decoded.name, 
        role: decoded.role,
      };

      dispatch({ type: LOGIN_SUCCESS, payload: { token, user } });
      
      dispatch(
        showNotification({
          type: "success",
          message: "Login successful!", // 👈 Message theek kiya
        }),
      );

      localStorage.setItem("user", JSON.stringify(user));
      setAccessToken(token);
      
    } catch (error: any) {
      dispatch({
        type: ERROR,
        payload: { msg: error?.response?.data?.msg || error.message },
      });
      dispatch(
        showNotification({
          type: "error",
          message: error?.response?.data?.msg || error.message,
        }),
      );
    }
  };

export const logoutAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await logoutuserServices(); 
    console.log("LOGOUT", data);
    
    clearAccessToken();
    localStorage.removeItem("user"); // 👈 YAHAN ADD KIYA: Local storage user clear karna zaroori hai
    
    dispatch({ type: LOGOUT });
    
    dispatch(
      showNotification({
        type: "success",
        message: "Logout successful!", // 👈 Message theek kiya
      }),
    );
    return true;
  } catch (error: any) {
    dispatch(
      showNotification({
        type: "error",
        message: error?.response?.data?.msg || error.message,
      }),
    );
    return false;
  }
};