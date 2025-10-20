import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../AuthToekn";

interface Props {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<Props> = ({ children }) => {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
};

export const LoginedIn: React.FC<Props> = ({ children }) => {
  return !isLoggedIn() ? <>{children}</> : <Navigate to="/" replace />;
};
