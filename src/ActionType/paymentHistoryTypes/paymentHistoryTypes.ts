export const GET_PAYMENT_HISTORY = "GET_PAYMENT_HISTORY";
export const GET_PAYMENT_RECOVERY = "GET_PAYMENT_RECOVERY"; // ⭐ Naya Action Type

// ==========================================
// PAYMENT HISTORY INTERFACES
// ==========================================
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
  advanceLeft?: number;
  confirmedTokens?: Array<{
    tokenId: number;
    userName?: string;
    customerName?: string;
    truckNumber: string;
    weight: string | number;
    materialType: string;
    sellRate?: number;
    ratePerTon?: number;
    cartingRate?: number;
    tokenOwnerRate?: number;
    commission?: number;
    totalAmount?: number;
    totalCarting?: number;
    totalTokenOwnerAmount?: number;
    paidThisTime: number;
    totalPaidNow?: number;
    dueNow?: number;
    isFullyCleared?: boolean;
    
    // ⭐ Added missing stakeholder fields here
    cartingOwnerName?: string | null;
    tokenOwnerType?: string | null;
    anotherTokenOwnerName?: string | null;
    cartingCarryForward?: number;
    tokenOwnerCarryForward?: number;
  }>;
}

export interface PaymentHistoryEntry {
  id: number;
  date: string;
  type: "add_balance" | "token_payment";
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
  
  // ⭐ Naye fields jo backend se aayenge
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
  entityType: "Customer" | "Carting" | "Token Owner"; // Naya Type Add kiya
  dealerName: string;
  totalOverallDue: number;
  tokens: RecoveryTokenDetail[];
}

export interface PaymentRecoveryResponse {
  msg: string;
  data: PaymentRecoveryEntry[];
}