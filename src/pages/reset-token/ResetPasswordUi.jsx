import {
  CircularProgress,
} from "@mui/material";
import { memo } from "react";
import CustomInput from "../../components/inputs/CustomInputs";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { CenteredBox } from "../../components/layouts/OneViewBox";

const ResetPasswordUi = ({
  title,
  fields,
  setFields,
  loading,
  onSubmit,
}) => {

  return (
    <>
      <CustomDialog
        loading={loading}
        err={fields.err}
        onSubmit={onSubmit}
        title={`${title}`}
        closeText="Close"
        confirmText={`Reset`}
      >
        <>
          {loading ? (
            <CenteredBox>
              <CircularProgress />
            </CenteredBox>
          ) : (
            <>
              <CustomInput
                autoFocus={true}
                disabled={loading}
                value={fields.current_pass}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    err: "",
                    current_pass: e.target.value,
                  })
                }
                type="text"
                label={"Old Password*"}
              />

              <CustomInput
                disabled={loading}
                value={fields.new_pass}
                onChange={(e) =>
                  setFields({ ...fields, err: "", new_pass: e.target.value })
                }
                type="text"
                label={"New Password*"}
              />
            </>
          )}

        </>
      </CustomDialog>
    </>
  );
};
export default memo(ResetPasswordUi);
