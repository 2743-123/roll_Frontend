import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { RootState } from "../../Reducer";
import { clearNotification } from "./NotificationReduer";
import { AppDispatch } from "../../store"; // Apna AppDispatch import karein

const Notification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { type, message } = useSelector(
    (state: RootState) => state.notification,
  );

  const options: ToastOptions = useMemo(
    () => ({
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }),
    [],
  );

  useEffect(() => {
    if (message) {
      if (type === "success") toast.success(message, options);
      else if (type === "error") toast.error(message, options);
      else if (type === "info") toast.info(message, options);
      else if (type === "warning") toast.warning(message, options);
      else toast(message, options); // Fallback agar koi aur type ho

      // 🔄 Turant state clear karein taaki duplicate renders se bacha ja sake
      dispatch(clearNotification());
    }
  }, [message, type, dispatch, options]);

  return <ToastContainer />;
};

export default Notification;