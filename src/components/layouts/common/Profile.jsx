import * as React from 'react';
import Popover from '@mui/material/Popover';
import { Avatar, Badge, Box, ButtonBase, Divider, ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material';
import { AccountCircle, Email, Label } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { findNameByRole } from '../../../utils/main';
import SubmitButton from '../../button/SubmitButton';
import { signOutAction } from '../../../store/actions/userReducerAction';
import { openModal } from '../../../store/actions/modalAction';
import ResetPasswordController from '../../../pages/reset-token/ResetPasswordController';


export default function Profile() {
    const { user } = useSelector(state => state)
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onResetButtonClick = () => {
        dispatch(openModal(<ResetPasswordController />,"xs"))
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    return (
        <>


            <Badge color="success" overlap="circular" anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
                badgeContent=" " variant='dot' >
                <ButtonBase  aria-describedby={id} onClick={handleClick}>
                    <Avatar sx={(theme) => ({ bgcolor: theme.palette.primary.main,textTransform:"capitalize" })}   >
                        {user?.data?.name[0]}
                    </Avatar>
                </ButtonBase>
            </Badge>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}

            >
                <Box sx={{ width: "300px", maxWidth: "100%" }}>
                    <MenuList>
                        <MenuItem>
                            <ListItemIcon>
                                <AccountCircle fontSize="small" />
                            </ListItemIcon>
                            <ListItemText sx={{ textTransform: "capitalize" }} >{user.data.name}</ListItemText>

                        </MenuItem>
                        <MenuItem>
                            <ListItemIcon>
                                <Email fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{user.data.email}</ListItemText>

                        </MenuItem>

                        <MenuItem>
                            <ListItemIcon>
                                <Label fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{findNameByRole(user.data.role)}</ListItemText>

                        </MenuItem>

                        <Divider />


                        <MenuItem >
                            <SubmitButton variant="outlined" title={"Reset Password"} onClick={onResetButtonClick}>

                            </SubmitButton>

                        </MenuItem>
                        <MenuItem sx={{fontSize:"10px"}}>
                            <SubmitButton title={"Log Out"} onClick={() => { dispatch(signOutAction()) }}>

                            </SubmitButton>

                        </MenuItem>

                    </MenuList>
                </Box>
            </Popover>
        </>
    );
}