import { CircularProgress } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"

const TypeOfSalesCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    return <>
        {!isModal &&
            <CustomDialog
                id={`${isUpdate ? "updatetypofsales" : "createtypofsales"}`}
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
                            value={fields.type}
                            onChange={(e) => setFields({ ...fields, err: '', type: e.target.value })}
                            type="text"
                            label={"Type of Sales*"}

                        />}
                    </>
                }
            </CustomDialog>
        }
        
        
    </>
}
export default memo(TypeOfSalesCreateUi)