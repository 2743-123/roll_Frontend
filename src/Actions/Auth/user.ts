// ❌ 'toast' ko yahan se hata diya gaya hai
import { ERROR } from "../../ActionType/auth";
import {
  ADD_USER_SUCCESS,
  DELETE_USER_SUCCESS,
  GET_USERS_SUCCESS,
  SELECT_USER,
  UPDATE_USER_SUCCESS,
} from "../../ActionType/user/userTypes";
import { User } from "../../Component/DropDownUserList";
import { AppDispatch, RootState } from "../../store";
import {
  addUserService,
  deleteUserService,
  getUserService,
  updateUserService,
} from "../auth services/user";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";

/** ================= GET USERS ================= */
export const getuserAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getUserService();
    dispatch({ type: GET_USERS_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({ type: ERROR, payload: error });
  }
};

/** ================= SELECT USER ================= */
export const selectUserAction = (user: User | null) => ({
  type: SELECT_USER,
  payload: { user },
});

/** ================= ADD USER ================= */
export const addUserAction =
  (userData: {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin" | "superadmin";
    phone?: string;
    whatsappInstanceId?: string;
    whatsappToken?: string;
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      const data = await addUserService(userData);
      dispatch({ type: ADD_USER_SUCCESS, payload: data });

      // 🔄 List ko fresh rakhne ke liye fetch
      dispatch(getuserAction());

      dispatch(
        showNotification({
          type: "success",
          message: "User added successfully!",
        }),
      );
    } catch (error: any) {
      const msg = error?.response?.data?.msg || error.message;
      dispatch({
        type: ERROR,
        payload: { msg },
      });
      dispatch(
        showNotification({
          type: "error",
          message: msg || "Failed to add user",
        }),
      );
    }
  };

/** ================= UPDATE USER ================= */
export const updateUserAction =
  (userId: number, userData: any) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Unauthorized: No token found");

      // ✅ API call
      const updatedUser = await updateUserService(userId, userData, token);

      // ✅ Local Redux state update
      dispatch({ type: UPDATE_USER_SUCCESS, payload: updatedUser });
      
      dispatch(
        showNotification({
          type: "success",
          message: "User updated successfully!", // Typo fix
        }),
      );

      return updatedUser;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "User update failed!";
      
      // 👈 FIX: Yahan ERROR action dispatch missing tha
      dispatch({
        type: ERROR,
        payload: { msg },
      });

      dispatch(
        showNotification({ type: "error", message: msg }),
      );
      throw error;
    }
  };

/** ================= DELETE USER ================= */
export const deleteUserAction =
  (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Unauthorized");

      await deleteUserService(id, token);
      dispatch({ type: DELETE_USER_SUCCESS, payload: id });

      dispatch(
        showNotification({ type: "success", message: "User deleted successfully!" }), // Typo fix
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Failed to delete user";
      
      // 👈 FIX: Yahan ERROR action dispatch missing tha
      dispatch({
        type: ERROR,
        payload: { msg },
      });

      // 👈 FIX: toast.error ki jagah standard showNotification lagaya
      dispatch(
        showNotification({ type: "error", message: msg }),
      );
    }
  };