import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginedIn, RequireAuth } from "./Routes";
import Login from "./Component/Login/index";
import Dashboard from "./Component/Dashobard";
import Users from "./Component/Dashobard/page/Users/Users";
import AllData from "./Component/Dashobard/page/Alldata";
import Balance from "./Component/Balance/Balance";
import TokenTable from "./Component/Token";
import Notification from "./CommonCoponent/Notification";
import BedashList from "./Component/Bedashmessage/bedashList";
import AdminList from "./Component/Dashobard/page/Admin & SuperAdmin";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { token, user: JSON.parse(user) },
      });
    }
  }, [dispatch]);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="Login"
            element={
              <LoginedIn>
                <Login />
              </LoginedIn>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            <Route index element={<AllData />} />
            <Route path="USERS" element={<Users />} />
            <Route path="Balance" element={<Balance />} />
            <Route path="Token" element={<TokenTable />} />
            <Route path="Bedash" element={<BedashList />} />
            <Route path="admin" element={<AdminList />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Notification />
    </>
  );
}

export default App;
