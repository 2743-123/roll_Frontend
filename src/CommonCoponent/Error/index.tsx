import React, { FC } from "react";
import "./ErrorMessage.scss";

const Error: FC = () => (
  <div className="main_layout">
    <div className="error_message">
      <span className="error_text">Oops... Problem with your connection.</span>
      <span className="error_text">Please try again later.</span>
    </div>
  </div>
);

export default Error;
