import ENVIRONMENT_VARIABLES from "../../environment.config";

/* ================= AUTH ================= */
export const API_AUTH_LOGIN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/auth/login`;
export const API_AUTH_LOGOUT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/auth/logout`;

/* ================= USER ================= */
export const API_USER_GET = `${ENVIRONMENT_VARIABLES.Base_API_URL}/users/users`;
export const API_ADD_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/auth/register`;
export const API_UPDATE_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/users/update/:userId`;
export const API_DELETE_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/users/delete/:userId`;

/* ================= BALANCE ================= */
export const API_BALANCE_GET = `${ENVIRONMENT_VARIABLES.Base_API_URL}/balance/getBalance/:userId`;
export const API_BALANCE_ADD = `${ENVIRONMENT_VARIABLES.Base_API_URL}/balance/add`;
export const API_ADMIN_BALANCE = `${ENVIRONMENT_VARIABLES.Base_API_URL}/balance/getAllUserBalance`;

/* ⭐ NEW — Edit & Delete balance */
export const API_BALANCE_EDIT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/balance/edit/:transactionId`;
export const API_BALANCE_DELETE = `${ENVIRONMENT_VARIABLES.Base_API_URL}/balance/delete/:transactionId`;

/* ================= TOKEN ================= */
export const API_GET_TOKENS = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/all/:userId`;
export const API_CREATE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/create`;
export const API_UPDATE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/update`;
export const API_CONFIRM_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/confirm`;
export const API_GET_ALL_USER_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/all`;

/* ⭐ TOKEN DELETE */
export const API_DELETE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/:tokenId`;

/* ================= BEDASH ================= */
export const API_GET_BEDASH = `${ENVIRONMENT_VARIABLES.Base_API_URL}/message/all`;
export const API_CONFIRM_BEDASH = `${ENVIRONMENT_VARIABLES.Base_API_URL}/message/complete/:id`;
export const API_ADD_BEDASH = `${ENVIRONMENT_VARIABLES.Base_API_URL}/message/add`;

/* ================= PAYMENT HISTORY & RECOVERY ================= */
export const API_GET_PAYMENT_HISTORY = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/`;
export const API_GET_PAYMENT_RECOVERY = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/recovery`;
export const API_SETTLE_PAYMENT_RECOVERY = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/settle-recovery`;

/* ================= ⭐ MASTER LEDGER (ACCOUNT SETTLEMENT) ================= */
export const API_CREATE_MASTER_ACCOUNT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/master-account`;
export const API_GET_MASTER_ACCOUNTS = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/master-account`;
export const API_PROCESS_MASTER_TRANSACTION = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/master-transaction`;
export const API_GET_MASTER_TRANSACTIONS = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/master-account`; // Note: Frontend se API call karte waqt iske aage `/${accountId}/transactions` lagayenge

/* ================= ⭐ PENDING SETTLEMENT QUEUE (NEW) ================= */
export const API_ADD_PENDING_SETTLEMENT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/pending-settlement`;
export const API_GET_PENDING_SETTLEMENTS = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/pending-settlement`;
export const API_DELETE_PENDING_SETTLEMENT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/payment-history/pending-settlement/:id`; // ❌ YE NAYA URL ADD KIYA HAI 

/* ================= AI ASSISTANT ================= */
export const API_AI_COMMAND = `${ENVIRONMENT_VARIABLES.Base_API_URL}/ai/command`;