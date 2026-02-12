import { actions } from "../../utils/constants";

export const SetStepAction = (num) => {
  return { type: actions.SET_STEP, num };
};
