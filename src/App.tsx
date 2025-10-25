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

function App() {
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
          </Route>
        </Routes>
      </BrowserRouter>

      <Notification />
    </>
  );
}

export default App;
