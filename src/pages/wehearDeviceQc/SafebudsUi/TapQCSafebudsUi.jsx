import { ButtonGroup } from "@mui/material";
import React from "react";
import ButtonComponentsUi from "../../../components/button/ButtonComponentsUi";
import { ChangeButtonSide } from "../../../store/actions/deviceQcAction";
import { LISTENING_SIDE } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";

const TapQCSafebudsUi = () => {
  const dispatch = useDispatch();
  const { device } = useSelector((state) => state);

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
    </>
  );
};

export default TapQCSafebudsUi;
