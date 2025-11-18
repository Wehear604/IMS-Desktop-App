import { actions } from "../../utils/constants"


const initialState = {

    vender_data: {},
    vender_loading: false,
    vender_filters: {},

    rawMaterial_data: {},
    rawMaterial_loading: false,
    rawMaterial_filters: {},

    product_data: {},
    product_loading: false,
    product_filters: {},

    department_data: {},
    department_loading: false,
    department_filters: {},

    type_of_sales_data: {},
    type_of_sales_loading: false,
    type_of_sales_filters: {},

    category_data: {},
    category_loading: false,
    category_filters: {},

    productBrand_data: {},
    productBrand_loading: false,
    productBrand_filters: {},

    update_stock_product_data: {},
    update_stock_product_loading: false,
    update_stock_product_filters: {},

    update_stock_raw_material_data: {},
    update_stock_raw_material_loading: false,
    update_stock_raw_material_filters: {},

    qualityCheck_data: {},
    qualityCheck_loading: false,
    qualityCheck_filters: {},

    batch_data: {},
    batch_loading: false,
    batch_filters: {},

    productColor_data: {},
    productColor_loading: false,
    productColor_filters: {},

    productType_data: {},
    productType_loading: false,
    productType_filters: {},

    RejectionReason_data: {},
    RejectionReason_loading: false,
    RejectionReason_filters: {},

    inventoryMaster_data: {},
    inventoryMaster_loading: false,
    inventoryMaster_filters: {},

    version_data: {},
    version_loading: false,
    version_filters: {},

    locationMaster_data: {},
    locationMaster_loading: false,
    locationMaster_filters: {},
}

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.FETCH_DATA_VENDER_LODING: return { ...state, vender_loading: true, vender_data: [] };
        case actions.FETCH_DATA_VENDER_DATA: return { ...state, vender_loading: false, vender_data: action.value.data, vender_filters: action.value.filters }
        case actions.FETCH_DATA_VENDER_DELETE: return { ...state, vender_data: action.data.value, vender_filters: action.data.filters };

        case actions.FETCH_DATA_RAWMATERIAL_LODING: return { ...state, rawMaterial_loading: true, rawMaterial_data: [] };
        case actions.FETCH_DATA_RAWMATERIAL_DATA: return { ...state, rawMaterial_loading: false, rawMaterial_data: action.value.data, rawMaterial_filters: action.value.filters }
        case actions.FETCH_DATA_RAWMATERIAL_DELETE: return { ...state, rawMaterial_data: action.value, rawMaterial_filters: action.data.filters }

        case actions.FETCH_DATA_PRODUCT_LODING: return { ...state, product_loading: true, product_data: [] };
        case actions.FETCH_DATA_PRODUCT_DATA: return { ...state, product_loading: false, product_data: action.value.data, product_filters: action.value.filters }
        case actions.FETCH_DATA_PRODUCT_DELETE: return { ...state, product_data: action.value, product_filters: action.data.filters }

        case actions.FETCH_DATA_DEPARTMENT_LODING: return { ...state, department_loading: true, department_data: [] };
        case actions.FETCH_DATA_DEPARTMENT_DATA: return { ...state, department_loading: false, department_data: action.value.data, department_filters: action.value.filters }
        case actions.FETCH_DATA_DEPARTMENT_DELETE: return { ...state, department_data: action.value, department_filters: action.data.filters }

        case actions.FETCH_DATA_TYPE_OF_SALES_LODING: return { ...state, type_of_sales_loading: true, type_of_sales_data: [] };
        case actions.FETCH_DATA_TYPE_OF_SALES_DATA: return { ...state, type_of_sales_loading: false, type_of_sales_data: action.value.data, type_of_sales_filters: action.value.filters }
        case actions.FETCH_DATA_TYPE_OF_SALES_DELETE: return { ...state, type_of_sales_data: action.value, type_of_sales_filters: action.data.filters }

        case actions.FETCH_DATA_CATEGORY_LODING: return { ...state, category_loading: true, category_data: [] };
        case actions.FETCH_DATA_CATEGORY_DATA: return { ...state, category_loading: false, category_data: action.value.data, category_filters: action.value.filters }
        case actions.FETCH_DATA_CATEGORY_DELETE: return { ...state, category_data: action.value, category_filters: action.data.filters }

        case actions.FETCH_DATA_UPDATE_STOCK_PRODUCT_LODING: return { ...state, update_stock_product_loading: true, update_stock_product_data: [] };
        case actions.FETCH_DATA_UPDATE_STOCK_PRODUCT_DATA: return { ...state, update_stock_product_loading: false, update_stock_product_data: action.value.data, update_stock_product_filters: action.value.filters }
        case actions.FETCH_DATA_UPDATE_STOCK_PRODUCT_DELETE: return { ...state, update_stock_product_data: action.value, update_stock_product_filters: action.data.filters }

        case actions.FETCH_DATA_UPDATE_STOCK_RAW_MATERIAL_LODING: return { ...state, update_stock_raw_material_loading: true, update_stock_raw_material_data: [] };
        case actions.FETCH_DATA_UPDATE_STOCK_RAW_MATERIAL_DATA: return { ...state, update_stock_raw_material_loading: false, update_stock_raw_material_data: action.value.data, update_stock_raw_material_filters: action.value.filters }
        case actions.FETCH_DATA_UPDATE_STOCK_RAW_MATERIAL_DELETE: return { ...state, update_stock_raw_material_data: action.value, update_stock_raw_material_filters: action.data.filters }

        case actions.FETCH_DATA_QUALITY_CHECK_LODING: return { ...state, qualityCheck_loading: true, qualityCheck_data: [] };
        case actions.FETCH_DATA_QUALITY_CHECK_DATA: return { ...state, qualityCheck_loading: false, qualityCheck_data: action.value.data, qualityCheck_filters: action.value.filters }
        case actions.FETCH_DATA_QUALITY_CHECK_DELETE: return { ...state, qualityCheck_data: action.data.value, qualityCheck_filters: action.data.filters };

        case actions.FETCH_BATCH_LODING: return { ...state, batch_loading: true, batch_data: [] };
        case actions.FETCH_BATCH_DATA: return { ...state, batch_loading: false, batch_data: action.value.data, batch_filters: action.value.filters }
        case actions.FETCH_BATCH_DELETE: return { ...state, batch_data: action.data.value, batch_filters: action.data.filters };


        case actions.FETCH_DATA_PRODUCT_BRAND_LODING: return { ...state, productBrand_loading: true, productBrand_data: [] };
        case actions.FETCH_DATA_PRODUCT_BRAND_DATA: return { ...state, productBrand_loading: false, productBrand_data: action.value.data, productBrand_filters: action.value.filters }
        case actions.FETCH_DATA_PRODUCT_BRAND_DELETE: return { ...state, productBrand_data: action.value, productBrand_filters: action.data.filters }

        case actions.FETCH_DATA_PRODUCT_COLOR_LODING: return { ...state, productColor_loading: true, productColor_data: [] };
        case actions.FETCH_DATA_PRODUCT_COLOR_DATA: return { ...state, productColor_loading: false, productColor_data: action.value.data, productColor_filters: action.value.filters }
        case actions.FETCH_DATA_PRODUCT_COLOR_DELETE: return { ...state, productColor_data: action.value, productColor_filters: action.data.filters }

        case actions.FETCH_DATA_PRODUCT_TYPE_LODING: return { ...state, productType_loading: true, productType_data: [] };
        case actions.FETCH_DATA_PRODUCT_TYPE_DATA: return { ...state, productType_loading: false, productType_data: action.value.data, productType_filters: action.value.filters }
        case actions.FETCH_DATA_PRODUCT_TYPE_DELETE: return { ...state, productType_data: action.value, productType_filters: action.data.filters }

        case actions.FETCH_COMPONENT_LODING: return { ...state, component_loading: true, component_data: [] };
        case actions.FETCH_COMPONENT_DATA: return { ...state, component_loading: false, component_data: action.value.data, component_filters: action.value.filters }
        case actions.FETCH_COMPONENT_DELETE: return { ...state, component_data: action.value, component_filters: action.data.filters }

        case actions.FETCH_ITEM_TYPE_LODING: return { ...state, itemType_loading: true, itemType_data: [] };
        case actions.FETCH_ITEM_TYPE_DATA: return { ...state, itemType_loading: false, itemType_data: action.value.data, itemType_filters: action.value.filters }
        case actions.FETCH_ITEM_TYPE_DELETE: return { ...state, itemType_data: action.value, itemType_filters: action.data.filters }

        case actions.FETCH_LOCATION_MASTER_LODING: return { ...state, locationMaster_loading: true, locationMaster_data: [] };
        case actions.FETCH_LOCATION_MASTER_DATA: return { ...state, locationMaster_loading: false, locationMaster_data: action.value.data, locationMaster_filters: action.value.filters }
        case actions.FETCH_LOCATION_MASTER_DELETE: return { ...state, locationMaster_data: action.value, locationMaster_filters: action.data.filters }

        case actions.FETCH_REJECTION_REASON_LODING: return { ...state, RejectionReason_loading: true, RejectionReason_data: [] };
        case actions.FETCH_REJECTION_REASON_DATA: return { ...state, RejectionReason_loading: false, RejectionReason_data: action.value.data, RejectionReason_filters: action.value.filters }
        case actions.FETCH_REJECTION_REASON_DELETE: return { ...state, RejectionReason_data: action.value, RejectionReason_filters: action.data.filters }

        case actions.FETCH_INVENTORY_MASTER_LODING: return { ...state, inventoryMaster_loading: true, inventoryMaster_data: [] };
        case actions.FETCH_INVENTORY_MASTER_DATA: return { ...state, inventoryMaster_loading: false, inventoryMaster_data: action.value.data, inventoryMaster_filters: action.value.filters }
        case actions.FETCH_INVENTORY_MASTER_DELETE: return { ...state, inventoryMaster_data: action.value, inventoryMaster_filters: action.data.filters }

        case actions.SET_VERSION_DATA: return { ...state, version_loading: false, version_data: action.value.data, version_filters: action.value.filters }
        case actions.START_VERSION_LOADING: return { ...state, version_loading: true, version_data: [] }
        case actions.SET_VERSION_DATA_ONDELETE: return { ...state, version_data: action.value, version_filters: action.data.filters }

        default:
            return { ...state }
    }
}

export default settingsReducer