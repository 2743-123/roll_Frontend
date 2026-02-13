import { ERROR } from "../../ActionType/auth";
import {
  GET_ADMIN_BALANCE,
  GET_BALANCE,
} from "../../ActionType/balancetype.ts/balance";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AddBalancePayload } from "../../Component/Balance/AddBalance";
import { AppDispatch } from "../../store";
import {
  addBalanceService,
  deleteBalanceService,
  editBalanceService,
  getAdminBalanceService,
  getBalanceService,
} from "../auth services/balance";

/** ================= GET USER BALANCE ================= */
export const getBalanceAction =
  (userId: number) => async (dispatch: AppDispatch) => {
    try {
      const data = await getBalanceService(userId);
      dispatch({ type: GET_BALANCE, payload: data });
    } catch (error: any) {
      dispatch({
        type: ERROR,
        payload: { msg: error?.response?.data?.msg || error.message },
      });
    }
  };


export const addBalanceAction =
  (payload: AddBalancePayload) => async (dispatch: AppDispatch) => {
    try {
      const data = await addBalanceService(payload);

      dispatch({ type: "ADD_BALANCE_SUCCESS" });

      // ⭐ IMPORTANT — refresh balance
      dispatch(getBalanceAction(Number(payload.userId)));

      dispatch(
        showNotification({
          type: "success",
          message: "Balance added successfully",
        })
      );

      return data;
    } catch (error: any) {
      dispatch({ type: "ADD_BALANCE_FAIL", payload: error });

      dispatch(
        showNotification({
          type: "error",
          message: error?.response?.data?.msg || "Balance add failed",
        })
      );

      throw error;
    }
  };


/** ================= EDIT BALANCE ================= */
export const editBalanceAction =
  (
    transactionId: number,
    payload: Partial<AddBalancePayload>,
    userId: number
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      await editBalanceService(transactionId, payload);

      dispatch(getBalanceAction(userId)); // 🔄 refresh

      dispatch(
        showNotification({
          type: "success",
          message: "Balance updated successfully",
        })
      );
    } catch (error: any) {
      dispatch({
        type: ERROR,
        payload: { msg: error?.response?.data?.msg || error.message },
      });

      dispatch(
        showNotification({
          type: "error",
          message: "Balance update failed",
        })
      );
    }
  };

/** ================= DELETE BALANCE ================= */
export const deleteBalanceAction =
  (transactionId: number, userId: number) =>
  async (dispatch: AppDispatch) => {
    try {
      await deleteBalanceService(transactionId);

      dispatch(getBalanceAction(userId)); // 🔄 refresh

      dispatch(
        showNotification({
          type: "success",
          message: "Balance deleted successfully",
        })
      );
    } catch (error: any) {
      dispatch({
        type: ERROR,
        payload: { msg: error?.response?.data?.msg || error.message },
      });

      dispatch(
        showNotification({
          type: "error",
          message: "Balance delete failed",
        })
      );
    }
  };

/** ================= ADMIN REPORT ================= */
export const getAdminBalanceAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getAdminBalanceService();

    dispatch({ type: GET_ADMIN_BALANCE, payload: data });

    if (data?.msg) {
      dispatch(showNotification({ type: "success", message: data.msg }));
    }
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message;

    dispatch({ type: ERROR, payload: { msg } });

    dispatch(showNotification({ type: "error", message: msg }));
  }
};
