import { ERROR, IN_PROGRESS } from "../../ActionType/auth";
import { GET_BALANCE } from "../../ActionType/balancetype.ts/balance";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AppDispatch } from "../../store";
import { addBalanceService, getBalanceService } from "../auth services/balance";

export const getBalanceAction =
  (userId: number) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: IN_PROGRESS });

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
  (payload: { userId: number; flyashAmount: number; bedashAmount: number }) =>
  async (dispatch: AppDispatch) => {
    try {
      const data = await addBalanceService(payload);
      dispatch({ type: "ADD_BALANCE_SUCCESS", payload: data });
      dispatch(
        showNotification({
          type: "success",
          message: "Balence Add Sucessfully",
        })
      );
      return data;
    } catch (error) {
      dispatch({ type: "ADD_BALANCE_FAIL", payload: error });
      dispatch(
        showNotification({ type: "error", message: "Balance Add failed" })
      );
      throw error;
    }
  };
