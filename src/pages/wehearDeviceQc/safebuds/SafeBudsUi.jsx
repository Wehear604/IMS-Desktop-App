import React, { useEffect, useState } from "react";
import {
  SafeBudsDeviceName,
  SafeBudsTap,
} from "../../../store/actions/deviceQcAction";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  ListItem,
  List,
  ListItemText,
  Card,
} from "@mui/material";
import CustomDialog from "../../../components/layouts/common/CustomDialog";
import disabledChecked from "../../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../../assets/images/checkIconEnabled.svg";
import MicCheckUi from "./MicCheckUi";

const StepCard = ({
  isChecked,
  checked,
  title,
  subtitle,
  action,
  checkBox,
}) => (
  <Card
    sx={{
      width: "100%",
      borderRadius: 2,
      boxShadow: 0,
      border: "1px solid #e6e6e6",
      mb: 2,
    }}
  >
    <List>
      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display={"flex"} gap={4} alignItems="center">
          {isChecked ? (
            <img src={checked ? enabledChecked : disabledChecked} alt="check" />
          ) : (
            checkBox && <Box>{checkBox}</Box>
          )}
          <ListItemText
            primary={<Typography variant="h5">{title}</Typography>}
            secondary={
              subtitle ? <Typography variant="h6">{subtitle}</Typography> : null
            }
          />
        </Box>
        {action && <Box>{action}</Box>}
      </ListItem>
    </List>
  </Card>
);

const SafeBudsUi = () => {
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  useEffect(() => {
    dispatch(SafeBudsDeviceName({ type: "NameChange" }));
    dispatch(SafeBudsTap({ type: "Tap" }));
  }, []);
  return (
    <CustomDialog
      title="SafeBuds QC Checklist"
      id="safebudsqc"
      onSubmit={step === 3 ? onComplete : handleNext}
      closeText="Close"
      confirmText={step === 3 ? `Finish` : "Next"}
    >
      {step === 0 && (
        <>
          <StepCard
            isChecked={true}
            //   checked={Boolean(device?.is_Audio_play)}
            title="Single Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            //   checked={Boolean(device?.is_Audio_play)}
            title="Double Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            //   checked={Boolean(device?.is_Audio_play)}
            title="Triple Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            //   checked={Boolean(device?.is_Audio_play)}
            title="Long Press"
            //   subtitle="Test device audio output"
          />
        </>
      )}

      {step === 1 && (
        <Box>
          <StepCard
            isChecked={true}
            //   checked={deviceQc.volumeIncrease}
            title={"Volume Level check"}
          />
        </Box>
      )}
      {step === 2 && <MicCheckUi />}
    </CustomDialog>
  );
};

export default SafeBudsUi;
