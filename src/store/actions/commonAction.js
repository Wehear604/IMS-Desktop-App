import { resetTokenApi } from "../../apis/auth.api";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { accessToken, refreshToken } from "../../utils/main";
import { callSnackBar } from "./snackbarAction";
import { signOutAction } from "./userReducerAction";

export const callApiAction = (
  asyncFun,
  onSuccess = () => { },
  onError = () => { },
  isFile = false
) => {
  return async (dispatch, getState) => {
    try {
      const response = await asyncFun();
      if (response.status === 1 || (isFile && response.status !== 0)) {
        if (isFile) {
          onSuccess(response);
        } else await onSuccess(response.data);
      } else {
        if (response.code === 400) {
          if (response?.code === 400) {
            if (response?.response?.status === 400) {
              onError(response?.response?.data?.data[0]?.msg);
            }
            else {
              onError(response?.data[0]?.msg);
            }
          }
        } else if (response.code === 401) {
          const resetFunResponse = await resetTokenApi();
          if (resetFunResponse.status === 1) {
            accessToken.set(resetFunResponse.data.accessToken);
            refreshToken.set(resetFunResponse.data.refreshToken);

            dispatch(callApiAction(asyncFun, onSuccess, onError));
          } else if (resetFunResponse.code === 401) {
            dispatch(signOutAction());
          }
        } else if (response.code === 403) {
          dispatch(
            callSnackBar(
              "Your session has expired due to unautherized access",
              SNACK_BAR_VARIETNS.error
            )
          );
          dispatch(signOutAction());
        } else if (response.code === 406) {
          onError(response.message, 406, response.data);
        } else {
          dispatch(
            callSnackBar(
              response.message || "OOPS! Something went wrong",
              SNACK_BAR_VARIETNS.error
            )
          );
          onError(response.message || "OOPS! Something went wrong");
        }
      }
    } catch (e) {
      onError(e.message);
      dispatch(
        callSnackBar("OOPS! Something went wrong", SNACK_BAR_VARIETNS.error)
      );
    }
  };
};
