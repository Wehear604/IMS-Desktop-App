import { Box, CircularProgress, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { Close } from "@mui/icons-material"
import SubmitButton from "../../components/button/SubmitButton"

const ProductBrandCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    return <>
        {!isModal &&
            <CustomDialog
                id={`${isUpdate ? "delete" : "department"}`}
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
                            label={"Product Brand*"}

                        />}
                    </>
                }
            </CustomDialog>
        }
        {isModal &&<Box component="form" sx={{ display: "flex", flexDirection: "column", overflowY: "auto" }} maxHeight="100%" onSubmit={onSubmit ?? handleAreaModalClose} >
        <DialogTitle variant="h6">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <Box component={'div'}>
                    Create Product Brand
                    <Typography variant="body2" color={'red'}>
                        {fields.err}
                    </Typography>
                </Box>
                <IconButton onClick={handleAreaModalClose} size="small">
                    <Close />
                </IconButton>
            </Box>
        </DialogTitle>
        <DialogContent >
            <CustomInput
                autoFocus={true}
                disabled={loading}
                value={fields.name}
                onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                type="text"
                label={"Product Brand*"}
            />
        </DialogContent>
       <DialogActions   >
            <SubmitButton variant='outlined' onClick={handleAreaModalClose} title={"Close"} />
            <SubmitButton loading={loading} disabled={loading} type="submit" title={"Create"} />
        </DialogActions>
        </Box>

        }
        
    </>
}
export default memo(ProductBrandCreateUi)