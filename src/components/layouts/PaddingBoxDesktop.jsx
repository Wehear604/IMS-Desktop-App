import { styled } from '@mui/material/styles';

import { Box } from '@mui/system';

const PaddingBoxInDesktop = styled(Box)(({ theme }) => ({

    [theme.breakpoints.down('md')]: {
        padding: "0px !important"
    }

}));

export default PaddingBoxInDesktop