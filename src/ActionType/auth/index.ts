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
    token: string;
    user: {
      id: number;
      name: string;
      role: "admin" | "superadmin" | "user";
    };
  };
}

export interface LogoutAction {
  type: typeof LOGOUT;
}

export interface ErrorAction {
  type: typeof ERROR;
  payload: {
    msg: string | null;
    data?: any;
  };
}

export interface InProgressAction {
  type: typeof IN_PROGRESS;
}

// Union of actions
export type AuthAction =
  | InProgressAction
  | LoginSuccessAction
  | LogoutAction
  | ErrorAction;