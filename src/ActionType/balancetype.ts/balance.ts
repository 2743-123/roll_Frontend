export const GET_BALANCE = "GET_BALANCE";
export const ADD_BALANCE_SUCCESS = "ADD_BALANCE_SUCCESS";

export interface MaterialBalance {
  total: string;
  used: string;
  remaining: string;
}

export interface BalanceData {
  user: number;
  flyash: MaterialBalance;
  bedash: MaterialBalance;
}

export interface BalanceState {
  data: BalanceData | null;
  error: string | null;
}
