// reducer/tokenReducer.ts

import {
  TOKEN_CLEAR,
  TOKEN_CONFIRM_SUCCESS,
  TOKEN_CREATE_SUCCESS,
  TOKEN_DELETE_SUCCESS,
  TOKEN_GET_SUCCESS,
  TOKEN_UPDATE_SUCCESS,
  TokenState,
} from "../../ActionType/UserTokenTypes";

const initialState: TokenState = {
  tokens: [],
  loading: false,
  error: null,
};

export const tokenReducer = (state = initialState, action: any): TokenState => {
  switch (action.type) {
    case TOKEN_GET_SUCCESS:
      return { ...state, loading: false, tokens: action.payload };

    case TOKEN_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        tokens: [action.payload.data, ...state.tokens], // add new token on top
      };

    case TOKEN_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        tokens: state.tokens.map((t) =>
          t.id === action.payload.data.id ? action.payload.data : t,
        ),
      };

    case TOKEN_CONFIRM_SUCCESS:
      return {
        ...state,
        loading: false,
        tokens: state.tokens.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t,
        ),
        error: null,
      };

    case TOKEN_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        tokens: state.tokens.filter((t) => t.id !== action.payload),
      };

    case TOKEN_CLEAR:
      return { ...state, tokens: [] };
    default:
      return state;
  }
};
