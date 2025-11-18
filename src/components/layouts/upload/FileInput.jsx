import { Delete, FileCopyOutlined, PictureAsPdf, UploadFile } from "@mui/icons-material"
import { Box, ButtonBase, CircularProgress, Grid, IconButton, LinearProgress, Typography, styled } from "@mui/material"
import { useCallback, useState } from "react"
import { deletefileOrImage, uploadFile, uploadImage } from "../../../apis/file.api"
import { useDispatch } from "react-redux"
import { callSnackBar } from "../../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../../utils/constants"
import { callApiAction } from "../../../store/actions/commonAction"
import { closeModal, openModal } from "../../../store/actions/modalAction"
// import ImageCropComponent from "./imagecropper/ImageCropComponent"
import ImageComponent from "./ImageComponent"
import { CenteredBox } from "../../layouts/common/boxes"
import ImageCropComponent from "./ImageCropComponent"

const FileViewrBox = styled(Box)(({ theme }) => ({
    width: "100%",
    border: "1px solid " + theme.palette.primary.main,
    position: "relative",
    height: "100%",
    display: "flex",
    justifyContent: "flex-start",
    cusrsor: "pointer",
    alignItems: "center",

    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),

    marginBottom: theme.spacing(1),
    "*": {
        zIndex: 1,
        wordBreak: "break-word",
    },
    "::after": {
        zIndex: 0,
        content: "' '",
        position: "absolute",
        top: "0px",

        left: "0px",
        height: "100%",
        width: "100%",
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.primary.main,
        opacity: "0.2",
    }
}))


const FileViewer = ({ urls, onDelete = () => { }, image }) => {
    const [loading, setLoading] = useState(false)
    const filePath = urls ? urls?.split('/') : []
    const fileName = filePath[filePath.length - 1]


    const onDeletBtnCLick = () => {
        onDelete(urls, () => setLoading(false))
    }
    return <Grid item xs={4} md={4}>

        {
            <FileViewrBox sx={{ width: "100%", flexDirection: "column" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }} >
                    {loading ? <CircularProgress /> : <IconButton onClick={onDeletBtnCLick} size="small"><Delete /></IconButton>}
                </Box>
                <ImageComponent src={urls} alt="image" />
            </FileViewrBox>
        }

    </Grid>

}

const FileContainer = styled(ButtonBase)(({ theme }) => ({
    width: "100%",
    border: "2px dashed " + theme.palette.primary.main,
    position: "relative",
    minHeight: "55px",
    display: "flex",
    justifyContent: "flex-start",
    cusrsor: "pointer",

    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    paading: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "input": {
        cursor: "pointer",
        opacity: "0",
        zIndex: 11,
        position: "absolute",
        top: "0px",
        left: "0px",
        height: "100%",
        width: "100%",
    },
    "::after": {
        content: "' '",
        position: "absolute",
        top: "0px",
        left: "0px",
        height: "100%",
        width: "100%",
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.primary.main,
        opacity: "0.2",
    }
}))



const FileInput = ({
    onlyImage,
    multi,
    accept = "*",
    crop,
    onChange,
    onDelete = () => { },
    fileProps,
    defaults = [],
    FileComponent,
    componentProps = {},
    title = "Files",
    subTitle = "Upload files here",
    noCompression = false
}) => {

    const dispatch = useDispatch()

    const [files, setFiles] = useState(defaults)
    const [loading, setLoading] = useState(false)
    const [percentage, setPercentage] = useState(0)


    const onChangeFile = (e) => {
        if (crop && onlyImage && e.target.files[0]) {

            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function () {
                dispatch(openModal(<ImageCropComponent

                    fileName={e?.target?.files[0]?.name} onSubmit={(croppedImg) => {
                        dispatch(closeModal())
                        onFileSubmit(croppedImg)

                    }} src={reader.result}

                />))
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
        else {

            onFileSubmit(e.target.files[0])

        }
    }

    const onFileSubmit = (file) => {
        setLoading(true)
        const formData = new FormData()
        if (onlyImage) {
            formData.append('image', file)
        } else {
            formData.append('file', file)
        }

        if (noCompression) {
            formData.append('noCompression', true)
        }

        dispatch(callApiAction(
            async () => onlyImage ? await uploadImage(formData, (progressEvent) => {
                setPercentage(Math.round((progressEvent.loaded * 100) / progressEvent.total))
            }) : await uploadFile(formData, (progressEvent) => {
                setPercentage(Math.round((progressEvent.loaded * 100) / progressEvent.total))
            }),
            (response) => {
                setFiles(multi ? [...files, response.url] : [response.url])
                onChange(response.url, [...files, response.url])
                setLoading(false)
                setPercentage(0)
            },
            (err) => {
                setLoading(false
                )
                setPercentage(0)
            }
        ))
    }

    const onDeleteFile = useCallback((url, onComplete = () => { }) => {
        dispatch(callApiAction(
            async () => deletefileOrImage(url),
            (response) => {

                const oldList = files
                const newList = []

                for (let file of oldList) {
                    if (file != url)
                        newList.push(file)
                }
                setFiles(newList)
                onDelete(url, newList)
                dispatch(callSnackBar('File deleted successfully.', SNACK_BAR_VARIETNS.suceess))
                onComplete()
            },
            (err) => {
                onComplete()
                console.warn(err)
                dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
            },
            true
        ))
    }, [onDelete, files])

    if (FileComponent)
        return <FileComponent loading={loading} onChange={onChangeFile} percentage={percentage} onDeleteFile={onDeleteFile} files={files} {...componentProps} />
    return <Box>


        <FileContainer mt={2} mb={2}>
            <input onChange={onChangeFile} type="file" accept={onlyImage ? "image/*" : accept} capture="environment" name="file" id="file" {...fileProps} />
            {
                loading && <CenteredBox p={3} sx={{ width: "100%" }}>

                    <LinearProgress sx={{ zIndex: 1111, width: "100%" }} color="primary" variant="determinate" value={percentage} />
                </CenteredBox>
            }
            {!loading && <><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} ml={3}>
                <Typography variant="h3" align="center" lineHeight="100%"><UploadFile fontSize="inherit" lineHeight="100%"></UploadFile></Typography>
            </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-start", flexDirection: "column", flex: 1 }} ml={3}>
                    <Typography align="left" variant="h6" fontWeight="bold">{title}</Typography>
                    <Typography align="left" variant="body2">{subTitle}</Typography>
                </Box></>}

        </FileContainer>

        {files && files.length > 0 && <Grid container spacing={1}>
            {files.map((file) => <FileViewer image={onlyImage} key={file} urls={file} onDelete={onDeleteFile} />)}
        </Grid>

        }
    </Box>
}
export default FileInput