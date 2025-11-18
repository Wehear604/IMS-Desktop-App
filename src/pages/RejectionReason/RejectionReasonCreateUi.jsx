import { Box, Checkbox, CircularProgress, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { Close } from "@mui/icons-material"
import SubmitButton from "../../components/button/SubmitButton"

const RejectionReasonCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    return <>
        {!isModal &&
            <CustomDialog
                id={`${isUpdate ? "delete" : "reason"}`}
                loading={loading}
                err={fields.err}
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
                            label={"Rejection Reason*"}

                        />}
                        <FormControlLabel
                            control={<Checkbox
                                checked={fields?.isReworkable}
                                onChange={(e) => setFields({ ...fields, err: '', isReworkable: e.target.checked })}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />}
                            label="Is Reworkable"
                        />
                    </>
                }
            </CustomDialog>
        }
    </>
}
export default memo(RejectionReasonCreateUi)