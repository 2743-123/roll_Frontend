import React, { FC } from "react";
import "./style.scss";

const PageNotFound: FC = () => (
  <div className="pagenotfound">
    <div className="pagenotfound_image">
      <img src="/img/404.png" alt="404 Page Not Found" />
    </div>
    <span className="pagenotfound_text">Page Not Found</span>
  </div>
);

export default PageNotFound;
