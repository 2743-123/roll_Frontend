import ENVIRONMENT_VARIABLES from "../../environment.config";


export const API_AUTH_LOGIN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/auth/login`;
export const API_AUTH_LOGOUT = `${ENVIRONMENT_VARIABLES.Base_API_URL}/auth/logout`;
export const API_USER_GET = `${ENVIRONMENT_VARIABLES.Base_API_URL}/users/users`;
export const API_BALANCE_GET = `${ENVIRONMENT_VARIABLES.Base_API_URL}/getBalance/:userId`;
export const API_ADD_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}/auth/register`;
export const API_UPDATE_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}users/update/:userId`;
export const API_DELETE_USER = `${ENVIRONMENT_VARIABLES.Base_API_URL}users/delete/:userId`;
export const API_BALANCE_ADD = `${ENVIRONMENT_VARIABLES.Base_API_URL}balance/add`;
export const API_GET_TOKENS = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/all/:userId`;
export const API_CREATE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/create`;
export const API_UPDATE_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/update`;
export const API_CONFIRM_TOKEN = `${ENVIRONMENT_VARIABLES.Base_API_URL}/token/confirm
`;


