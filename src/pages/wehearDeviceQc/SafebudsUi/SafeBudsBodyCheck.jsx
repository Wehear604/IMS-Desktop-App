import { Box, Checkbox, Divider, Typography } from "@mui/material";
import React, { useState } from "react";
import StepCard from "../../../components/StepCard";

const SafeBudsBodyCheck = ({ fields, setFields }) => {
  const toggle = (key) => () =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <Box width="100%">
        <Typography variant="h3" fontWeight={700} mb={2}>
          Body Check
        </Typography>
      </Box>

      <Box ml={2}>
        <StepCard
          checkBox={
            <Checkbox checked={fields.body1} onChange={toggle("body1")} />
          }
          title="Device checked for damage"
        />

        <StepCard
          checkBox={
            <Checkbox checked={fields.body2} onChange={toggle("body2")} />
          }
          title="Body checked for scratches"
        />
      </Box>

      {/* CHARGING CHECK */}
      {/* <Box width="100%" mt={2}>
        <Typography variant="h3" fontWeight={700} mb={2}>
          Charging
        </Typography>
      </Box> */}

      <Box ml={2}>
        <StepCard
          checkBox={
            <Checkbox checked={fields.charging} onChange={toggle("charging")} />
          }
          title="Charging function verified"
        />
      </Box>
    </>
  );
};

export default SafeBudsBodyCheck;
