export const GET_BALANCE = "GET_BALANCE";
export const ADD_BALANCE_SUCCESS = "ADD_BALANCE_SUCCESS";



export interface Transaction {
  id: number;
  date: string;
  flyashAmount: string;
  bedashAmount: string;
  totalAmount: string;
  flyashTons: string;
  bedashTons: string;
  paymentMode: "cash" | "online";
  bankName?: string | null;
  accountHolder?: string | null;
  referenceNumber?: string | null;
}

export interface MaterialBalance {
  total: string;
  used: string;
  remaining: string;
}

interface BalanceData {
  user: { id: number; name: string };
  flyash: { total: string; used: string; remaining: string };
  bedash: { total: string; used: string; remaining: string };
  transactions: Transaction[];
}

export interface BalanceState {
  data: BalanceData | null;
  loading: boolean;
  error: string | null;
}
