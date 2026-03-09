import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useDispatch } from "react-redux";
// import { DEVICE_COLORS, DEVICES } from "../../../utils/patient.constants";

const AccordionDetailsUi = ({
  isBorder,
  isBackgroundColor,
  img_src,
  Title,
  OnClickCenter = () => { },
  setDevice,
}) => {
  const dispatch = useDispatch();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%" }}
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
        onClick={OnClickCenter}
      >
        {/* <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <Tooltip
            title={`More info about ${Title}`}
            open={showTooltip}
            onOpen={() => setShowTooltip(true)}
            onClose={() => setShowTooltip(false)}
            arrow
          >
            <IconButton size="small" color="primary">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box> */}

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

        <Typography
          variant="subtitle1"
          fontWeight={600}
          textAlign="center"
          color="text.primary"
        >
          {Title}
        </Typography>
      </Paper>
    </Grid>
  );
};

export default AccordionDetailsUi;
