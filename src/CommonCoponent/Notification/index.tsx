import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "../../Reducer";
import { clearNotification } from "./NotificationReduer";

const Notification: React.FC = () => {
  const dispatch = useDispatch();
  const { type, message } = useSelector(
    (state: RootState) => state.notification
  );

  const options: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  useEffect(() => {
    if (message) {
      if (type === "success") toast.success(message, options);
      if (type === "error") toast.error(message, options);
      if (type === "info") toast.info(message, options);
      if (type === "warning") toast.warning(message, options);

      // clear notification after toast
      setTimeout(() => dispatch(clearNotification()), 500);
    }
  }, [message, type, dispatch]);

  return <ToastContainer />;
};

export default Notification;
