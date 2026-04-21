import React, { useCallback, useEffect, useMemo, useState } from "react";
import DeviceQcListUi from "./DeviceQcListUi";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import DeviceConnectUi from "./DeviceConnectUi";
import ProductDetailsQcUi from "./ProductDetailsQcUi";
import { useDispatch, useSelector } from "react-redux";
import {
  DeviceBoxDetailsAction,
  DeviceSideAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import { create } from "@mui/material/styles/createTransitions";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { DEVICES, SNACK_BAR_VARIETNS } from "../../utils/constants";
import useValidate from "../../store/hooks/useValidator";
import { callApiAction } from "../../store/actions/commonAction";
import {
  createDeviceQcApi,
  getDeviceByIdApi,
  updateDeviceQcApi,
} from "../../apis/deviceQc.api";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { fetchProductColorAction } from "../../store/actions/setting.Action";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import SafeBudsBoxContainsUI from "./SafebudsUi/SafeBudsBoxContainsUI";
import SafebudsMainUi from "./SafebudsUi/SafebudsMainUi";
import BoxContainsUI from "./AllDevice/BoxContainsUI";

const DeviceQcListController = ({
  initialStep = 0,
  isUpdate,
  callBack = () => {},
  id,
}) => {
  const [step, setStep] = useState(initialStep);
  const [fields, setFields] = useState({
    err: "",
    box_Contains: [],
    boxId: null,
    deviceColor: null,
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const validate = useValidate();
  const { deviceDataStore, device, settings } = useSelector((state) => state);
  const [filters, setFilters] = useState({
    search: "",
  });
  useEffect(() => {
    if (
      step === 1 &&
      deviceDataStore.left.result &&
      deviceDataStore.right.result &&
      deviceDataStore.left.device_type !== DEVICES.SAFE_BUDS &&
      deviceDataStore.right.device_type !== DEVICES.SAFE_BUDS
    ) {
      dispatch(
        openModal(
          <BoxContainsUI allDevice={true} fields={fields} />,
          "lg",
          true,
          "deviceAudioMicCheck",
        ),
      );
    }
  }, [deviceDataStore.left.result, deviceDataStore.right.result, step]);

  useEffect(() => {
    if (
      step === 2 &&
      fields.box_Contains.length !== 0 &&
      fields.boxId &&
      fields.deviceColor
    ) {
      dispatch(
        DeviceBoxDetailsAction(
          fields?.box_Contains,
          fields?.boxId,
          fields?.deviceColor,
          device.device_type,
        ),
      );
    } else if (step === 2 && fields.boxId) {
      dispatch(
        DeviceBoxDetailsAction(
          fields?.box_Contains,
          fields?.boxId,
          fields?.deviceColor,
          device.device_type,
        ),
      );
    }
  }, [fields]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const fetchById = useCallback(
    (id) => {
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await getDeviceByIdApi({ id }),
          async (response) => {
            setFields((prev) => ({ ...prev, ...response }));
            setLoading(false);
          },
          (err) => {
            setFields((prev) => ({ ...prev, err }));
            setLoading(false);
          },
        ),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  const getColorList = () => {
    dispatch(fetchProductColorAction());
  };

  useEffect(() => {
    getColorList();
  }, []);

  useEffect(() => {
    dispatch(resetDeviceDataStore(true));
  }, []);
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {step === 0 && (
          <>
            {" "}
            <Box>
              <DeviceQcListUi
                fields={fields}
                setFields={setFields}
                filters={filters}
                setFilters={setFilters}
              />
            </Box>
            <Box
              p={2}
              mt={4}
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                sx={{ width: "8vw" }}
                onClick={() => setStep(step + 1)}
                disabled={device.device_type === null}
              >
                <Typography variant="h5" sx={{ textTransform: "none" }}>
                  Next
                </Typography>
              </Button>
            </Box>
          </>
        )}

        {step === 1 && device.device_type !== DEVICES.SAFE_BUDS && (
          <>
            <DeviceConnectUi />

            <Box
              p={2}
              mt={4}
              m={2}
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Button
                variant="contained"
                sx={{ width: "8vw" }}
                onClick={() => {
                  dispatch(DeviceSideAction(null));
                  setStep(step - 1);
                }}
              >
                <Typography variant="h5" sx={{ textTransform: "none" }}>
                  Back
                </Typography>
              </Button>
            </Box>
          </>
        )}

        {step === 1 && device.device_type === DEVICES.SAFE_BUDS && (
          <>
            {loading ? (
              <CenteredBox>
                <CircularProgress />
              </CenteredBox>
            ) : (
              <>
                <DeviceConnectUi />
                <Box
                  p={2}
                  mt={4}
                  m={2}
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{ width: "8vw" }}
                    onClick={() => {
                      dispatch(DeviceSideAction(null));
                      setStep(step - 1);
                    }}
                  >
                    <Typography variant="h5" sx={{ textTransform: "none" }}>
                      Back
                    </Typography>
                  </Button>
                </Box>
                {/* <SafebudsMainUi /> */}
                {/* <ProductDetailsQcUi
                  setBox={setFields}
                  box={fields}
                  isUpdate={isUpdate}
                /> */}
              </>
            )}

            {/* <Box
              sx={{
                p: 4,
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Box>
                <Button
                  variant="contained"
                  sx={{ width: "8vw" }}
                  onClick={Submit}
                  // disabled={fields.boxId ? loading : !fields.boxId}
                >
                  <Typography variant="h5" sx={{ textTransform: "none" }}>
                    Submit
                  </Typography>
                </Button>
              </Box>
            </Box> */}
          </>
        )}
      </Paper>
    </>
  );
};

export default DeviceQcListController;
