import { ERROR } from "../../ActionType/auth";
import { 
  GET_PAYMENT_HISTORY, 
  GET_PAYMENT_RECOVERY,
  SETTLE_PAYMENT_RECOVERY,
  SettleRecoveryRequest,
  // ⭐ MASTER LEDGER IMPORTS
  CREATE_MASTER_ACCOUNT,
  GET_MASTER_ACCOUNTS,
  PROCESS_MASTER_TRANSACTION,
  GET_MASTER_TRANSACTIONS,
  CreateMasterAccountRequest,
  ProcessMasterTransactionRequest,
  CLEAR_PENDING_SETTLEMENT,
  GET_PENDING_SETTLEMENTS
} from "../../ActionType/paymentHistoryTypes/paymentHistoryTypes";
import { AppDispatch } from "../../store";
import { 
  getPaymentHistoryService, 
  getPaymentRecoveryService,
  settlePaymentRecoveryService,
  createMasterAccountService,
  getMasterAccountsService,
  processMasterTransactionService,
  getMasterAccountTransactionsService,
  toggleMasterAccountFavoriteService, // ⭐ Naya Import
  // ⭐ PENDING SETTLEMENT SERVICES
  addPendingSettlementService,
  getPendingSettlementsService,
  deletePendingSettlementService
} from "../auth services/paymentHistory";

/** ================= GET PAYMENT HISTORY ================= */
export const getPaymentHistoryAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getPaymentHistoryService();
    dispatch({ type: GET_PAYMENT_HISTORY, payload: data });
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch history";
    dispatch({ type: ERROR, payload: { msg } });
  }
};

/** ================= GET PAYMENT RECOVERY ================= */
export const getPaymentRecoveryAction = () => async (dispatch: AppDispatch) => {
  try {
    const data = await getPaymentRecoveryService();
    dispatch({ type: GET_PAYMENT_RECOVERY, payload: data });
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch recovery list";
    dispatch({ type: ERROR, payload: { msg } });
  }
};

/** ================= SETTLE PAYMENT RECOVERY ================= */
export const settlePaymentRecoveryAction = (payload: SettleRecoveryRequest) => async (dispatch: AppDispatch) => {
  try {
    const response = await settlePaymentRecoveryService(payload);

    dispatch({
      type: SETTLE_PAYMENT_RECOVERY,
      payload: response,
    });

    // ⭐ Jaise hi recovery pay ho, seedha backend queue me bhejo
    await dispatch(setPendingSettlementAction(
      Number(payload.amount),
      `Recovery Paid by ${payload.entityName} (${payload.entityType}) - ${payload.reason || "Payment Settlement"}`
    ));

    await dispatch(getPaymentRecoveryAction());
    await dispatch(getPaymentHistoryAction());

    return { success: true, data: response };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to settle payment recovery";
    dispatch({ type: ERROR, payload: { msg } });
    return { success: false, msg };
  }
};

/** ================= ⭐ MASTER LEDGER ACTIONS ⭐ ================= */

export const createMasterAccountAction = (payload: CreateMasterAccountRequest) => async (dispatch: AppDispatch) => {
  try {
    const response = await createMasterAccountService(payload);
    dispatch({ type: CREATE_MASTER_ACCOUNT, payload: response.data });
    await dispatch(getMasterAccountsAction());
    return { success: true, msg: response.msg };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to create master account";
    dispatch({ type: ERROR, payload: { msg } });
    return { success: false, msg };
  }
};

export const getMasterAccountsAction = () => async (dispatch: AppDispatch) => {
  try {
    const response = await getMasterAccountsService();
    dispatch({ type: GET_MASTER_ACCOUNTS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch master accounts";
    dispatch({ type: ERROR, payload: { msg } });
    return { success: false, msg };
  }
};

// ⭐ NAYA ACTION: Favorite Toggle Karne Ke Liye
export const toggleMasterAccountFavoriteAction = (accountId: number) => async (dispatch: AppDispatch) => {
  try {
    const response = await toggleMasterAccountFavoriteService(accountId);
    
    // Status update hone ke baad automatically accounts list fetch karo 
    // Taaki favorited account list me sabse upar aa jaye
    await dispatch(getMasterAccountsAction());

    return { success: true, msg: response.msg };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to update favorite status";
    dispatch({ type: ERROR, payload: { msg } });
    return { success: false, msg };
  }
};

export const processMasterTransactionAction = (payload: ProcessMasterTransactionRequest) => async (dispatch: AppDispatch) => {
  try {
    const response = await processMasterTransactionService(payload);
    dispatch({ type: PROCESS_MASTER_TRANSACTION, payload: response });
    
    // Transaction success ke baad dono lists refresh karein
    await dispatch(getMasterAccountsAction());
    await dispatch(getPendingSettlementsAction()); 

    return { success: true, msg: response.msg };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to process transaction";
    dispatch({ type: ERROR, payload: { msg } });
    return { success: false, msg };
  }
};

export const getMasterAccountTransactionsAction = (accountId: number) => async (dispatch: AppDispatch) => {
  try {
    const response = await getMasterAccountTransactionsService(accountId);
    dispatch({ type: GET_MASTER_TRANSACTIONS, payload: { accountId, data: response.data } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to fetch account transactions";
    dispatch({ type: ERROR, payload: { msg } });
    return { success: false, msg };
  }
};

/** ================= ⭐ PENDING SETTLEMENT ACTIONS (DB QUEUE) ⭐ ================= */

// 1. Queue me data bhejna
export const setPendingSettlementAction = (amount: number, sourceDetails: string) => async (dispatch: AppDispatch) => {
  try {
    await addPendingSettlementService({ amount, sourceDetails });
    dispatch(getPendingSettlementsAction()); 
  } catch (error: any) {
    console.error("Failed to add pending settlement:", error);
  }
};

// 2. Database se saari Pending list (Queue) fetch karna
export const getPendingSettlementsAction = () => async (dispatch: AppDispatch) => {
  try {
    const response = await getPendingSettlementsService();
    dispatch({
      type: GET_PENDING_SETTLEMENTS,
      payload: response.data
    });
  } catch (error: any) {
    console.error("Failed to fetch pending settlements:", error);
  }
};

// 3. Local UI state clear karne ke liye (Optional)
export const clearPendingSettlementAction = () => (dispatch: AppDispatch) => {
  dispatch({ type: CLEAR_PENDING_SETTLEMENT });
};

export const deletePendingSettlementAction = (id: number) => async (dispatch: AppDispatch) => {
  try {
    await deletePendingSettlementService(id);
    
    dispatch(getPendingSettlementsAction());
    return { success: true };
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error.message || "Failed to delete pending settlement";
    console.error(msg);
    return { success: false, msg };
  }
};