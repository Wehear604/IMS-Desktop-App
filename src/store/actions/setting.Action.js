import { fetchColorApi } from "../../apis/productColor.api";
import { actions } from "../../utils/constants";
import { callApiAction } from "./commonAction";

export const fetchProductColorAction = (
  filters,
  onSuccess = () => {},
  onError = () => {},
) => {
  return async (dispatch, getState) => {
    dispatch({ type: actions.FETCH_DATA_PRODUCT_COLOR_LODING });
    dispatch(
      callApiAction(
        async () => await fetchColorApi(filters),
        (response) => {
          dispatch({
            type: actions.FETCH_DATA_PRODUCT_COLOR_DATA,
            value: { data: response, filters: filters },
          });
          onSuccess(response);
        },
        (err) => {
          onError(err);
        },
      ),
    );
  };
};
