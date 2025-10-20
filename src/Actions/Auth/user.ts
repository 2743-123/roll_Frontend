import { toast } from "react-toastify";
import { ERROR, IN_PROGRESS } from "../../ActionType/auth";
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

export const getuserAction = () => async (dispatch: AppDispatch) => {
  try {
    // dispatch({ type: IN_PROGRESS });
    const data = await getUserService();
    dispatch({ type: GET_USERS_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({ type: ERROR, payload: error });
  }
};

export const selectUserAction = (user: User | null) => ({
  type: SELECT_USER,
  payload: { user },
});

export const addUserAction =
  (userData: {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin" | "superadmin";
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: IN_PROGRESS });
      const data = await addUserService(userData);
      dispatch({ type: ADD_USER_SUCCESS, payload: data });
      dispatch(
        showNotification({
          type: "success",
          message: "User added successfully!",
        })
      );
    } catch (error: any) {
      dispatch({
        type: ERROR,
        payload: { msg: error?.response?.data?.msg || error.message },
      });
    }
  };

export const updateUserAction =
  (userId: number, userData: any) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Unauthorized: No token found");

      // ✅ API call
      const updatedUser = await updateUserService(userId, userData, token);

      // ✅ Local Redux state update (no fetch)
      dispatch({ type: UPDATE_USER_SUCCESS, payload: updatedUser });
      dispatch(
        showNotification({
          type: "success",
          message: "User update successfully!",
        })
      );

      return updatedUser;
    } catch (error: any) {
      console.error("Update failed:", error);
      dispatch(
        showNotification({ type: "error", message: "User update fail!" })
      );
      // toast.error(error.response?.data?.message || "Update failed");
      throw error;
    }
  };

export const deleteUserAction =
  (id: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("Unauthorized");

      await deleteUserService(id, token);
      dispatch({ type: DELETE_USER_SUCCESS, payload: id });

      dispatch(
        showNotification({ type: "success", message: "Delete  successfully!" })
      );
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };
