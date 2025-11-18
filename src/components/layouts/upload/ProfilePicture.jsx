import { Badge, Box, Button, CircularProgress, IconButton, Typography, styled } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
// import ImageComponent from "../../../components/inputs/ImageComponent"
import { AddAPhoto, Camera, Edit } from "@mui/icons-material"
import { CenteredBox } from "../../components/layouts/common/boxes"
import { useState } from "react"
// import FileInput from "../../../components/inputs/FileInput"
import { callApiAction } from "../../store/actions/commonAction"
import { updateUserDetails } from "../../store/actions/userReducerAction"
import FileInput from "./FileInput"
import ImageComponent from "./ImageComponent"
const VisuallyHiddenInput = styled('input')({

    height: "100%",
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: '100%',
    cursor: "pointer",
    opacity: 0
});
const ProfileEditButton = ({ loading, onChange, percentage, onDeleteFile, files, name }) => {

    return <CenteredBox sx={{ background: "white", borderRadius: "100%" }}>

        {loading ? <CircularProgress /> : <IconButton>
            <VisuallyHiddenInput type="file" onChange={onChange} />
            <Typography variant="h5" >
                <AddAPhoto color="primary" />
            </Typography>
        </IconButton>}
    </CenteredBox>
}
const ProfilePicture = ({ isHomepage }) => {

    const { user } = useSelector(state => state)

    const dispatch = useDispatch()
    const [editApiLoading, seteditApiLoading] = useState()
    const updateUrl = (url) => {
        seteditApiLoading(true)
        dispatch(callApiAction(
            // async () => await updateUserProfile({ profile: url }),
            (response) => {
                // dispatch(updateUserDetails({ profile_url: url }))
                seteditApiLoading(false)
            },
            (err) => {
                seteditApiLoading(false)
            }
        ))
    }

    return (isHomepage ? <ImageComponent
        src={user?.data?.profile_url}
        isHomepage
        isAvatar
        avtarTitle={
            user?.data?.first_name &&
            user?.data?.first_name[0] &&
            user?.data?.first_name[0].toUpperCase()
        }
    /> :
        <Badge overlap="circular" badgeContent={

            <FileInput

                disabled={editApiLoading}
                onlyImage


                onChange={(newUrl) => {
                    updateUrl(newUrl)
                }}

                FileComponent={(params) => <ProfileEditButton  {...params} loading={params.loading || editApiLoading} />}


            />
        } anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }} >
            <ImageComponent
                src={user?.data?.profile_url}
                isAvatar
                avtarTitle={
                    user?.data?.first_name &&
                    user?.data?.first_name[0] &&
                    user?.data?.first_name[0].toUpperCase()
                }
            />
        </Badge>)

}
export default ProfilePicture