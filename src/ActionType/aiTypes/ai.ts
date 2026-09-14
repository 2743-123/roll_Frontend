// Action Types
export const SEND_AI_COMMAND_REQUEST = "SEND_AI_COMMAND_REQUEST";
export const SEND_AI_COMMAND_SUCCESS = "SEND_AI_COMMAND_SUCCESS";
export const SEND_AI_COMMAND_FAIL = "SEND_AI_COMMAND_FAIL";

// AI Response Data Type (Optional: depends on what backend sends)
export interface AiResponseData {
  msg: string;
  data?: any; // Pura transaction ya user object jo create/update hua
}

// State type
export interface AiState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  lastResponseData: any | null;
}

// Action interfaces
export interface SendAiCommandRequestAction {
  type: typeof SEND_AI_COMMAND_REQUEST;
}

export interface SendAiCommandSuccessAction {
  type: typeof SEND_AI_COMMAND_SUCCESS;
  payload: AiResponseData;
}

export interface SendAiCommandFailAction {
  type: typeof SEND_AI_COMMAND_FAIL;
  payload: {
    msg: string;
  };
}

// Union of actions
export type AiAction =
  | SendAiCommandRequestAction
  | SendAiCommandSuccessAction
  | SendAiCommandFailAction;