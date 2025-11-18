import { Menu } from "@mui/icons-material";
import { Box, IconButton, Paper, useMediaQuery } from "@mui/material"
import { useSelector } from 'react-redux'
import Profile from "./Profile";
import { memo } from "react";
import Logo from "./Logo"


const headerStyle = (theme) => ({
    width: "100%",
    background: "white", 
    position: "sticky", top: "0px", display: "flex", alignItems: "center",
    pt: 3, pb: 3, pr: 3,
    borderBottom: "1px solid " + theme.palette.grey.main,
    zIndex: 10,
    borderRadius: "0px"
})

const Header = ({ open, setOpen }) => {
    const user = useSelector(state => state.user)
    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("md"))
    return (
        <Paper elevation={0} sx={headerStyle}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>

                {!open && <Box sx={{ width: "17vw", height: "5vh" }}  >
                    <Logo />
                </Box>}
                <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>

                    {isSmallScreen ? <IconButton onClick={() => { setOpen(!open) }}>
                        <Menu />
                    </IconButton> : <></>}


                    <Box sx={{ width: "", display: "flex", flex: 1 }} ml={3} >

                    </Box>
                </Box>

                <Box mr={2}>
                    <Profile />
                </Box>
            </Box>
        </Paper>
    )
}
export default memo(Header)