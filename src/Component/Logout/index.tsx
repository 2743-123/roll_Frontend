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
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          color: "white",
          borderRadius: "50%",
          p: 1.2,
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            transform: "scale(1.1)",
          },
        }}
      >
        <LogoutIcon fontSize="medium" />
      </IconButton>
    </Tooltip>
  );
};

export default Logout;
