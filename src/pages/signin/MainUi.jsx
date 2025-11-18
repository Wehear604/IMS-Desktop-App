import { Box, Grid, Slide, styled } from '@mui/material';
import OneViewBox, { CenteredBox } from '../../components/layouts/OneViewBox';
import { center } from '../../assets/css/theme/common';
import Logo from '../../assets/images/CompanyLogo.svg'
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';

const SignInBoxUi = styled(Box)(({ theme }) => ({
    display: "flex",
    maxWidth: "75vw",
    height: "75vh",
    borderRadius: theme.shape.borderRadius * 4,
    background:"#FFFFFF",

    width: "1416px",
    flexDirection: "column",
    alignItems: "center",

}));

const OnewViewContainer = styled(OneViewBox)(({ theme }) => ({
    overflow: "hidden",
    background: `linear-gradient(224deg, ${theme.palette.primary.secondary} 20%, ${theme.palette.primary.main} 80%)`,
}));

const LeftSideBox = styled(CenteredBox)(({ theme }) => ({
    height: "100%",
    width: "100%",
    flexDirection: "column",
    position: "relative",
    "::after": {
        content: "' '",
        top: "0px",
        right: "0px",
        position: "absolute",
        height: "100%",
        width: "2px",
        background: 'linear-gradient(#CCCCCC00, #B5B5B5, #CCCCCC00)',
        [theme.breakpoints.down('md')]: {
            display: "none"
        }
    }

}));

const MainUi = ({ onSubmit, ...props }) => {
    const ref = useRef()
    const location = useLocation()

    return (

        <>
            <OnewViewContainer>
                <Box sx={{ ...center, width: "100%", height: "100vh" }}>
                    <SignInBoxUi p={4} component={"form"} width={"100%"} onSubmit={onSubmit}>
                        <Grid container spacing={2} sx={{ height: "100%" }}>
                            <Grid item md={6} xs={12}>
                                <LeftSideBox >
                                    <Box display={"flex"} >
                                    <img  isStatic noClickEffect={true} style={{maxWidth:"75vw"}} src={Logo} alt={'Logo'} />
                                    </Box>
                                </LeftSideBox>
                            </Grid>
                            <Grid item md={6} xs={12}>

                                <CenteredBox sx={{ flexDirection: "column", position: "relative", overflow: 'hidden' }} ref={ref} >
                                    <Slide timeout={400} direction={location.pathname !== '/sign-up' ? "right" : 'left'} in={true} container={ref.current}>
                                        <Box sx={{width:"100%"}}>
                                            {props.children}
                                        </Box>
                                    </Slide>
                                </CenteredBox>

                            </Grid>
                        </Grid>
                    </SignInBoxUi>
                </Box>
            </OnewViewContainer>


        </>
    )
}
export default MainUi