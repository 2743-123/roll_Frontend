import ENVIRONMENT_VARIABLES from "../../environment.config";

export const API_AUTH_LOGIN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/login`;
export const API_AUTH_LOGOUT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/logout`;
export const API_USER_GET = `${ENVIRONMENT_VARIABLES.Base_API_URL}/users`;
export const API_BALANCE_GET = `${ENVIRONMENT_VARIABLES.Base_API_URL}/getBalance/:userId`;
export const API_ADD_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/register`;
export const API_UPDATE_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/update/:userId`;
export const API_DELETE_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/delete/:userId`;
export const API_BALANCE_ADD = `${ENVIRONMENT_VARIABLES.Base_API_URL}/add`;
export const API_GET_TOKENS = `${ENVIRONMENT_VARIABLES.Base_API_URL}/all/:userId`;
export const API_CREATE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/create`;
export const API_UPDATE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/update`;
export const API_CONFIRM_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/confirm
`;
