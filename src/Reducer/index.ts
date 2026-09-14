import { combineReducers } from "redux";
import authReducer from "./Auth";
import { LOGOUT } from "../ActionType/auth";
import balanceReducer from "./balance/balance";
import userReducer from "./user";
import { tokenReducer } from "./tokenReducer";
import Notification from "../CommonCoponent/Notification/NotificationReduer";
import bedashReducer from "./bedash/bedashReducer";
import adminBalanceReducer from "./balance/adminBalanceReducer";
import adminTokenReducer from "./tokenReducer/adminToken";
import paymentHistoryReducer from "./paymentHistoryReducer.ts/paymentHistoryReducer";
import aiReducer from "./aiReducer/aiReducer"; // ✅ Import the AI reducer (path check kar lena)

const appReducer = combineReducers({
  auth: authReducer,
  balance: balanceReducer,
  user: userReducer,
  token: tokenReducer,
  notification: Notification,
  bedash: bedashReducer,
  adminBalanceReducer,
  adminTokenReducer,
  paymentHistoryReducer,
  aiReducer, // ✅ Added the AI reducer here
});

const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined; // Redux Logger friendly, purana state clear
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof appReducer>;
export default rootReducer;