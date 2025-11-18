

import { memo } from "react"
import { Box, Paper } from "@mui/material"
import { DoNotTouch, } from "@mui/icons-material"
import NoDataComponent from "./NoDataComponent"

const NotAllowedComponent = ({ message, Icon }) => {
    return <Box sx={{ display: "flex", flex: 1 }} component={Paper}>

        <NoDataComponent message="You are not allowed to access this route" Icon={DoNotTouch} />
    </Box>

}
export default memo(NotAllowedComponent)