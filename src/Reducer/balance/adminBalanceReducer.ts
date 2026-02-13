import { ERROR } from "../../ActionType/auth";
import {
  AdminUserBalance,
  GET_ADMIN_BALANCE,
} from "../../ActionType/balancetype.ts/balance";

/**
 * State type
 */
export interface AdminBalanceState {
  data: AdminUserBalance[];
  totalUsers: number;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: AdminBalanceState = {
  data: [],
  totalUsers: 0,
  loading: false,
  error: null,
};

/**
 * Action type
 */
type AdminBalanceAction =
  | {
      type: typeof GET_ADMIN_BALANCE;
      payload: {
        data: AdminUserBalance[];
        totalUsers: number;
      };
    }
  | {
      type: typeof ERROR;
      payload: { msg: string };
    };

/**
 * Reducer
 */
const adminBalanceReducer = (
  state = initialState,
  action: AdminBalanceAction
): AdminBalanceState => {
  switch (action.type) {
    case GET_ADMIN_BALANCE:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        totalUsers: action.payload.totalUsers,
        error: null,
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.msg,
      };

    default:
      return state;
  }
};

export default adminBalanceReducer;
