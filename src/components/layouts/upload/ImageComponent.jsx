import { Avatar, Box, CircularProgress, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { getFileOrImage } from "../../../apis/file.api"

const ImageComponent = ({ isHomepage, src, alt, imgStyle = {}, isAvatar, avtarTitle, avtarProps = {} }) => {

    const [img, setImage] = useState(false)
    const [loading, setLoading] = useState(false)
    const fetchImage = async () => {
        try {
            const mediaStream = await getFileOrImage({ fileUrl: src })
            if (window.URL && window.URL.createObjectURL) {
                setImage(window.URL.createObjectURL(mediaStream));
            }
            else if (window.webkitURL && window.webkitURL.createObjectURL) {
                setImage(window.webkit.createObjectURL(mediaStream))
            }
            else {
                const errMessage = "Your browsers does not support URL.createObjectURL.";
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }

    }
    useEffect(() => {
        // fetchImage()
    }, [src])

    if (isAvatar) {
        if (loading)
            return <Skeleton variant="circular" animation="wave" sx={{ width: "100%", height: "100%" }}  {...avtarProps} >

                {/* <CircularProgress /> */}
            </Skeleton>
        return <Avatar src={img} sizes="large" sx={{ width: isHomepage ? "50px" : "130px", height: isHomepage ? "50px" : "130px", bgcolor: "primary.main" }} {...avtarProps}>
            <Typography variant="body1">
                {
                    avtarTitle
                }
            </Typography>
        </Avatar>
    }
    if (loading)
        return <CircularProgress />
    return <Box sx={{ width: "100%", height: "100%", background: 'lightgrey' }}>
        <img
            src={src}
            alt={alt ? alt : ""}// src={src instanceof Blob || src instanceof File ? window.URL.createObjectURL(src) : src}
            style={{ height: "100%", width: "100%", objectFit: "contain", ...imgStyle }}
        />
    </Box>
}
export default ImageComponent