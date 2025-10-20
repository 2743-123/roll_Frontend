// import { combineReducers } from "redux";
// import authReducer from "./Auth";

// const rootReducer = combineReducers({
//     auth:authReducer

// })

// export type RootState = ReturnType<typeof rootReducer>
// export default rootReducer;

import { combineReducers } from "redux";
import authReducer from "./Auth";
import { LOGOUT } from "../ActionType/auth";
import balanceReducer from "./balance/balance";
import userReducer from "./user";
import { tokenReducer } from "./tokenReducer";
import Notification from "../CommonCoponent/Notification/NotificationReduer";

const appReducer = combineReducers({
  auth: authReducer,
  balance: balanceReducer,
  user: userReducer,
  token: tokenReducer,
  notification: Notification,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined; // Redux Logger friendly, purana state clear
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof appReducer>;
export default rootReducer;
