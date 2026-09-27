import {
  GET_PAYMENT_HISTORY,
  GET_PAYMENT_RECOVERY,
  SETTLE_PAYMENT_RECOVERY,
  // ⭐ MASTER LEDGER IMPORTS
  CREATE_MASTER_ACCOUNT,
  GET_MASTER_ACCOUNTS,
  PROCESS_MASTER_TRANSACTION,
  GET_MASTER_TRANSACTIONS,
  // ⭐ PENDING SETTLEMENT IMPORTS
  SET_PENDING_SETTLEMENT,
  CLEAR_PENDING_SETTLEMENT,
  GET_PENDING_SETTLEMENTS, // ⭐ Naya Import (DB Queue ke liye)
  PaymentHistoryResponse,
  PaymentRecoveryResponse,
  MasterAccount, 
  MasterTransaction,
  PendingSettlement // ⭐ Naya Type Import
} from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";

export interface PaymentHistoryState {
  data: PaymentHistoryResponse | null;
  recoveryData: PaymentRecoveryResponse | null;
  
  // ⭐ MASTER LEDGER
  masterAccounts: MasterAccount[] | null;
  masterTransactions: { [accountId: number]: MasterTransaction[] } | null;
  
  // ⭐ PENDING SETTLEMENT QUEUE (Nayi Database List)
  pendingSettlementsList: PendingSettlement[] | null;
  
  // Purana local state (Optional, safety ke liye rakha hai)
  pendingSettlement: { amount: number; sourceDetails: string } | null;
  
  loading: boolean;
  error: string | null;
}

const initialState: PaymentHistoryState = {
  data: null,
  recoveryData: null,
  masterAccounts: null,
  masterTransactions: null, 
  pendingSettlementsList: null, // Nayi List initialize ki
  pendingSettlement: null, 
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
      return { ...state, loading: true, error: null };

    /** 📊 Get payment history success */
    case GET_PAYMENT_HISTORY:
      return { ...state, loading: false, data: action.payload, error: null };

    /** ⭐ Get payment recovery success */
    case GET_PAYMENT_RECOVERY:
      return { ...state, loading: false, recoveryData: action.payload, error: null };

    /** ⭐ Settle payment recovery success */
    case SETTLE_PAYMENT_RECOVERY:
    case CREATE_MASTER_ACCOUNT:
    case PROCESS_MASTER_TRANSACTION:
      return { ...state, loading: false, error: null };

    /** ==========================================
        ⭐ MASTER LEDGER REDUCER CASES ⭐
    ========================================== */

    /** Saare Accounts Fetch karna (Success) */
    case GET_MASTER_ACCOUNTS:
      return { ...state, loading: false, masterAccounts: action.payload, error: null };

    /** Specific Account ki Transactions Lana (Success) */
    case GET_MASTER_TRANSACTIONS:
      return {
        ...state,
        loading: false,
        masterTransactions: {
          ...state.masterTransactions,
          [action.payload.accountId]: action.payload.data,
        },
        error: null,
      };

    /** ==========================================
        ⭐ PENDING SETTLEMENT CASES (DB QUEUE) ⭐
    ========================================== */
    
    /** 🚀 Database se aayi hui poori Pending List (Queue) ko save karna */
    case GET_PENDING_SETTLEMENTS:
    case "GET_PENDING_SETTLEMENTS_LIST": // Backup string from action
      return {
        ...state,
        pendingSettlementsList: action.payload, // Yahan array set hoga
      };

    /** Local Pending state (Fallback) */
    case SET_PENDING_SETTLEMENT:
      return {
        ...state,
        pendingSettlement: action.payload,
      };

    /** Local Pending state ko clear karna */
    case CLEAR_PENDING_SETTLEMENT:
      return {
        ...state,
        pendingSettlement: null,
      };

    /** ❌ Error state */
    case "PAYMENT_HISTORY_ERROR":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default paymentHistoryReducer;