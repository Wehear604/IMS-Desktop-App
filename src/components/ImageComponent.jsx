import { Close } from "@mui/icons-material";
import { Box, Dialog, DialogContent, DialogTitle, Fade, IconButton, Modal, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { getFileOrImage } from "../apis/file.api";
import { CenteredBox } from "./layouts/OneViewBox";


const ImageComponent = ({ src, alt, sx = {}, noClickEffect, isStatic, imgStyle = {}, ...props }) => {
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        if (!noClickEffect) {
            setOpen(true);
        }
    };
    const handleClose = () => {
        setOpen(false);
    };

    const fetchImage = async () => {
        const file = await getFileOrImage(src)

        setImage(URL.createObjectURL(file))

        setLoading(false)
    }
    const [img, setImage] = useState(isStatic ? src : null)

    useEffect(() => {
        if (!isStatic)
            fetchImage()
    }, [src])

    return (

        <> <Dialog

            open={open}
            onClose={handleClose}
            TransitionComponent={Fade}
            fullWidth
        >
            <DialogTitle sx={{ justifyContent: "flex-end", display: "flex" }}>
                <IconButton onClick={handleClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ overflow: "hidden", height: window.innerHeight }}   >

                <CenteredBox sx={{ width: "100%", height: "100%", background: "lightgray", position: "relative" }} >

                    <img onLoad={() => { setLoading(false) }} src={img} alt={alt} style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "contain"
                    }} {...props} onClick={handleOpen} />

                </CenteredBox>
            </DialogContent>
        </Dialog>

            <Box sx={{ width: "100%", position: "relative", height: "100%" }}>
                {loading && <Box sx={{ position: "absolute", top: "0px", left: "0px", width: "100%", height: "100%", minHeight: "200px" }} p={2}>
                    <Skeleton height="100%" width="100%" sx={{ height: "100%", width: "100%" }} animation="wave" variant="rounded" >

                    </Skeleton>
                </Box>}
                <img src={img} onLoad={() => { setLoading(false) }} alt={alt} style={{ objectFit: "cover", width: "100%", height: "100%", ...sx, cursor: noClickEffect ? "default" : "pointer", ...imgStyle }} {...props} onClick={handleOpen} />
            </Box>

        </>)
}
export default ImageComponent