import { memo } from "react"
import OneViewBox, { CenteredBox } from "./OneViewBox"
import { Typography } from "@mui/material"
import { Comment } from "@mui/icons-material"



const workAreaStyle = (theme) => ({
    display: "flex",
    width: "100%",
    flexDirection: "column",
    flex: 1,
    background: theme.palette.grey.main,
    borderTopLeftRadius: theme.shape.borderRadius * 1

})


const PageNotFound = () => {
    return <OneViewBox>
        <CenteredBox sx={{ flexDirection: "column" }}>
            <Typography variant="h1">
                <Comment color="primary" fontSize="inherit" />
            </Typography>
            <Typography variant="h3" fontWeight="bold">
                Page Not Found
            </Typography>
        </CenteredBox>
    </OneViewBox>

}
export default memo(PageNotFound)