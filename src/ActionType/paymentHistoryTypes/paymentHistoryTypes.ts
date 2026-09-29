// ==========================================
// ACTION TYPES
// ==========================================
export const GET_PAYMENT_HISTORY = "GET_PAYMENT_HISTORY";
export const GET_PAYMENT_RECOVERY = "GET_PAYMENT_RECOVERY";
export const SETTLE_PAYMENT_RECOVERY = "SETTLE_PAYMENT_RECOVERY";

// ⭐ NAYE ACTION TYPES FOR MASTER LEDGER
export const CREATE_MASTER_ACCOUNT = "CREATE_MASTER_ACCOUNT";
export const GET_MASTER_ACCOUNTS = "GET_MASTER_ACCOUNTS";
export const PROCESS_MASTER_TRANSACTION = "PROCESS_MASTER_TRANSACTION";
export const GET_MASTER_TRANSACTIONS = "GET_MASTER_TRANSACTIONS";
export const TOGGLE_MASTER_ACCOUNT_FAVORITE = "TOGGLE_MASTER_ACCOUNT_FAVORITE";

// ⭐ NAYE ACTION TYPES FOR PENDING SETTLEMENT QUEUE (DB)
export const SET_PENDING_SETTLEMENT = "SET_PENDING_SETTLEMENT";
export const CLEAR_PENDING_SETTLEMENT = "CLEAR_PENDING_SETTLEMENT";
export const GET_PENDING_SETTLEMENTS = "GET_PENDING_SETTLEMENTS";

// ==========================================
// PAYMENT HISTORY INTERFACES
// ==========================================

export interface SettledTokenSummary {
  tokenId: number;
  truckNumber?: string;
  appliedAmount: number;
  previousDue?: number;
  updatedDue: number;
  newDue?: number;
}

export interface StakeholderPaymentDetail {
  ownerName: string;
  phone?: string;
  truckNumber?: string;
  rate?: number;
  paidThisTime: number;
  totalBill: number;
  totalPaidNow: number;
  dueNow: number;
}

export interface PaymentHistoryDetail {
  // Add Balance wale fields
  flyashAmount?: number;
  bedashAmount?: number;
  flyashTons?: number;
  bedashTons?: number;
  paymentMode?: string;
  referenceNumber?: string | null;
  cartingPaidThisTime?: number;
  ownerPaidThisTime?: number;

  // Token confirm wale fields
  tokenId?: number;
  truckNumber?: string;
  reason?: string;
  advanceLeft?: number;
  status?: string;

  confirmedTokens?: Array<any>;

  cartingDetails?: StakeholderPaymentDetail | null;
  tokenOwnerDetails?: StakeholderPaymentDetail | null;

  category?: "RECOVERY_PAYMENT" | "DUE_ADJUSTMENT";
  actionLabel?: string;
  entityName?: string;
  entityType?: "Customer" | "Carting" | "Token Owner";
  excessUnallocated?: number;
  unadjustedPenalty?: number;
  settledTokens?: SettledTokenSummary[];
  tokensBreakdown?: SettledTokenSummary[];

  // ⭐ RICH DETAILS (New fields for Payment Recovery Timeline)
  isSingleTokenRecord?: boolean;
  customerName?: string;
  material?: string;
  weight?: number | string;
  ratePerTon?: number;
  sellRate?: number;
  cartingRate?: number;
  tokenOwnerRate?: number;
  commission?: number;
  totalAmount?: number;
  totalCarting?: number;
  totalTokenOwnerAmount?: number;
  cartingOwnerName?: string | null;
  anotherTokenOwnerName?: string | null;

  paymentTimeline?: Array<{
    date: string;
    stakeholder: string;
    amount: number;
    remainingDue: number;
    advanceLeft?: number;
    reason?: string;
  }>;
}

export interface PaymentHistoryEntry {
  id: number;
  date: string;
  type: "add_balance" | "token_payment" | "Token Confirmed" | "Token Updated" | "payment_recovery" | string;
  amount: number;
  userName: string;
  adminName: string;
  details: PaymentHistoryDetail;
}

export interface PaymentHistoryResponse {
  msg: string;
  data: PaymentHistoryEntry[];
}

// ==========================================
// ⭐ PAYMENT RECOVERY (PENDING DUES) INTERFACES
// ==========================================

export interface RecoveryTokenDetail {
  tokenId: number;
  date: string;
  materialType: string;
  truckNumber: string;
  dueAmount: number;
  status: string;
  userName?: string;
  weight?: number | string;
  ratePerTon?: number;
  sellRate?: number;
  cartingRate?: number;
  tokenOwnerRate?: number;
  commission?: number;
}

export interface PaymentRecoveryEntry {
  entityName: string;
  entityPhone: string;
  entityType: "Customer" | "Carting" | "Token Owner";
  dealerName: string;
  totalOverallDue: number;
  tokens: RecoveryTokenDetail[];
}

export interface PaymentRecoveryResponse {
  msg: string;
  data: PaymentRecoveryEntry[];
}

export interface SettleRecoveryRequest {
  entityName: string;
  entityType: "Customer" | "Carting" | "Token Owner";
  amount: number; 
  reason: string;
  adminId?: number;
}

export interface SettleRecoveryResponse {
  msg: string;
  settledTokens?: SettledTokenSummary[];
  affectedTokens?: SettledTokenSummary[];
  remainingUnallocated: number;
}

// ==========================================
// ⭐ MASTER LEDGER INTERFACES
// ==========================================

export interface MasterAccount {
  id: number;
  name: string;
  phone: string | null;
  accountType: "Cash" | "Bank" | "Customer" | "Carting" | "Token Owner" | "General";
  balance: number;
  isActive: boolean;
  isFavorite?: boolean; // ⭐ Favorites support
  createdAt: string;
  updatedAt: string;
}

export interface MasterTransaction {
  id: number;
  date: string;
  type: "CREDIT" | "DEBIT" | "TRANSFER";
  paymentMode: "Cash" | "Online";
  amount: number;
  balanceAfter: number;
  reason: string | null;
  performedBy: string;
  linkedAccountName: string | null;
}

export interface CreateMasterAccountRequest {
  name: string;
  phone?: string;
  accountType?: "Cash" | "Bank" | "Customer" | "Carting" | "Token Owner" | "General";
}

export interface ProcessMasterTransactionRequest {
  sourceAccountId: number;
  amount: number;
  type: "CREDIT" | "DEBIT" | "TRANSFER";
  paymentMode?: "Cash" | "Online";
  reason?: string;
  destAccountId?: number; // Sirf TRANSFER ke case me use hoga
  pendingSettlementId?: number; // ⭐ DB queue record hatane ke liye (NEW)
}

// ==========================================
// ⭐ PENDING SETTLEMENT (DB QUEUE) INTERFACES
// ==========================================

export interface PendingSettlement {
  id: number;
  amount: number;
  sourceDetails: string;
  status: string; // "pending" ya "settled"
  createdAt: string;
}