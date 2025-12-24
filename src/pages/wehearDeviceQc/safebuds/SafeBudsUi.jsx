import React, { useEffect } from "react";
import {
  SafeBudsDeviceName,
  SafeBudsTap,
} from "../../../store/actions/deviceQcAction";
import { useDispatch } from "react-redux";

const SafeBudsUi = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SafeBudsDeviceName({ type: "NameChange" }));
    dispatch(SafeBudsTap({ type: "Tap" }));
  }, []);

  return <div>SafeBudsUi</div>;
};

export default SafeBudsUi;
