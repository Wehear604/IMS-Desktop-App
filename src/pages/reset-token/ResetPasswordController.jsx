import { memo, useMemo, useState } from "react";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { closeModal } from "../../store/actions/modalAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { resetPasswordApi } from "../../apis/auth.api";
import { callSnackBar } from "../../store/actions/snackbarAction";
import ResetPasswordUi from "./ResetPasswordUi";

const ResetPasswordController = () => {
  const validate = useValidate();
  const dispatch = useDispatch();

  const title = "Reset Password";

  const updateApi = resetPasswordApi;

  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState({
    current_pass: "",
    err: "",
    new_pass: "",
  });

  const validationSchemaForUpdate = useMemo(
    () => [
      {
        required: true,
        value: fields.new_pass,
        field: "New Password",
      },
      {
        required: true,
        value: fields.current_pass,
        field: "Old Password",
      },
    ],
    [fields]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    const validationResponse = validate(validationSchemaForUpdate);

    if (validationResponse === true) {
      setLoading(true);

      setLoading(true);
      dispatch(
        callApiAction(
          async () => await updateApi(fields),
          async (response) => {
            setLoading(false);
            dispatch(
              callSnackBar(
                "Password Reseted successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(closeModal());
          },
          (err) => {
            dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
            setFields({ ...fields, err });
            setLoading(false);
          }
        )
      );
    } else {
      setFields({ ...fields, err: validationResponse });
      dispatch(callSnackBar(validationResponse, SNACK_BAR_VARIETNS.error));
    }
  };

  return (
    <ResetPasswordUi
      title={title}
      loading={loading}
      fields={fields}
      onSubmit={onSubmit}
      setFields={setFields}
    />
  );
};
export default memo(ResetPasswordController);
