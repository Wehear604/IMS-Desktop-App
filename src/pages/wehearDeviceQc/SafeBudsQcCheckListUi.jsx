import { Box, Typography } from '@mui/material'
import React from 'react'
import CustomDialog from '../../components/layouts/common/CustomDialog'

const SafeBudsQcCheckListUi = () => {
  return (
    <CustomDialog
        title={"SafeBuds QC Checklist"}
        id={"safebudsqc"}
        onSubmit={"Hello"}
        closeText='Close'
        confirmText='Next'
    >
        <Box>
            <Typography>
                Hello Safe
            </Typography>
        </Box>
    </CustomDialog>
)}

export default SafeBudsQcCheckListUi