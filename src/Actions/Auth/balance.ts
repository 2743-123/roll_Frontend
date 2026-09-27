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
import { setPendingSettlementAction } from "./paymentHistoryAction"; 


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

/** ================= ADD BALANCE ================= */
/** ================= ADD BALANCE ================= */
/** ================= ADD BALANCE ================= */
/** ================= ADD BALANCE ================= */
/** ================= ADD BALANCE ================= */
// ⭐ 1. Ye import sabse upar add karein (path apne project ke hisaab se dekh lijiyega)


/** ================= ADD BALANCE ================= */
export const addBalanceAction =
  (payload: AddBalancePayload) => async (dispatch: AppDispatch) => {
    try {
      const data = await addBalanceService(payload);

      dispatch({ type: "ADD_BALANCE_SUCCESS" });

      // Flyash aur Bedash amounts ko jodh kar total amount nikal rahe hain
      const flyash = Number((payload as any).flyashAmount || 0);
      const bedash = Number((payload as any).bedashAmount || 0);
      const totalAmount = flyash + bedash;

      const userIdVal = (payload as any).userId;
      const paymentModeVal = (payload as any).paymentMode || "Cash";

      console.log("🟢 Calculated Total Add Balance:", { flyash, bedash, totalAmount });

      if (totalAmount > 0) {
        // ⭐ 2. YAHAN CHANGE KIYA HAI: Local dispatch ki jagah seedha Database Queue me bhej rahe hain
        await dispatch(
          setPendingSettlementAction(
            totalAmount,
            `Balance Added (User ID: ${userIdVal}) - Flyash: ₹${flyash}, Bedash: ₹${bedash} (${paymentModeVal})`
          ) as any
        );
      }

      // Refresh balance
      if (userIdVal) {
        dispatch(getBalanceAction(Number(userIdVal)));
      }

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
    
    // ✅ Yahan se notification hata di gayi hai
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message;

    dispatch({ type: ERROR, payload: { msg } });
    
    // ✅ Yahan se bhi notification hata di gayi hai
  }
};