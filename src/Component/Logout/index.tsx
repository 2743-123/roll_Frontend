import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
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
    <Tooltip title="Logout" arrow>
      <IconButton
        onClick={handleClick}
        sx={{
          background: "linear-gradient(135deg, #2196f3 0%, #f32121ff 100%)",
          color: "white",
          borderRadius: "50%",
          p: 1.2,
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          "&:hover": {
            background: "linear-gradient(135deg, #910606ff 0%, #81d4fa 100%)",
            transform: "scale(1.15)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          },
        }}
      >
        <LogoutIcon fontSize="medium" />
      </IconButton>
    </Tooltip>
  );
};

export default Logout;
