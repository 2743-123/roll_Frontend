import { ADD_BEDASH_SUCCESS, BedashState, CONFIRM_BEDASH_SUCCESS, GET_BEDASH_LIST } from "../../ActionType/bedash/bedash";

const initialState: BedashState = {
  data: [],
  loading: false,
  error: null,
};

const bedashReducer = (state = initialState, action: any): BedashState => {
  switch (action.type) {
    case "IN_PROGRESS":
      return { ...state, loading: true, error: null };

    case GET_BEDASH_LIST:
      return { ...state, loading: false, data: action.payload };

      case CONFIRM_BEDASH_SUCCESS:
  return {
    ...state,
    data: state.data.map((item) =>
      item.id === action.payload.data.id
        ? { ...item, status: "completed", customDate: action.payload.data.customDate }
        : item
    ),
    loading:false
  };

    case ADD_BEDASH_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [action.payload.data, ...state.data], // new item top par add hoga
      };


    case "ERROR":
      return { ...state, loading: false, error: action.payload.msg };

    default:
      return state;
  }
};

export default bedashReducer;