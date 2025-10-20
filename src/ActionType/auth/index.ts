// Action Types
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const ERROR = "ERROR";
export const IN_PROGRESS = "IN_PROGRESS";

// User type
export interface User {
  id: number;
  name: string;
  email: string;
  data?: any;
  loading: boolean;
  role: "admin" | "superadmin" | "user";
}

// State type
export interface AuthState {
  token: string | null;
  role: string | null;
  error: string | null;
  // ✅ always array
  loading: boolean;
  user: {
    id: number;
    name: string;
    role: "admin" | "superadmin" | "user";
  } | null;
}

// Action interfaces
export interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: {
    type: string;
    token: string;
    user: {
      id: number;
      name: string;
      role: "admin" | "superadmin" | "user"; // ✅ corrected
    };
  };
}

export interface LogoutAction {
  type: typeof LOGOUT;
  loading: boolean;
}

export interface ErrorAction {
  type: typeof ERROR;
  payload: {
    msg: null;
    data?: null;
  };
}
export interface InProgress {
  type: typeof IN_PROGRESS;
  loading: boolean;
}

// Union of actions
export type AuthAction =
  | InProgress
  | LoginSuccessAction
  | LogoutAction
  | ErrorAction;
