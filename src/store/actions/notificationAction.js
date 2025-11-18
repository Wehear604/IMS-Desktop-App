import { getNotifcationsApi } from "../../apis/notification.api";
import { actions, NOTIFICATION_TYPE } from "../../utils/constants";
import { lastReadNotification } from "../../utils/main";
import { callApiAction } from "./commonaction";

const redirectTo = (type, id) => {
  switch (type) {
    case NOTIFICATION_TYPE.general:
      return null;
    case NOTIFICATION_TYPE.project:
      return `/projects/show/${id}`;
    case NOTIFICATION_TYPE.lead:
      return null;
    default:
      return null;
  }
};

export const fetchNotificationAction = () => {
  return async (dispatch, getState) => {
    dispatch(
      callApiAction(
        async () => await getNotifcationsApi(),
        (response) => {
          let newNotification = 0;
          const lastReadId = lastReadNotification.get();

          if (response && Array.isArray(response) && response.length > 0) {
            for (let i = 0; i < response.length; i++) {
              response[i].redirect = redirectTo(
                response[i].notificationType,
                response[i].contentId
              );
              if (response[i]._id == lastReadId) {
                break;
              } else {
                newNotification++;
              }
            }
          }
          dispatch({
            type: actions.SET_NOTIFICATION_DATA,
            new: newNotification,
            data: response,
          });
        },
        (err) => {}
      )
    );
  };
};
export const readNotificationAction = () => {
  return async (dispatch, getState) => {
    if (
      getState &&
      getState().notifications &&
      getState().notifications.data &&
      Array.isArray(getState().notifications.data) &&
      getState().notifications.data[0]
    ) {
      lastReadNotification.set(getState().notifications.data[0]._id);
    }

    dispatch({ type: actions.NOTIFICATION_READ });
  };
};
