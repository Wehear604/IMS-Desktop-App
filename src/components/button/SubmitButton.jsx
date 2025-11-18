import * as React from 'react';

import { styled } from '@mui/material/styles';
import { Button, CircularProgress, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/system';

const SubmitButtonStyled = styled(Button)(({ theme, normal }) => ({

    width: "100%",
    height:"5vh",
    fontSize:"18px",
}));

const SubmitButton = ({ title, loading, ...props }) => {
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("md"))

    return <SubmitButtonStyled sx={{height:isSmallScreen ? "7vh" : "5vh"}} disabled={loading} disableElevation variant='contained' {...props}>
        {props.icon}
        <Typography variant='h4'>
        {!loading && title}
        </Typography>

        {loading && <CircularProgress size={25} color={props.variant == "outlined" ? "primary" : "light"} ml={4} />}

    </SubmitButtonStyled>
}

export default SubmitButton

