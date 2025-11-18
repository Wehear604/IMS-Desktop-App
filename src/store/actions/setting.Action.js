import { fetchCategoryApi } from "../../apis/category.api";
import { fetchComponentApi } from "../../apis/component.api";
import { fetchDepartments } from "../../apis/department.api";
import { fetchitemTypeApi } from "../../apis/itemType.api";
import { fetchInventoryMaster } from "../../apis/inventoryMaster.api";
import { fetchProductCurrentStock, fetchRawMaterialCurrentStock } from "../../apis/leads.api";
import { fetchProductApi } from "../../apis/product.api";
import { fetchBrandApi } from "../../apis/productBrand.api";
import { fetchColorApi } from "../../apis/productColor.api";
import { fetchTypeApi } from "../../apis/productType.api";
import { fetchBatchApi, fetchProductQcApi } from "../../apis/qc.api";
import { fetchRawMaterialApi } from "../../apis/rawMaterial.api";
import { fetchRejectionReasonApi } from "../../apis/rejectionReason.api";
import { fetchTypeofSaless } from "../../apis/typeofsale.api";
import { fetchvendorApi } from "../../apis/vendor.api";
import { actions } from "../../utils/constants"
import { callApiAction } from "./commonAction";
import { fetchVersiones } from "../../apis/version.api";
import { fetchlocationMasterApi } from "../../apis/locationMaster.api";

export const fetchVendorAction = (filters,
    onSuccess = () => { }, onError = () => { }
) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_VENDER_LODING });
        dispatch(callApiAction(
            async () => await fetchvendorApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_VENDER_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        )
        );
    };
};

export const deleteVendorAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_VENDER_DELETE,
            value: { data: data, filters: filters }
        });
    };
};

export const fetchRawMaterialAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_RAWMATERIAL_LODING });
        dispatch(callApiAction(
            async () => await fetchRawMaterialApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_RAWMATERIAL_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteRawMaterialAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_RAWMATERIAL_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchProductBrandAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_PRODUCT_BRAND_LODING });
        dispatch(callApiAction(
            async () => await fetchBrandApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_PRODUCT_BRAND_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteProductBrandAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_PRODUCT_BRAND_DELETE,
            value: { data: data, filters: filters }
        });
    }
}


export const fetchProductAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_PRODUCT_LODING });
        dispatch(callApiAction(
            async () => await fetchProductApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_PRODUCT_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteProductAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_PRODUCT_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchDepartmentAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_DEPARTMENT_LODING });
        dispatch(callApiAction(
            async () => await fetchDepartments(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_DEPARTMENT_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteDepartmentAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_DEPARTMENT_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchTypeOfSalesAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_TYPE_OF_SALES_LODING });
        dispatch(callApiAction(
            async () => await fetchTypeofSaless(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_TYPE_OF_SALES_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteTypeOfSalesAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_TYPE_OF_SALES_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchCategoryAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_CATEGORY_LODING });
        dispatch(callApiAction(
            async () => await fetchCategoryApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_CATEGORY_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteCategoryAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_CATEGORY_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchUpdateStockProductAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_UPDATE_STOCK_PRODUCT_LODING });
        dispatch(callApiAction(
            async () => await fetchProductCurrentStock(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_UPDATE_STOCK_PRODUCT_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteUpdateStockProductAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_UPDATE_STOCK_PRODUCT_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchUpdateStockRawMaterialAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_UPDATE_STOCK_RAW_MATERIAL_LODING });
        dispatch(callApiAction(
            async () => await fetchRawMaterialCurrentStock(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_UPDATE_STOCK_RAW_MATERIAL_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteUpdateStockRawMaterialAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_UPDATE_STOCK_RAW_MATERIAL_DELETE,
            value: { data: data, filters: filters }
        });
    }
}


export const fetchQualityCheckAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_QUALITY_CHECK_LODING });
        dispatch(callApiAction(
            async () => await fetchProductQcApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_QUALITY_CHECK_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}
export const fetchBatchAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_BATCH_LODING });
        dispatch(callApiAction(
            async () => await fetchBatchApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_BATCH_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}
export const deleteQualityCheckAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_QUALITY_CHECK_DELETE,
            value: { data: data, filters: filters }
        });
    }
}



export const fetchProductColorAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_PRODUCT_COLOR_LODING });
        dispatch(callApiAction(
            async () => await fetchColorApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_PRODUCT_COLOR_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteProductColorAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_PRODUCT_COLOR_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchProductTypeAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_DATA_PRODUCT_TYPE_LODING });
        dispatch(callApiAction(
            async () => await fetchTypeApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_DATA_PRODUCT_TYPE_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const fetchItemTypeAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_ITEM_TYPE_LODING });
        dispatch(callApiAction(
            async () => await fetchitemTypeApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_ITEM_TYPE_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const fetchLocationMasterAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_LOCATION_MASTER_LOADING });
        dispatch(callApiAction(
            async () => await fetchlocationMasterApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_LOCATION_MASTER_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const fetchInventoryMasterAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_INVENTORY_MASTER_LODING });
        dispatch(callApiAction(
            async () => await fetchInventoryMaster(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_INVENTORY_MASTER_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const fetchRejectionReasonAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_REJECTION_REASON_LODING });
        dispatch(callApiAction(
            async () => await fetchRejectionReasonApi(filters),
            (response) => {
                console.log("fetchRejectionReasonAction", response);

                dispatch({
                    type: actions.FETCH_REJECTION_REASON_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteProductTypeAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_DATA_PRODUCT_TYPE_DELETE,
            value: { data: data, filters: filters }
        });
    }
}

export const fetchComponentAction = (filters, onSuccess = () => { }, onError = () => { }) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.FETCH_COMPONENT_LODING });
        dispatch(callApiAction(
            async () => await fetchComponentApi(filters),
            (response) => {
                dispatch({
                    type: actions.FETCH_COMPONENT_DATA,
                    value: { data: response, filters: filters }
                });
                onSuccess(response);
            },
            (err) => {
                onError(err);
            }
        ))
    }
}

export const deleteComponentAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.FETCH_COMPONENT_DELETE,
            value: { data: data, filters: filters }
        });
    }
}
export const fetchVersionDataAction = (
    filters,
    onSuccess = () => { },
    onError = () => { }
) => {
    return async (dispatch, getState) => {
        dispatch({ type: actions.START_VERSION_LOADING });
        dispatch(
            callApiAction(
                async () => await fetchVersiones(filters),
                (response) => {
                    dispatch({
                        type: actions.SET_VERSION_DATA,
                        value: { data: response?.result, filters: filters },
                    });
                    onSuccess(response);
                },
                (err) => {
                    onError(err);
                }
            )
        );
    };
};
export const setVersionDataOnDeleteAction = (data, filters) => {
    return async (dispatch, getState) => {
        dispatch({
            type: actions.SET_VERSION_DATA_ONDELETE,
            value: { data: data, filters: filters },
        });
    };
};