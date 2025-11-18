import { actions } from "../../utils/constants";

export const openModal = (
  component,
  size = "md",
  disableDirectClose = false,
  id
) => {
  return { type: actions.OPEN_MODAL, component, size, disableDirectClose, id };
};
export const closeModal = (id) => {
  return { type: actions.CLOSE_MODAL, id };
};
