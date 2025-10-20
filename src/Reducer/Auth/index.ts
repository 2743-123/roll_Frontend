import {
  AuthState,
  AuthAction,
  LOGIN_SUCCESS,
  LOGOUT,
  ERROR,
  IN_PROGRESS,
} from "../../ActionType/auth";
const accessToken = localStorage.getItem("accessToken");

let token = null;
if (accessToken !== "undefined " && accessToken !== null) {
  token = accessToken;
}

const initialState: AuthState = {
  token: token,
  role: null,
  loading: false,
  user: null,
  error: null,
};

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case IN_PROGRESS:
      return {
        ...state,
        loading: true,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        user: action.payload.user, // ✅ store full user object
        error: null,
      };

    case LOGOUT:
      return {
        ...state,
        user: null,
        loading: false,
        token: null,
      };

    case ERROR:
      return {
        ...state,
        error: action.payload.msg,
        loading: false,
      };

    default:
      return state;
  }
};

export default authReducer;
