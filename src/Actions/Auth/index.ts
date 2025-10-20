import { jwtDecode } from "jwt-decode";
import {
  ERROR,
  IN_PROGRESS,
  LOGIN_SUCCESS,
  LOGOUT,
} from "../../ActionType/auth";
import { clearAccessToken, setAccessToken } from "../../AuthToekn";
import { AppDispatch } from "../../store";
import { loginUser, logoutuserServices } from "../auth services";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";

export interface role {
  role: string;
  token: string;
}

export interface message {
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
      console.log("Decoded Token 👉", decoded);
      const user = {
        id: decoded.id,
        name: decoded.name, // or decoded.name if backend encodes it as "name"
        role: decoded.role,
      };

      dispatch({ type: LOGIN_SUCCESS, payload: { token, user } });
      dispatch(
        showNotification({
          type: "success",
          message: "Login Success successfully!",
        })
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
        })
      );
    }
  };

export const logoutAction = () => async (dispatch: AppDispatch) => {
  try {
    // ✅ Optional: show loader
    dispatch({ type: IN_PROGRESS });

    // ✅ If logout API exists
    const data = await logoutuserServices(); // wait for API to finish
    console.log("LOGOUT", data);
    clearAccessToken();

    // ✅ Clear redux store
    dispatch({ type: LOGOUT });
    dispatch(
      showNotification({
        type: "success",
        message: "Logout Success successfully!",
      })
    );

    // ✅ Clear token from storage

    // if using redux-persist

    // ✅ Optional: you can return true/false for navigation
    return true;
  } catch (error: any) {
    dispatch(
      showNotification({
        type: "error",
        message: error?.response?.data?.msg || error.message,
      })
    );
    // dispatch({ type: ERROR, payload: error });
    return false;
  }
};
