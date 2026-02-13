import {
  BalanceState,
  GET_BALANCE,
  GET_ADMIN_BALANCE,
} from "../../ActionType/balancetype.ts/balance";

const initialState: BalanceState = {
  data: null,
  loading: false,
  error: null,
};

const balanceReducer = (state = initialState, action: any): BalanceState => {
  switch (action.type) {
    /** 🔄 Loading (optional but recommended) */
    case "BALANCE_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };

    /** 📊 Get single user balance */
    case GET_BALANCE:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };

    /** 📊 Admin balance report */
    case GET_ADMIN_BALANCE:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };

    /** ➕ Add balance */
    case "ADD_BALANCE_SUCCESS":
      return {
        ...state,
        loading: false,
        // best practice → refetch already done in action
        // so reducer just keeps current data
      };

    case "ADD_BALANCE_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    /** ✏️ Edit balance */
    case "EDIT_BALANCE_SUCCESS":
      return {
        ...state,
        loading: false,
        // data already refreshed via getBalanceAction
      };

    /** 🗑️ Delete balance */
    case "DELETE_BALANCE_SUCCESS":
      return {
        ...state,
        loading: false,
        // data refreshed from server → no manual mutation
      };

    /** ❌ Global error */
    case "BALANCE_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default balanceReducer;
