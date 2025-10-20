import {
  BalanceState,
  GET_BALANCE,
} from "../../ActionType/balancetype.ts/balance";

const initialState: BalanceState = {
  data: null,
  error: null,
};

const balanceReducer = (state = initialState, action: any): BalanceState => {
  switch (action.type) {
    case GET_BALANCE:
      return {
        ...state,
        data: action.payload,
        error: action.payload.error,
      };

    case "ADD_BALANCE_SUCCESS":
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload.data, // merge updated balances
        },
      };

    default:
      return state;
  }
};
export default balanceReducer;
