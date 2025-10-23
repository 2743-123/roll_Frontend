import { ERROR} from "../../ActionType/auth";
import { CONFIRM_BEDASH_SUCCESS, GET_BEDASH_LIST } from "../../ActionType/bedash/bedash";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AppDispatch } from "../../store";
import { addBedashService, confirmBedashService, getBedashService } from "../auth services/bedashServices";

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
    } catch (error: any) {
      dispatch({
        type: ERROR,
        payload: { msg: error?.response?.data?.msg || error.message },
      });
    }
  };

  export const addBedashAction = (payload: any) => async (dispatch: AppDispatch) => {
  try {
    await addBedashService(payload);
    dispatch(showNotification({ type: "success", message: "Bedash added successfully" }));
  } catch (error: any) {
    dispatch(showNotification({ type: "error", message: "Failed to add Bedash" }));
  }
};