import { Height } from "@mui/icons-material";
import CustomDialog from "./layouts/common/CustomDialog";
import ImageComponent from "./ImageComponent";
import { CenteredBox } from "./layouts/OneViewBox";
import { CircularProgress } from "@mui/material";


const FilePreviewComponent = ({device_photo}) =>{
    return <>
        <CustomDialog title={"Image Preview"}
        >
            {/* {
            device_photo ?  */}
            <ImageComponent src={device_photo} sx={{width:"400px",Height:"400px"}}/>
            {/* :
            <CenteredBox><CircularProgress /></CenteredBox>
        } */}
        </CustomDialog>
    </>
}

export default FilePreviewComponent;