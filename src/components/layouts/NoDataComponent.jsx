import { memo } from "react"
import OneViewBox, { CenteredBox } from "./OneViewBox"
import { Typography } from "@mui/material"
import { Comment } from "@mui/icons-material"

const NoDataComponent = ({ message, Icon }) => {
    return <OneViewBox>
        <CenteredBox sx={{ flexDirection: "column" }}>
            <Typography variant="h2" align="center">
                {Icon ? <Icon color="primary" fontSize="inherit" /> : <Comment color="primary" fontSize="inherit" />}
            </Typography>
            <Typography variant="h5" align="center" fontWeight="bold" color="grey">
                {message ?? "Page Not Found"}
            </Typography>
        </CenteredBox>
    </OneViewBox>

}
export default memo(NoDataComponent)