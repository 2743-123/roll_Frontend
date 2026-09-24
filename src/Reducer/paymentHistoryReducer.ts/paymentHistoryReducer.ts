import {
  GET_PAYMENT_HISTORY,
  GET_PAYMENT_RECOVERY, // ⭐ Import kiya
  PaymentHistoryResponse,
  PaymentRecoveryResponse, // ⭐ Import kiya
} from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";

export interface PaymentHistoryState {
  data: PaymentHistoryResponse | null;
  recoveryData: PaymentRecoveryResponse | null; // ⭐ Naya state add kiya
  loading: boolean;
  error: string | null;
}

const initialState: PaymentHistoryState = {
  data: null,
  recoveryData: null, // ⭐ Initialize kiya
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

    /** ⭐ Get payment recovery success */
    case GET_PAYMENT_RECOVERY:
      return {
        ...state,
        loading: false,
        recoveryData: action.payload, // ⭐ Yahan payload set kar diya
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