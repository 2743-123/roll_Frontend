import {
  ADD_USER_SUCCESS,
  DELETE_USER_SUCCESS,
  GET_USERS_SUCCESS,
  SELECT_USER,
  UPDATE_USER_SUCCESS,
  User,
  userAction,
  userState,
} from "../../ActionType/user/userTypes";

const initialState: userState = {
  users: [] as User[],

  loading: false,
  selectedUser: null,
  isActive: true,
  sucees: null,
};

const userReducer = (state = initialState, action: userAction): userState => {
  switch (action.type) {
    case GET_USERS_SUCCESS:
      return {
        ...state,
        users: action.payload,
      };
    case SELECT_USER:
      return {
        ...state,
        selectedUser: action.payload.user,
      };

    case ADD_USER_SUCCESS:
      return {
        ...state,
        users: [
          ...state.users,
          (action.payload as any).user || action.payload.payload,
        ],
        sucees: action.payload.msg,
      };

    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.user.id
            ? { ...u, ...action.payload.user } // ✅ note the .user
            : u,
        ),
      };

    case DELETE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
      };

    default:
      return state;
  }
};
export default userReducer;
