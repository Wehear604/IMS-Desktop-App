import { actions } from "../../utils/constants";

const initialState = new Map([]);

const modalReducer = (state = initialState, action) => {
  const { id } = action;

  switch (action.type) {
    case actions.OPEN_MODAL:
      return new Map(state).set(id ?? "DEMO", {
        id: id ?? "DEMO",
        open: true,
        component: action.component,
        size: action.size,
        disableDirectClose: action.disableDirectClose,
      });
    case actions.CLOSE_MODAL:
      (() => {
        const data = state.get(id ?? "DEMO");
        state.set(id ?? "DEMO", { ...data, open: false });
        return new Map(state);
      })();
    default:
      return new Map(state);
  }
};
export default modalReducer;
