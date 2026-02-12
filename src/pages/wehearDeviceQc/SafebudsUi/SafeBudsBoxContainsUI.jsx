import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEVICES } from "../../../utils/constants";
import { DeviceBoxDetailsAction } from "../../../store/actions/deviceDataAction";
import { toTitleCase, toTitleSpaceCase } from "../../../utils/main";

const SafeBudsBoxContainsUI = () => {
  const dispatch = useDispatch();
  const { deviceDataStore } = useSelector((state) => state);
  console.log("deviceDataStore", deviceDataStore);
  const toggleContains = useCallback(
    (targetKey) => {
      dispatch(
        DeviceBoxDetailsAction(
          deviceDataStore.box_Contains.map((item) => {
            const key = Object.keys(item)[0];
            return key === targetKey ? { [key]: !item[key] } : item;
          }),
          DEVICES.SAFE_BUDS,
        ),
      );
    },
    [dispatch, deviceDataStore.box_Contains],
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            minWidth: { sm: "150px" },
          }}
        >
          Box Contains :
        </Typography>
        <Box sx={{ width: "100%" }}>
          {deviceDataStore.box_Contains.map((item) => {
            const key = Object.keys(item)[0];
            const value = item[key];

            return (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value}
                      onChange={() => toggleContains(key)}
                      size="small"
                    />
                  }
                  label={toTitleSpaceCase(key)}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default SafeBudsBoxContainsUI;
