import { ERROR } from "../../ActionType/auth";
import { showNotification } from "../../CommonCoponent/Notification/NotificationReduer";
import { AppDispatch } from "../../store";
import { sendAiCommandService } from "../auth services/ai";

/** ================= SEND AI COMMAND ================= */
export const sendAiCommandAction =
  (command: string) => async (dispatch: AppDispatch) => {
    try {
      // API call to backend
      const data = await sendAiCommandService(command);

      // Success Notification
      dispatch(
        showNotification({
          type: "success",
          message: data?.msg || "Command executed successfully",
        })
      );

      // Return data so the UI component (Drawer/Chatbox) can display the response
      return data;
    } catch (error: any) {
      // Extract error message
      const errorMsg = error?.response?.data?.msg || error?.msg || error.message || "AI Command failed";

      // Dispatch error to Redux state
      dispatch({
        type: ERROR,
        payload: { msg: errorMsg },
      });

      // Show Error Notification
      dispatch(
        showNotification({
          type: "error",
          message: errorMsg,
        })
      );

      // Throw error so the calling component can catch it
      throw error;
    }
  };