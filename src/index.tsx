import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <GoogleOAuthProvider clientId="213254704564-5or9vmcl7rlca97o2v7o4svembbat29g.apps.googleusercontent.com">
      <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  </Provider>,
);

reportWebVitals();
