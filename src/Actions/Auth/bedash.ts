import { ERROR } from "../../ActionType/auth";
import {
  ADD_BEDASH_SUCCESS, 
  CONFIRM_BEDASH_SUCCESS,
  GET_BEDASH_LIST,
} from "../../ActionType/bedash/bedash";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AppDispatch } from "../../store";
import {
  addBedashService,
  confirmBedashService,
  getBedashService,
} from "../auth services/bedashServices";

export const getBedashListAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getBedashService();
    dispatch({ type: GET_BEDASH_LIST, payload: data });
  } catch (error: any) {
    dispatch({
      type: ERROR,
      payload: { msg: error?.response?.data?.msg || error.message },
    });
  }
};

export const confirmBedashAction =
  (id: number) => async (dispatch: AppDispatch) => {
    try {
      const data = await confirmBedashService(id);
      dispatch({ type: CONFIRM_BEDASH_SUCCESS, payload: data });
      
      dispatch(
        showNotification({
          type: "success",
          message: "Bedash confirmed successfully",
        }),
      );
    } catch (error: any) {
      const msg = error?.response?.data?.msg || error.message;
      dispatch({
        type: ERROR,
        payload: { msg },
      });
      dispatch(
        showNotification({ type: "error", message: msg || "Failed to confirm Bedash" }),
      );
    }
  };

export const addBedashAction =
  (payload: any) => async (dispatch: AppDispatch) => { // Tip: Replace 'any' with your payload Interface
    try {
      const data = await addBedashService(payload);
      
      dispatch({ type: ADD_BEDASH_SUCCESS, payload: data });
      dispatch(getBedashListAction());

      dispatch(
        showNotification({
          type: "success",
          message: "Bedash added successfully",
        }),
      );
    } catch (error: any) {
      const msg = error?.response?.data?.msg || error.message;
      
      // 👈 FIX: Yahan ERROR action dispatch karna zaroori hai
      dispatch({
        type: ERROR,
        payload: { msg }, 
      });

      dispatch(
        showNotification({ type: "error", message: msg || "Failed to add Bedash" }),
      );
    }
  };