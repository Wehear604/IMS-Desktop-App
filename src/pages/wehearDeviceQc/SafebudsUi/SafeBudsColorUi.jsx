import React, { useEffect } from "react";
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toTitleCase } from "../../../utils/main";
import { DeviceColorAction } from "../../../store/actions/deviceDataAction";
import { fetchProductColorAction } from "../../../store/actions/setting.Action";

const SafeBudsColorUi = () => {
  const dispatch = useDispatch();

  const { deviceDataStore, settings } = useSelector((state) => state);

  const colors = settings?.productColor_data?.result || [];
  const isLoading = settings?.productColor_loading;

  useEffect(() => {
    if (!settings?.productColor_data?.result?.length) {
      dispatch(fetchProductColorAction());
    }
  }, [dispatch]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        width: "100%",
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

      {isLoading ? (
        <Typography>Loading colors...</Typography>
      ) : colors.length === 0 ? (
        <Typography>No colors available</Typography>
      ) : (
        <RadioGroup
          value={deviceDataStore?.deviceColor || ""}
          onChange={(e) => dispatch(DeviceColorAction(e.target.value))}
          sx={{ width: "100%" }}
        >
          {colors.map((item) => (
            <FormControlLabel
              key={item?._id}
              value={item?._id}
              control={<Radio />}
              label={toTitleCase(item?.name)}
            />
          ))}
        </RadioGroup>
      )}
    </Box>
  );
};

export default SafeBudsColorUi;
