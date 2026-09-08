import React, { FC } from "react";
import { Link } from "react-router-dom";
import "./style.scss";

const PageNotFound: FC = () => (
  <div className="pagenotfound">
    <div className="pagenotfound_image">
      <img src="/img/404.png" alt="404 Page Not Found" />
    </div>
    <span className="pagenotfound_text">Page Not Found</span>
    <Link to="/" className="pagenotfound_btn" style={{ marginTop: "20px", textDecoration: "none" }}>
      Go to Dashboard
    </Link>
  </div>
);

export default PageNotFound;