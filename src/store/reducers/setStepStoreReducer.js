import { actions } from "../../utils/constants";

const initialState = {
  step: 0,
};

const setStepStoreReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_STEP:
      return { ...state, step: action.num };
    default:
      return state;
  }
};
export default setStepStoreReducer;
