import { CircularProgress } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"

const CategoryTypeCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    return <>
        {!isModal &&
            <CustomDialog
                id={`${isUpdate ? "updatetypofsales" : "createcategory"}`}
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
                            value={fields.name}
                            onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                            type="text"
                            label={"Category Name*"}

                        />}
                    </>
                }
            </CustomDialog>
        }
        
        
    </>
}
export default memo(CategoryTypeCreateUi)