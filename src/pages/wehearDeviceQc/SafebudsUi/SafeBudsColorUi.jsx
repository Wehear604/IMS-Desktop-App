import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { toTitleCase } from "../../../utils/main";
import { useDispatch, useSelector } from "react-redux";
import { DeviceColorAction } from "../../../store/actions/deviceDataAction";

const SafeBudsColorUi = () => {
  const dispatch = useDispatch();
  const { deviceDataStore, settings } = useSelector((state) => state);
  return (
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
        Device Color :
      </Typography>

      {settings?.productColor_data?.result?.length === 0 ? (
        <Typography>No colors available</Typography>
      ) : (
        <RadioGroup
          value={deviceDataStore?.deviceColor}
          onChange={(e) => dispatch(DeviceColorAction(e.target.value))}
          sx={{ width: "100%" }}
        >
          {settings?.productColor_data?.result?.map((item) => (
            <Box
              key={item?._id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <FormControlLabel
                value={item?._id}
                control={<Radio />}
                label={toTitleCase(item?.name)}
              />
            </Box>
          ))}
        </RadioGroup>
      )}
    </Box>
  );
};

export default SafeBudsColorUi;
