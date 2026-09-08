type EnvConfig = {
  Base_API_URL: string;
};

// React khud detect kar leta hai ki app development mein hai ya production mein
const ENV = process.env.NODE_ENV === "production" ? "production" : "local";

const ENVIRONMENT: Record<string, EnvConfig> = {
  local: {
    Base_API_URL: "http://localhost:5000/api",
  },
  production: {
    Base_API_URL:
      process.env.REACT_APP_API_URL ||
      "https://bricks-admin-backend.onrender.com/api",
  },
};

const ENVIRONMENT_VARIABLES: EnvConfig = ENVIRONMENT[ENV] || ENVIRONMENT.local;

export default ENVIRONMENT_VARIABLES;