import { actions } from "../../utils/constants";

const initialState = {
  productColor_data: {},
  productColor_loading: false,
  productColor_filters: {},
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_DATA_PRODUCT_COLOR_LODING:
      return { ...state, productColor_loading: true };
    case actions.FETCH_DATA_PRODUCT_COLOR_DATA:
      return {
        ...state,
        productColor_loading: false,
        productColor_data: action.value.data,
        productColor_filters: action.value.filters,
      };
    case actions.FETCH_DATA_PRODUCT_COLOR_DELETE:
      return {
        ...state,
        productColor_data: action.value,
        productColor_filters: action.data.filters,
      };

    default:
      return { ...state };
  }
};

export default settingsReducer;
