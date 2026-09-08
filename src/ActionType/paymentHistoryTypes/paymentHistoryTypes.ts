export const GET_PAYMENT_HISTORY = "GET_PAYMENT_HISTORY";

export interface PaymentHistoryDetail {
  // Add Balance wale fields
  flyashAmount?: number;
  bedashAmount?: number;
  flyashTons?: number;
  bedashTons?: number;
  paymentMode?: string;
  referenceNumber?: string | null;

  // Token confirm wale fields
  advanceLeft?: number;
  confirmedTokens?: Array<{
    tokenId: number;
    truckNumber: string;
    weight: string | number;
    materialType: string;
    paidThisTime: number;
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