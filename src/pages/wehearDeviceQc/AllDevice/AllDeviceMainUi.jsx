import { useDispatch, useSelector } from "react-redux";

const AllDeviceMainUi = ({ isUpdate }) => {
  const dispatch = useDispatch();
  const { device, deviceDataStore, step, deviceQc } = useSelector(
    (state) => state,
  );

  return (
    <CustomDialog
      title="QC Checklist"
      id="deviceAudioMicCheck"
      // onSubmit={(e) => (step.step === 4 ? Submit(e) : handleNext(e))}
      // onClose={() => {
      //   BLE_STORE.BTEdisconnect = true;
      //   dispatch(closeModal("deviceAudioMicCheck"));
      //   dispatch(resetDeviceDataStore());
      //   dispatch(CloseDeviceDataStore());
      // }}
      // onReject={(e) => {
      //   onRejectClick(e);
      // }}
      // isReject={true}
      closeText={step.step === 4 ? null : "Reject Qc"}
      confirmText={step.step === 4 ? (isUpdate ? "Update" : "Finish") : "Next"}
      // disabledSubmit={isUpdate ? false : disableNext()}
    ></CustomDialog>
  );
};

export default AllDeviceMainUi;
