import {
  GET_PAYMENT_HISTORY,
  PaymentHistoryResponse,
} from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";

export interface PaymentHistoryState {
  data: PaymentHistoryResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentHistoryState = {
  data: null,
  loading: false,
  error: null,
};

const paymentHistoryReducer = (
  state = initialState,
  action: any
): PaymentHistoryState => {
  switch (action.type) {
    /** 🔄 Loading state */
    case "PAYMENT_HISTORY_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };

    /** 📊 Get payment history success */
    case GET_PAYMENT_HISTORY:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };

    /** ❌ Error state */
    case "PAYMENT_HISTORY_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default paymentHistoryReducer;