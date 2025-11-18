import { FiberManualRecordOutlined, FiberManualRecordRounded, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material"
import { Box, ButtonBase, Collapse, styled, Typography } from "@mui/material"
import { Fragment, memo, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"
import defineRoutes from "../../../routes"

const ParentNavItem = styled(Box)(({ theme, active }) => ({
    width: "100%",
    display: 'flex',
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    marginBottom: theme.spacing(2),
    position: "relative",
    "::before": {
        content: '" "',
        position: "absolute",
        right: "0px",
        top: "0px",
        height: "100%",
        width: theme.spacing(1),
        background: active ? "#255766" : 'transparent',
        borderTopLeftRadius: theme.shape.borderRadius,
        borderBottomLeftRadius: theme.shape.borderRadius,
        
    }

}))

const ParentNavInner = styled(Box)(({ theme, active, nopadding }) => ({
    width: "100%",
    display: 'flex',
    alignItems: "center",
    gap:"20px",
    justifyContent: "flex-start",
    paddingLeft: nopadding ? 0 : theme.spacing(4),
    paddingRight: nopadding ? 0 : theme.spacing(2),
    paddingTop: nopadding ? 0 : theme.spacing(2),
    paddingBottom: nopadding ? 0 : theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    background: active ? "#255766" : "transparent",
    color: active ? "white" : "#255766",
    cursor: "pointer",
    ":hover": {
        color: active ? "white": "#255766",
    }
}))

const CollpasableContainer = styled(Collapse)(({ theme, active }) => ({
    width: "100%",
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(3),
}))

const NavItemContainer = styled(ButtonBase)(({ theme, active, nomargin }) => ({
    width: "100%",
    display: 'flex',
    alignItems: "center",
    justifyContent: "flex-start",
    gap:"15px",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: nomargin ? 0 : theme.spacing(3),
    background:active ?  "#255766":"white",
    borderRadius: theme.shape.borderRadius,
    color: active ? "white" : "#255766",

}))

const NavItem = memo(({ active, title, path, Icon, nomargin }) => {

    return (
        <NavItemContainer active={active} to={path} LinkComponent={Link} nomargin={nomargin}>
            {<Icon  color="dark.main" />}
            {!Icon && (active ? <FiberManualRecordRounded fontSize="inherit" /> : <FiberManualRecordOutlined fontSize="inherit" />)}
            <Typography sx={(theme) => ({  color: active ? "white" : "#255766" })}  fontWeight={'500'}  lineHeight={'100%'} variant="h" >{title}</Typography>
        </NavItemContainer>
    )
})
const NavDropDown = memo(({ activeParent, title, Icon, path, children }) => {

    const [open, setOpen] = useState(activeParent)

    const location = useLocation()
    const splittedPath = location.pathname.split('/')
    useEffect(() => {
        setOpen(activeParent)
    }, [activeParent])

    if (children && children.length > 0)
        return (

            <>

                <ParentNavItem LinkComponent={"button"} active={open} onClick={() => { setOpen(!open) }}>
                    <ParentNavInner active={open}>
                        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }} mt={1} mb={1} >
                            {Icon}
                            <Typography ml={4} variant={"h6"}fontWeight={"500"} >{title}</Typography>
                        </Box>
                        {
                            !open ? <KeyboardArrowDown /> : <KeyboardArrowUp />
                        }
                    </ParentNavInner>
                </ParentNavItem>
                <CollpasableContainer in={open} component={Box}>

                    {
                        children && Array.isArray(children) && children.map((route) => {
                            if (route.hideInPannel)
                                return <Fragment key={route.title} />
                            return <NavItem Icon={route.icon} key={route.title} active={((splittedPath[2] == route.path && splittedPath[1] == path) || (splittedPath[1] == '' && splittedPath[1] == path))} title={route.title} path={`/${path}/${route.path}`} />
                        })
                    }


                </CollpasableContainer>

            </>
        )

    else
        return (
            <ParentNavItem LinkComponent={"button"} active={open} onClick={() => { setOpen(!open) }}>
                <ParentNavInner active={open} nopadding>
                    <NavItem nomargin Icon={() => Icon} key={title} title={title} path={"/" + path} active={open} />
                </ParentNavInner>
            </ParentNavItem>
        )
})

const Navbar = () => {
    const { user } = useSelector((state) => state)
    const location = useLocation()
    const routes = defineRoutes(user);
    const splittedPath = location.pathname.split('/')


    return (
        <>

            {
                routes && Array.isArray(routes) && routes.map((route) => {
                    {
                        if (route.hideInPannel)
                            return <Fragment key={route.title} />
                        return <NavDropDown key={route.title} activeParent={splittedPath && splittedPath[1] == route.path} Icon={route.icon} children={route.children} title={route.title} path={route.path} />
                    }
                })
            }
        </>
    )
}
export default Navbar