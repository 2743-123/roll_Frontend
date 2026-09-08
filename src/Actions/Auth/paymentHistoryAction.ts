import { ERROR } from "../../ActionType/auth";
import { GET_PAYMENT_HISTORY } from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AppDispatch } from "../../store";
import { getPaymentHistoryService } from "../auth services/paymentHistory";

/** ================= GET PAYMENT HISTORY ================= */
export const getPaymentHistoryAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getPaymentHistoryService();

    // Reducer ko data bhej rahe hain
    dispatch({ type: GET_PAYMENT_HISTORY, payload: data });

    // Optional: Agar successfully fetch hone par Toast dikhana hai toh:
    // if (data?.msg) {
    //   dispatch(showNotification({ type: "success", message: data.msg }));
    // }
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch history";

    dispatch({
      type: ERROR,
      payload: { msg },
    });

    dispatch(
      showNotification({
        type: "error",
        message: msg,
      })
    );
  }
};