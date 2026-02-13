import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  type: "success" | "error" | "info" | "warning" | null;
  message: string | null;
}

const initialState: NotificationState = {
  type: null,
  message: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        type: NotificationState["type"];
        message: string;
      }>,
    ) => {
      state.type = action.payload.type;
      state.message = action.payload.message;
    },
    clearNotification: (state) => {
      state.type = null;
      state.message = null;
    },
  },
});

export const { showNotification, clearNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
