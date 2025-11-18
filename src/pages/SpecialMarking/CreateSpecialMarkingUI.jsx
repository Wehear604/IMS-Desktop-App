import { Box, CircularProgress, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { Close } from "@mui/icons-material"
import SubmitButton from "../../components/button/SubmitButton"
import FileInput from "../../components/layouts/upload/FileInput"

const CreateSpecialMarkingUI = ({ title, isUpdate, fields, setFields, loading, onSubmit }) => {
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
                        label={"Special Marking Name*"}
                    />}
                    <FileInput
                        onlyImage={false}
                        multi={false}
                        onDelete={(filesToDelete) => {
                            setFields({
                                ...fields,
                                err: "",
                                image: ""
                            })
                        }}
                        onChange={(files) => {
                            setFields({
                                ...fields,
                                err: "",
                                image: files
                            })
                        }}
                        defaults={fields?.image ? [fields?.image] : []}
                        accept="image/"
                        title="Upload Photo"
                        subTitle="Only png,jpeg,jpg,pdf files are allowed! less than 1 MB"
                    />
                </>
            }
        </CustomDialog>

    </>
}
export default memo(CreateSpecialMarkingUI)