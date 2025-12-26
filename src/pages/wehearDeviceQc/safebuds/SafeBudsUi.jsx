import React, { useCallback, useEffect, useState } from "react";
import {
  SafeBudsDeviceName,
  SafeBudsTap,
} from "../../../store/actions/deviceQcAction";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  ListItem,
  List,
  ListItemText,
  Card,
  ButtonGroup,
} from "@mui/material";
import CustomDialog from "../../../components/layouts/common/CustomDialog";
import disabledChecked from "../../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../../assets/images/checkIconEnabled.svg";
import MicCheckUi from "./MicCheckUi";
import { DeviceSideAction } from "../../../store/actions/deviceDataAction";
import { LISTENING_SIDE } from "../../../utils/constants";
import ButtonComponentsUi from "../../../components/button/ButtonComponentsUi";
import { use } from "react";
import audioUrl from "../../../assets/images/AirplaneInterior.mp3";


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
  const { device, deviceQc } = useSelector((state) => state);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };
  const tapcheck = useCallback(
    (number) => {
      if (!device?.device_side) return false;

      return device?.device_side === LISTENING_SIDE.LEFT
        ? deviceQc.modeLeft?.includes(number)
        : deviceQc.modeRight?.includes(number);
    },
    [deviceQc.modeLeft, deviceQc.modeRight]
  );

  console.log("deviceQc.modeLeft", deviceQc.modeLeft);
  console.log("deviceQc.modeRight", deviceQc.modeRight);

  useEffect(() => {
    dispatch(SafeBudsDeviceName({ type: "NameChange" }));
    dispatch(SafeBudsTap({ type: "Tap" }));
    dispatch(DeviceSideAction(LISTENING_SIDE.LEFT));
  }, []);

  return (
    <CustomDialog
      title="SafeBuds QC Checklist"
      id="safebudsqc"
      onSubmit={step === 3 ? onComplete : handleNext}
      closeText="Close"
      confirmText={step === 3 ? `Finish` : "Next"}
    >
      <ButtonGroup>
        <ButtonComponentsUi
          onSubmit={() => dispatch(DeviceSideAction(LISTENING_SIDE.LEFT))}
          ButtonGroup
          STATUSWiseData={device?.device_side === LISTENING_SIDE.LEFT}
          Title={"LEFT SIDE"}
        />
        <ButtonComponentsUi
          onSubmit={() => dispatch(DeviceSideAction(LISTENING_SIDE.RIGHT))}
          ButtonGroup
          STATUSWiseData={device?.device_side === LISTENING_SIDE.RIGHT}
          Title={"RIGHT SIDE"}
        />
      </ButtonGroup>
      {step === 0 && (
        <>
          <StepCard
            isChecked={true}
            checked={tapcheck(1)}
            title="Single Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            checked={tapcheck(2)}
            title="Double Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            checked={tapcheck(3)}
            title="Triple Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            checked={tapcheck(4)}
            title="Long Press"
            //   subtitle="Test device audio output"
          />
        </>
      )}

      {step === 1 && (
        <Box>
          <StepCard
            isChecked={true}
            // checked={Boolean(device?.is_Audio_play)}
            title="Audio Check"
            subtitle="Test device audio output"
            action={
              <Button
                variant="contained"
                onClick={handlePlayPause}
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                sx={{
                  bgcolor: "#0d5966",
                  borderRadius: "25%",
                  height: "6vh",
                }}
              />
            }
          />
          <StepCard
            isChecked={true}
            // checked={deviceQc.volumeIncrease}
            title={"Volume Level check"}
          />
        </Box>
      )}
      {step === 2 && <MicCheckUi />}
    </CustomDialog>
  );
};

export default SafeBudsUi;
