import {  Box, Collapse, Paper, SwipeableDrawer, styled, useMediaQuery } from "@mui/material"
import {  Outlet } from "react-router-dom"



import {  useState } from "react"
import { memo } from "react"
import AppModeLabel from "../../texts/AppModeLabel"
import PopUpModal from "../../Modal"
import Logo from "./Logo"
import Header from "./Header"
import Navbar from "./Navbar"


// const navBarOuterStyle = (theme) => ({ height: "100%", position: "relative" })
const containerStyle = (theme) => ({ height: "100%", width: "100%", display: "flex", overflow: "hidden", background: theme.palette.light.main })
const collapsableContainerStyle = (theme) => ({ height: "100%", display: "flex", flexDirection: "column" })
const navbarInnerStyle = (theme) => ({
  width: "260px",
  background: "white",
  height: "100%",
  overflowY: "auto",
  borderRadius: "0px",
  scrollBarWidth: "none",
  borderRight:"1px solid #DDDDDD",
  " -ms-overflow-style": "none",
  "::-webkit-scrollbar": {
    display: 'none'
  }
})

const logoContainer = (theme) => ({ width: "100%", position: "sticky", top: "0px",borderBottom:"1px solid #DDDDDD", zIndex: "1",backgroundColor:"white" })
const rightContainerStyle = (theme) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  height: "100vh",
  overflow: "auto",
  scrollBarWidth: "none",
})
const WorkAreaComponent = styled(Box)(({ theme, hideOverflow }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  flex: 1,
  overflow: hideOverflow ? "hidden" : "unset",
  background: theme.palette.grey.main,
  borderTopLeftRadius: theme.shape.borderRadius * 1
}))


const AppContainer = ({ hideOverflow, ...props }) => {

  const [navBar, setNavbar] = useState(true)
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("md"))


  return (
    <>
      {
        process.env.REACT_APP_APP_MODE !== 'production' && <AppModeLabel />
      }

      <PopUpModal />

      <Box sx={containerStyle}>
        {!isSmallScreen &&
          <Collapse orientation="horizontal" in={navBar} sx={collapsableContainerStyle}>

            <Paper elevation={0} sx={navbarInnerStyle}>
              <Box pt={2} mb={6} sx={logoContainer}>
                <Logo/>
              </Box>
              <Navbar />
            </Paper>

          </Collapse>
        }
        {
          isSmallScreen &&
          <SwipeableDrawer
            anchor={"left"}
            open={navBar}
            onClose={() => setNavbar(false)}
            onOpen={() => setNavbar(true)}
          >
            <Paper elevation={2} sx={navbarInnerStyle}>
            <Box  sx={logoContainer} mb={4}>
              <Logo sx={{ zIndex: 1 }} />
            </Box>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Navbar />
            </Box>
          </Paper>
          </SwipeableDrawer>
        }
        <Box sx={rightContainerStyle}>

          <Header open={navBar} setOpen={setNavbar} />
          <WorkAreaComponent p={3} hideOverflow={hideOverflow}>
            {props.children}
            <Outlet />
          </WorkAreaComponent>
        </Box>
      </Box>

    </>

  )
}
export default memo(AppContainer)