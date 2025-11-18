import { Search } from "@mui/icons-material"
import { Avatar, Box, styled, TextField, Typography } from "@mui/material"
import AsyncDropDown from "./AsyncDropDown"

const StyledInput = styled(TextField)(({ theme }) => ({
  padding: theme.spacing(3),

  background: theme.palette.light.main,
  borderRadius: theme.shape.borderRadius,
  lineHeight: "100%",
  display: "flex",
  alignItems: "center",

  boxShadow: theme.shadows[1],





  '::before': {
    content: "none",

  },
  ":focus": {

    '::before': {
      content: "none",
      borderRadius: theme.shape.borderRadius,
    },


  },
  '.MuiOutlinedInput-root': {
    padding: '0px !important',
  },
  'fieldset': {
    padding: '0px !important',
    border: "none !important"
  },
  ':after': {
    display: 'none',
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
  color: theme.palette.grey.light,
  outline: "none",
  borderRadius: theme.shape.borderRadius,


  paddingBottom: theme.spacing(3) + " !important",
}))


export const StyledSearchBar = styled(TextField)(({ theme }) => ({


  background: theme.palette.light,
  border: "1px solid #255766",
  borderRadius: theme.shape.borderRadius,
  lineHeight: "100%",
  display: "flex",
  alignItems: "center",

  '::before': {
    content: "none",

  },
  ":focus": {

    '::before': {
      content: "none",
      borderRadius: theme.shape.borderRadius,
    },


  },
  "&-MuiInputBase-input-MuiOutlinedInput-input": {
    padding: theme.spacing(0) + " !important",
  },
  'fieldset': {
    padding: '0px !important',
    border: "none !important",

  },
  ':after': {
    display: 'none',
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
  color: theme.palette.grey.light,
  outline: "none",
  borderRadius: theme.shape.borderRadius,



}))

export const UserSearchBarNormal = ({ onUserChange, inputProps = {}, defaultParams = {}, defaultVal }) => {
  return <AsyncDropDown
    InputComponent={(props) => <TextField label placeholder="Search Manager"  {...props} {...inputProps} />}
    lazyFun={async (props) => {
    }}
    defaultVal={defaultVal}
    OptionComponent={({ option, ...rest }) => {
      return <Box sx={{ width: "100%", display: "flex", alignItems: "center" }} {...rest}>
        <Avatar></Avatar> <Typography ml={3} variant="h5">{option.name} ({option.designation})</Typography>
      </Box>
    }}
    onChange={async (changedVal) => { onUserChange(changedVal) }}
    titleKey={'name'}
    valueKey={"_id"}


  />
}
const UserSearchBar = ({ onUserChange }) => {
  return <AsyncDropDown
    InputComponent={(props) => <StyledInput placeholder="Search User"  {...props} />}
    startAdornment={<Search sx={{ mr: 2 }} />}
    OptionComponent={({ option, ...rest }) => {
      return <Box sx={{ width: "100%", display: "flex", alignItems: "center" }} {...rest}>
        <Avatar></Avatar> <Typography ml={3} variant="h5">{option.name} ({option.designation})</Typography>
      </Box>
    }}
    onChange={async (changedVal) => { onUserChange(changedVal) }}
    titleKey={'name'}
    valueKey={"_id"}


  />
}



export default UserSearchBar