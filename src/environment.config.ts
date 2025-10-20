type EnvConfig = {
  Base_API_URL: string;
};

const ENV = "local";

const ENVIRONMENT: Record<string, EnvConfig> = {
  local: {
    Base_API_URL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth",
  },
  production: {
    Base_API_URL: process.env.REACT_APP_API_URL || "https://bricks-admin-backend.onrender.com/api/auth",
  },
};

const ENVIRONMENT_VARIABLES: EnvConfig = ENVIRONMENT[ENV];

export default ENVIRONMENT_VARIABLES;
