import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { logoutAction } from "../../Actions/Auth";
import { RootState } from "../../Reducer";
import { AppDispatch } from "../../store";

const Logout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const handleClick = () => {
    dispatch(logoutAction());
  };

  useEffect(() => {
    if (!token) {
      navigate("/Login");
    }
  }, [token, navigate]);

  return (
    <Tooltip title="Logout Portal" arrow placement="bottom">
      <IconButton
        onClick={handleClick}
        aria-label="logout"
        sx={{
          background: "rgba(255, 255, 255, 0.1)",
          color: "white",
          borderRadius: "12px",
          p: 1.1,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          transition: "all 0.2s ease-in-out",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            background: "rgba(244, 67, 54, 0.2)",
            borderColor: "#f44336",
            color: "#ff8a80",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(244,67,54,0.3)",
          },
        }}
      >
        <LogoutRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default Logout;