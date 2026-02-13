import { ERROR } from "../../ActionType/auth";
import {
  GET_ADMIN_TOKENS,
  TOKEN_CLEAR,
  TOKEN_CONFIRM_SUCCESS,
  TOKEN_CREATE_SUCCESS,
  TOKEN_GET_SUCCESS,
  TOKEN_UPDATE_SUCCESS,
} from "../../ActionType/UserTokenTypes";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AppDispatch } from "../../store";
import {
  confirmPaymentService,
  createTokenService,
  deleteTokenService,
  getAdminTokensService,
  getTokensService,
  updateTokenService,
} from "../auth services/tokenServices";

export const getTokenAction =
  (userId: number) => async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: TOKEN_CLEAR });
      const tokens = await getTokensService(userId);
      dispatch({ type: TOKEN_GET_SUCCESS, payload: tokens });
    } catch (err) {
      console.error(err);
      dispatch({ type: ERROR, payload: err });
    }
  };

export const createTokenAction =
  (tokenData: any) => async (dispatch: AppDispatch) => {
    try {
      const data = await createTokenService(tokenData);
      dispatch({ type: TOKEN_CREATE_SUCCESS, payload: data });
      dispatch(getTokenAction(tokenData.userId)); // refresh list
      dispatch(
        showNotification({
          type: "success",
          message: "Token Create successfully!",
        }),
      );
    } catch (err: any) {
      dispatch({
        type: ERROR,
        payload: err.response?.data?.msg || "Failed to create token",
      });
    }
  };

export const updateTokenAction =
  (payload: any) => async (dispatch: AppDispatch) => {
    try {
      const res = await updateTokenService(payload);
      dispatch({ type: TOKEN_UPDATE_SUCCESS, payload: res });
      dispatch(
        showNotification({
          type: "success",
          message: "Token Update successfully!",
        }),
      );
    } catch (err: any) {
      dispatch({
        type: ERROR,
        payload: err.response?.data?.msg || "Update failed",
      });
    }
  };

export const confirmPaymentAction =
  (payload: any) => async (dispatch: AppDispatch) => {
    try {
      const res = await confirmPaymentService(payload);
      dispatch({ type: TOKEN_CONFIRM_SUCCESS, payload: res });
      dispatch(
        showNotification({
          type: "success",
          message: "Token Confirm successfully!",
        }),
      );
    } catch (err: any) {
      dispatch({
        type: ERROR,
        payload: err.response?.data?.msg || "Confirm failed",
      });
    }
  };

export const getAdminTokensAction = () => async (dispatch: AppDispatch) => {
  try {
    dispatch({ type: "GET_ADMIN_TOKENS_REQUEST" });

    const data = await getAdminTokensService();

    dispatch({
      type: GET_ADMIN_TOKENS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: ERROR,
      payload: { msg: error?.response?.data?.msg || "Token fetch failed" },
    });
  }
};

export const deleteTokenAction =
  (tokenId: number, userId: number) => async (dispatch: AppDispatch) => {
    try {
      await deleteTokenService(tokenId);

      // refresh token list after delete
      dispatch(getTokenAction(userId));

      dispatch(
        showNotification({
          type: "success",
          message: "Token deleted successfully!",
        }),
      );
    } catch (err: any) {
      dispatch({
        type: ERROR,
        payload: err.response?.data?.msg || "Delete failed",
      });
    }
  };
