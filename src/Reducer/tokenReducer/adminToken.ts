import { ERROR } from "../../ActionType/auth";
import { AdminToken, GET_ADMIN_TOKENS } from "../../ActionType/UserTokenTypes";


export interface AdminTokenState {
  data: AdminToken[];
  totalTokens: number;
  loading: boolean;
  error: string | null;
}

const initialState: AdminTokenState = {
  data: [],
  totalTokens: 0,
  loading: false,
  error: null,
};

type Action =
  | { type: "GET_ADMIN_TOKENS_REQUEST" }
  | { type: typeof GET_ADMIN_TOKENS; payload: { data: AdminToken[]; totalTokens: number } }
  | { type: typeof ERROR; payload: { msg: string } };

const adminTokenReducer = (
  state = initialState,
  action: Action
): AdminTokenState => {
  switch (action.type) {
    case "GET_ADMIN_TOKENS_REQUEST":
      return { ...state, loading: true, error: null };

    case GET_ADMIN_TOKENS:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        totalTokens: action.payload.totalTokens,
      };

    case ERROR:
      return { ...state, loading: false, error: action.payload.msg };

    default:
      return state;
  }
};

export default adminTokenReducer;
