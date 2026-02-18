import { ButtonGroup } from "@mui/material";
import React, { useEffect } from "react";
import ButtonComponentsUi from "../../../components/button/ButtonComponentsUi";
import { ChangeButtonSide } from "../../../store/actions/deviceQcAction";
import { LISTENING_SIDE } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import StepCard from "../../../components/StepCard";



const TapQCSafebudsUi = () => {
  const dispatch = useDispatch();
  const { device, deviceQc } = useSelector((state) => state);
  // const tapcheck = (number) => {
  //   if (!device?.device_side) return false;

  //   return device?.device_side === LISTENING_SIDE.LEFT
  //     ? deviceQc.modeLeft?.includes(number)
  //     : deviceQc.modeRight?.includes(number);
  // };

const tapcheck = (number) => {
  if (!device?.device_side) return false;

  const currentModes =
    device.device_side === LISTENING_SIDE.LEFT
      ? deviceQc.modeLeft || []
      : deviceQc.modeRight || [];

  return currentModes.some(
    (val) => Number(val) === Number(number)
  );
};


  useEffect(() => {
    if ([1, 2, 3, 4].every((val) => deviceQc.modeRight?.includes(val))) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    } else if ([1, 2, 3, 4].every((val) => deviceQc.modeLeft?.includes(val))) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT));
    }
    console.log("object deviceQc", deviceQc);
  }, [deviceQc.modeLeft, deviceQc.modeRight]);

  return (
    <>
      <ButtonGroup sx={{ width: "100%", mb: 2 }}>
        <ButtonComponentsUi
          onSubmit={() => dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT))}
          ButtonGroup
          STATUSWiseData={device?.device_side === LISTENING_SIDE.LEFT}
          Title={"LEFT SIDE"}
        />
        <ButtonComponentsUi
          onSubmit={() => dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT))}
          ButtonGroup
          STATUSWiseData={device?.device_side === LISTENING_SIDE.RIGHT}
          Title={"RIGHT SIDE"}
        />
      </ButtonGroup>

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
    </>
  );
};

export default TapQCSafebudsUi;
