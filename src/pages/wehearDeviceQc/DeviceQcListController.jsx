import React, { useEffect, useState } from "react";
import DeviceQcListUi from "./DeviceQcListUi";
import { useLocation } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import DeviceConnectUi from "./DeviceConnectUi";
import ProductDetailsQcUi from "./ProductDetailsQcUi";
import { useDispatch, useSelector } from "react-redux";
import { DeviceBoxDetailsAction } from "../../store/actions/deviceDataAction";

const DeviceQcListController = () => {
  const [fields, setFields] = useState();
  const [box, setBox] = useState({
    box_Contains: [],
    boxId: null,
    deviceColor: null,
  });
  const dispatch = useDispatch();
  const { deviceDataStore } = useSelector((state) => state);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [step, setStep] = useState(2);
  useEffect(() => {
    if (
      step === 1 &&
      deviceDataStore.left.allFilled &&
      deviceDataStore.right.allFilled
    ) {
      setStep(2);
    }
  }, [deviceDataStore.left.allFilled, deviceDataStore.right.allFilled, step]);

  useEffect(() => {
    if (
      step === 2 &&
      box.box_Contains.length !== 0 &&
      box.boxId &&
      box.deviceColor
    ) {
      dispatch(
        DeviceBoxDetailsAction(box?.box_Contains, box?.boxId, box?.deviceColor)
      );
    } else if (step === 2 && box.boxId) {
      dispatch(
        DeviceBoxDetailsAction(box?.box_Contains, box?.boxId, box?.deviceColor)
      );
    }
  }, [box]);
  console.log("deviceDataStore", deviceDataStore);
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
              onClick={() => setStep(step - 1)}
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
          <ProductDetailsQcUi setBox={setBox} box={box} />

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
              onClick={() => setStep(step - 1)}
            >
              <Typography variant="h5" sx={{ textTransform: "none" }}>
                Back
              </Typography>
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default DeviceQcListController;
