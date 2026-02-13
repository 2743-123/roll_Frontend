export const TOKEN_GET_SUCCESS = "TOKEN_GET_SUCCESS";
export const TOKEN_CLEAR = "TOKEN_CLEAR";
export const TOKEN_CREATE_SUCCESS = "TOKEN_CREATE_SUCCESS";
export const TOKEN_CONFIRM_SUCCESS = "TOKEN_CONFIRM_SUCCESS";
export const TOKEN_UPDATE_SUCCESS = "TOKEN_UPDATE_SUCCESS";
export const GET_ADMIN_TOKENS = "GET_ADMIN_TOKENS";
export const TOKEN_DELETE_SUCCESS = "TOKEN_DELETE_SUCCESS";



// types/tokenTypes.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
}

export interface Token {
  id: number;
  customerName: string;
  truckNumber: string;
  materialType: string;
  weight: string;
  ratePerTon: string;
  commission: string;
  totalAmount: string;
  paidAmount: string;
  carryForward: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface TokenState {
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

export interface AdminToken {
  tokenId: number;
  customerName: string;
  truckNumber: string;
  materialType: "flyash" | "bedash";
  weight: string;
  carryForward: string;
  status: "pending" | "updated" | "completed";
  userId: number;
  userName: string;
  remainingTons: string;
  createdAt: string;
  confirmedAt: string | null;
}

export interface AdminTokenResponse {
  msg: string;
  totalTokens: number;
  data: AdminToken[];
}
