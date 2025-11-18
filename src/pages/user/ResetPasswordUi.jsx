import { Box, CircularProgress } from "@mui/material"
import { memo } from "react"
import CustomInput from "../../components/inputs/CustomInputs"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import { CenteredBox } from "../../components/layouts/OneViewBox"



const ResetPasswordUi = ({ title, isInstaller, isUpdate, fields, setFields, loading, onSubmit }) => {

    return <>

        <CustomDialog

            loading={loading}
            err={fields.err}
            onSubmit={onSubmit}
            title={`${title}`}
            closeText="Close"
            confirmText={`Reset`}
        >

            {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                <>
                <Box mt={2}>
                    <CustomInput
                        autoFocus={true}
                        disabled={loading}
                        value={fields.password}
                        onChange={(e) => setFields({ ...fields, err: '', password: e.target.value })}
                        type="password"
                        label={"Password*"}

                    />
                </Box>
                </>}

        </CustomDialog>
        
    </>
}
export default memo(ResetPasswordUi)