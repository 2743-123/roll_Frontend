import {
  AiState,
  AiAction,
  SEND_AI_COMMAND_REQUEST,
  SEND_AI_COMMAND_SUCCESS,
  SEND_AI_COMMAND_FAIL,
} from "../../ActionType/aiTypes/ai";

const initialState: AiState = {
  loading: false,
  error: null,
  successMessage: null,
  lastResponseData: null,
};

const aiReducer = (state = initialState, action: AiAction): AiState => {
  switch (action.type) {
    case SEND_AI_COMMAND_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,          // Nayi request aane par purane errors clear karein
        successMessage: null, // Purana success message bhi clear karein
      };

    case SEND_AI_COMMAND_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: action.payload.msg,
        lastResponseData: action.payload.data, // Backend se jo naya data aaya hai (e.g., newly created user)
        error: null,
      };

    case SEND_AI_COMMAND_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload.msg,
        successMessage: null,
      };

    default:
      return state;
  }
};

export default aiReducer;