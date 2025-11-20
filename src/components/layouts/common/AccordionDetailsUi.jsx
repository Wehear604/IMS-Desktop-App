import {
  AccordionDetails,
  Box,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useDispatch } from "react-redux";
import { openModal } from "../../../store/actions/modalAction";
import React from "react";
import { toTitleSpaceCase } from "../../../utils/main";


const AccordionDetailsUi = ({
  device,
  sideColor,
  selectedColorOptima,
  setFields,
  setSelectedColorOptima,
  side,
  isBorder,
  isBackgroundColor,
  handleMouseOver,
  handleMouseOut,
  img_src,
  Title,
  hovered,
  Right_src,
  Center_src,
  Left_src,
  OnClickRight = () => { },
  OnClickCenter = () => { },
  OnClickLeft = () => { }, setDevice
}) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  // const fittingRangView = () => {
  //   dispatch(
  //     openModal(
  //       <DeviceFittingRangeUi device={device} />,
  //       "md",
  //       false,
  //       "deviceFittingRange"
  //     )
  //   );
  // };

  return (
    <Grid
      container
      spacing={2}
      gap={3}
      p={3}
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Paper
        elevation={isBorder ? 3 : 0}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          gap: 1.5,
          width: "100%",
          maxWidth: 250,
          height: 220,
          borderRadius: 2,
          border: isBorder ? "2px solid #2D3B67" : "1px solid #DDDDDD",
          backgroundColor: isBackgroundColor ? "#EDF0F7" : "white",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        {/* <Box>
          <IconButton onMouseOver={handlePopoverOpen}
            onMouseOut={handlePopoverClose} size="small">
            <InfoIcon
              fontSize="small"
              color="primary"
              visibility={hovered ? "visible" : "hidden"}
            />
          </IconButton>
        </Box> */}

        {/* {sideColor && (
          <Box
            sx={{
              position: "absolute",
              top: "10px",
              right: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {Object.entries(sideColor).map(([key, color]) => (
              <Box
                key={key}
                sx={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: " 1px solid #DDDDDD",
                  outline:
                    selectedColorOptima === DEVICE_COLORS[key]
                      ? "1px solid black"
                      : "none",
                  outlineOffset: "2px",
                }}
                disabled={true}
                onClick={() => {
                  // if (device !== DEVICES.RIC_OPTIMA) return;
                  setSelectedColorOptima(DEVICE_COLORS[key]);
                  setDevice(device)
                  setFields((prevFields) => ({
                    ...prevFields,
                    right_fitted_device: {
                      ...prevFields.right_fitted_device,
                      device_color: DEVICE_COLORS[key],
                      device_type: device
                    },
                    left_fitted_device: {
                      ...prevFields.left_fitted_device,
                      device_color: DEVICE_COLORS[key],
                      device_type: device
                    },
                  }));
                }}
              ></Box>
            ))}
          </Box>
        )} */}
        <Box sx={{ textAlign: "center" }}>
          <img
            src={img_src}
            alt={Title}
            style={{
              width: "150px",
              height: "130px",
              objectFit: "contain",
            }}
          />
        </Box>
        <Typography sx={{ textAlign: "center" }} variant="h5" component="div">
          {toTitleSpaceCase(Title)}
          {hovered && (
            <Grid
              mt={2}
              container
              sx={{
                display: "flex",
                width: "9vw",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              
                <Box sx={{ cursor: "pointer" }} onClick={() => OnClickRight()}>
                  <img
                    src={Right_src}
                    alt="RightEar"
                    style={{
                      width: "22px",
                      height: "22px",
                    }}
                  />
                </Box>
              
              {/* {(side === "Both" || side === "OnlyBoth") && (
                <Box
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    width: side === "OnlyBoth" && "100%",
                  }}
                  onClick={() => OnClickCenter()}
                >
                  <img
                    src={Center_src}
                    alt="CenterEar"
                    style={{
                      width: "22px",
                      height: "22px",
                    }}
                  />
                </Box>
              )} */}
              
                <Box sx={{ cursor: "pointer" }} onClick={() => OnClickLeft()}>
                  <img
                    src={Left_src}
                    alt="LeftEar"
                    style={{
                      width: "22px",
                      height: "22px",
                    }}
                  />
                </Box>
              
            </Grid>
          )}
        </Typography>
      </Paper>
      {/* <Box sx={{ width: "100%", height: "100%" }}>
        <DeviceFittingRangeUi anchorEl={anchorEl} device={device} />
      </Box> */}
    </Grid>
  );
};

export default AccordionDetailsUi;
