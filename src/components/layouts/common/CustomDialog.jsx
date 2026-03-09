import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import SubmitButton from "../../button/SubmitButton";
import { useDispatch } from "react-redux";
import { closeModal } from "../../../store/actions/modalAction";
import { Close } from "@mui/icons-material";

const CustomDialog = ({
  isReject,
  loading,
  id,
  title,
  err,
  children,
  disabledSubmit,
  onSubmit,
  onClose = () => {},
  onReject = () => {},
  disableDirectClose = false,
  confirmText = "Submit",
  closeText = "Close",
  dialogProps = {},
}) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    if (isReject) {
      onReject();
    } else {
      onClose();
      if (!disableDirectClose) dispatch(closeModal(id));
    }
  };

  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", overflowY: "auto" }}
      maxHeight="100%"
      onSubmit={onSubmit ?? handleClose}
      autoComplete="off"
    >
      <DialogTitle variant="h4" sx={{ fontWeight: "bold" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            component={"div"}
            sx={{ display: "flex", flex: 1, flexDirection: "column" }}
          >
            <Typography
              textTransform="capitalize"
              sx={{ fontSize: "inherit", color: "primary" }}
            >
              {title}
            </Typography>

            <Typography variant="body2" color={"red"}>
              {err}
            </Typography>
          </Box>
          {!disableDirectClose && (
            <IconButton
              disabled={disableDirectClose}
              onClick={() => {
                if (isReject) {
                  onClose();
                } else {
                  handleClose();
                }
              }}
              size="small"
            >
              <Close />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent {...dialogProps}>{children}</DialogContent>
      {onSubmit && (
        <DialogActions>
          {closeText !== null && (
            <SubmitButton
              disabled={loading || disableDirectClose}
              variant="outlined"
              onClick={handleClose}
              title={closeText}
            />
          )}
          <SubmitButton
            loading={loading}
            disabled={disabledSubmit || loading}
            type="submit"
            title={confirmText}
          />
        </DialogActions>
      )}
    </Box>
  );
};
export default CustomDialog;
