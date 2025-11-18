import { styled } from '@mui/material/styles';

import { Box } from '@mui/system';

const OneViewBox = styled(Box)(({ theme }) => ({

  height: "100vh",
  width: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",

}));

export const CenteredBox = styled(Box)(({ theme }) => ({

  height: "100%",
  width: "100%",
  alignItems: "center",
  display: "flex",
  justifyContent: "center"


}));

export const FilterTitleBox = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

export const FiltersBox = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",

  flexWrap: "wrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

export default OneViewBox