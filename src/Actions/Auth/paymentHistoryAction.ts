import { ERROR } from "../../ActionType/auth";
import { 
  GET_PAYMENT_HISTORY, 
  GET_PAYMENT_RECOVERY // ⭐ Naya Action Type import karna padega
} from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";
import { AppDispatch } from "../../store";
import { 
  getPaymentHistoryService, 
  getPaymentRecoveryService // ⭐ Naya Service import karna padega
} from "../auth services/paymentHistory";

/** ================= GET PAYMENT HISTORY ================= */
export const getPaymentHistoryAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getPaymentHistoryService();

    // Reducer ko data bhej rahe hain
    dispatch({ type: GET_PAYMENT_HISTORY, payload: data });

  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch history";

    dispatch({
      type: ERROR,
      payload: { msg },
    });
  }
};

/** ================= GET PAYMENT RECOVERY ================= */
// ⭐ Naya Action Payment Recovery (Outstanding Dues) ke liye
export const getPaymentRecoveryAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getPaymentRecoveryService();

    // Reducer ko data bhej rahe hain
    dispatch({ type: GET_PAYMENT_RECOVERY, payload: data });

  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch recovery list";

    dispatch({
      type: ERROR,
      payload: { msg },
    });
  }
};