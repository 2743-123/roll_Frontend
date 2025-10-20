export const GET_USERS_SUCCESS = "GET_USERS_SUCCESS";
export const SELECT_USER = "SELECT_USER";
export const ADD_USER_SUCCESS = "ADD_USER_SUCCESS";
export const UPDATE_USER_SUCCESS = "UPDATE_USER_SUCCESS";
export const DELETE_USER_SUCCESS = "DELETE_USER_SUCCESS";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "superadmin" | "user";
  data?: any;
  isActive: boolean;
}

export interface userState {
  loading: boolean;
  users: User[];
  selectedUser: User | null;
  isActive: boolean;
  sucees: string | null;
}

export interface GetUsersSuccessAction {
  type: typeof GET_USERS_SUCCESS;
  payload: User[];
}

export interface SelectedUserAction {
  type: typeof SELECT_USER;
  payload: {
    user: User | null;
  };
}

interface AddUserAction {
  type: typeof ADD_USER_SUCCESS;
  // payload: User; // ⚠️ Ye **single User** hona chahiye
  payload: {
    payload: User;
    msg: string;
  };
}

export interface UpdateUserAction {
  type: typeof UPDATE_USER_SUCCESS;
  payload: {
    user: User; // ✅ user object ke andar
    message: string; // optional
  };
}

interface DeleteUserSuccessAction {
  type: typeof DELETE_USER_SUCCESS;
  payload: number; // user id
}

export type userAction =
  | GetUsersSuccessAction
  | SelectedUserAction
  | AddUserAction
  | UpdateUserAction
  | DeleteUserSuccessAction;
