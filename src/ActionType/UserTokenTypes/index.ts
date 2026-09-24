export const TOKEN_GET_SUCCESS = "TOKEN_GET_SUCCESS";
export const TOKEN_CLEAR = "TOKEN_CLEAR";
export const TOKEN_CREATE_SUCCESS = "TOKEN_CREATE_SUCCESS";
export const TOKEN_CONFIRM_SUCCESS = "TOKEN_CONFIRM_SUCCESS";
export const TOKEN_UPDATE_SUCCESS = "TOKEN_UPDATE_SUCCESS";
export const GET_ADMIN_TOKENS = "GET_ADMIN_TOKENS";
export const TOKEN_DELETE_SUCCESS = "TOKEN_DELETE_SUCCESS";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin" | string;
}

export interface Token {
  id: number;
  customerName?: string | null;
  customerPhone?: string | null; 
  truckNumber?: string | null;
  materialType?: string | null;
  weight?: string | number | null;
  ratePerTon?: string | number | null;
  commission?: string | number | null;
  totalAmount?: string | number | null;
  paidAmount?: string | number | null;
  carryForward?: string | number | null;

  cartingOwnerName?: string | null;
  cartingOwnerPhone?: string | null;
  tokenOwnerType?: "owner" | "another" | string | null;
  anotherTokenOwnerName?: string | null;
  anotherTokenOwnerPhone?: string | null;

  sellRate?: string | number | null;
  cartingRate?: string | number | null;
  totalCarting?: string | number | null;
  tokenOwnerRate?: string | number | null;
  totalTokenOwnerAmount?: string | number | null;

  cartingPaidAmount?: string | number | null;
  cartingCarryForward?: string | number | null;
  tokenOwnerPaidAmount?: string | number | null;
  tokenOwnerCarryForward?: string | number | null;

  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  confirmedAt?: string | null;
  user?: any;
}

export interface TokenState {
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

// ⭐ YAHAN DHYAN DEIN: Isme weight aur baaki sab shamil hai
export interface AdminToken {
  tokenId: number;
  customerName: string;
  truckNumber: string;
  materialType: string;
  weight: string | number | null;           // <-- YAHAN WEIGHT HAI
  carryForward: string | number | null;
  status: string;
  userId: number;
  userName: string;
  remainingTons: string | number | null;
  createdAt: string;
  updatedAt?: string | null;
  confirmedAt?: string | null;

  ratePerTon?: string | number | null;
  commission?: string | number | null;
  totalAmount?: string | number | null;
  paidAmount?: string | number | null;
  
  cartingOwnerName?: string | null;
  cartingOwnerPhone?: string | null;
  tokenOwnerType?: string | null;
  anotherTokenOwnerName?: string | null;
  anotherTokenOwnerPhone?: string | null;

  sellRate?: string | number | null;
  cartingRate?: string | number | null;
  totalCarting?: string | number | null;
  tokenOwnerRate?: string | number | null;
  totalTokenOwnerAmount?: string | number | null;

  cartingPaidAmount?: string | number | null;
  cartingCarryForward?: string | number | null;
  tokenOwnerPaidAmount?: string | number | null;
  tokenOwnerCarryForward?: string | number | null;
}

export interface AdminTokenResponse {
  msg: string;
  totalTokens: number;
  data: AdminToken[];
}