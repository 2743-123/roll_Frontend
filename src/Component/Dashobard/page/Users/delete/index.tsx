import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{userName}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;
