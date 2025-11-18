import { Box, CircularProgress, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { Close } from "@mui/icons-material"
import SubmitButton from "../../components/button/SubmitButton"
import FileInput from "../../components/layouts/upload/FileInput"

const LocationMasterCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit }) => {
    console.log("first", isUpdate)
    return <>
        <CustomDialog
            id={`${isUpdate ? "Update" : "Create"}`}
            loading={loading}
            err={fields?.err}
            onSubmit={onSubmit}
            title={`${isUpdate ? "Update" : "Create"} ${title}`}
            closeText="Close"
            confirmText={`${isUpdate ? "Update" : "Create"}`}
        >
            {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                <>
                    {<CustomInput
                        autoFocus={true}
                        disabled={loading}
                        value={fields?.name}
                        onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                        type="text"
                        label={"Name*"}
                    />}
                </>
            }
        </CustomDialog>

    </>
}
export default memo(LocationMasterCreateUi)