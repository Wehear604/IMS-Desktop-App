import React, { useEffect, useMemo, useState } from "react";
import DeviceQcListUi from "./DeviceQcListUi";
import { useLocation } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import DeviceConnectUi from "./DeviceConnectUi";
import ProductDetailsQcUi from "./ProductDetailsQcUi";
import { useDispatch, useSelector } from "react-redux";
import {
  DeviceBoxDetailsAction,
  DeviceSideAction,
} from "../../store/actions/deviceDataAction";
import { create } from "@mui/material/styles/createTransitions";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import useValidate from "../../store/hooks/useValidator";
import { callApiAction } from "../../store/actions/commonAction";
import { createDeviceQcApi } from "../../apis/deviceQc.api";

const DeviceQcListController = () => {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState({
    err: "",
    box_Contains: [],
    boxId: null,
    deviceColor: null,
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const validate = useValidate();
  const { deviceDataStore, device } = useSelector((state) => state);
  console.log("deviceDataStore", deviceDataStore);
  const [filters, setFilters] = useState({
    search: "",
  });
  useEffect(() => {
    if (
      step === 1 &&
      deviceDataStore.left.result &&
      deviceDataStore.right.result
    ) {
      setStep(2);
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
          device.device_type
        )
      );
    } else if (step === 2 && fields.boxId) {
      dispatch(
        DeviceBoxDetailsAction(
          fields?.box_Contains,
          fields?.boxId,
          fields?.deviceColor,
          device.device_type
        )
      );
    }
  }, [fields]);
  // console.log("deviceDataStore", deviceDataStore);

  const validationSchemaForCreate = useMemo(
    () => [
      {
        required: true,
        value: fields.box_Contains.length !== 0,
        field: "Box Contains",
      },
      {
        required: true,
        value: fields.boxId,
        field: "Box ID",
      },
      {
        required: true,
        value: fields.deviceColor,
        field: "Device Color",
      },
    ],
    [fields]
  );

  const onSubmit = async () => {
    const validationResponse = validate(validationSchemaForCreate);

    // if (validationResponse === true) {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await createDeviceQcApi(deviceDataStore),
        async (response) => {
          setLoading(false);
          setStep(0);
          dispatch(
            callSnackBar(
              "Device QC Created Successfully",
              SNACK_BAR_VARIETNS.suceess
            )
          );
          // dispatch(fetchDeviceQcAction(settings.deviceQc_filters))
          // dispatch(closeModal("device-qc"))
        },
        (err) => {
          setFields({ ...fields, err });
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
        }
      )
    );
    // } else {
    //   setFields({ ...fields, err: validationResponse });
    // }
  };

  return (
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
            sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
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
      {step === 1 && (
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

      {step === 2 && (
        <>
          <ProductDetailsQcUi setBox={setFields} box={fields} />

          <Box
            sx={{
              p: 4,
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Button
                variant="contained"
                sx={{ width: "8vw" }}
                onClick={() => setStep(step - 1)}
              >
                <Typography variant="h5" sx={{ textTransform: "none" }}>
                  Back
                </Typography>
              </Button>
            </Box>

            <Box>
              <Button
                variant="contained"
                sx={{ width: "8vw" }}
                onClick={onSubmit}
              >
                <Typography variant="h5" sx={{ textTransform: "none" }}>
                  Submit
                </Typography>
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default DeviceQcListController;
