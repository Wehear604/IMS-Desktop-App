import React from "react";
import UploadButtonSafeBuds from "../../components/inputs/UploadButtonSafeBuds";
import CustomDialog from "../../components/layouts/common/CustomDialog";

const SafeBudsFotUpload = () => {
  return (
    <CustomDialog
      id={"deviceAudioMicCheck"}
      title={"Safe Buds FOT Upload"}
      confirmText={"Upload Fot File"}
    >
      {" "}
      <UploadButtonSafeBuds />
    </CustomDialog>
  );
};

export default SafeBudsFotUpload;
