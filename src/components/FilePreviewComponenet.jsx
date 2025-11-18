import CustomDialog from "./layouts/common/CustomDialog";
import { Box } from "@mui/material";


const FilePreviewComponent = ({ device_photo }) => {
    return <>
        <CustomDialog title={"Image Preview"}
        >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
                <img src={device_photo} sx={{ width: "400px", Height: "400px" }} />
            </Box>

        </CustomDialog>
    </>
}

export default FilePreviewComponent;