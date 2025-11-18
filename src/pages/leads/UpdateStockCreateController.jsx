import { memo, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useValidate from "../../store/hooks/useValidator";
import { callApiAction } from "../../store/actions/commonAction";
import { closeModal } from "../../store/actions/modalAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { AddInOutProductStock, AddInOutRawMaterialStock } from "../../apis/leads.api";
import moment from "moment";
import UpdateStockCreateUi from "./UpdateStockCreateUi";
import { fetchUpdateStockProductAction, fetchUpdateStockRawMaterialAction } from "../../store/actions/setting.Action";

const UpdateStockCreateController = ({ callBack, id, role = null }) => {
    const validate = useValidate();
    const dispatch = useDispatch();
    const title = "Raw Material";
    const { settings } = useSelector((state) => state)


    const [loading, setLoading] = useState(false);
    const [createType, setCreateType] = useState({});
    const isRolePredefined = role !== null;

    const [fields, setFields] = useState({
        err: "",
        id,
        date:moment(),
        rawMaterialId:"",
        product_id:'',
        amount: "",
        vendor: "",
        quantity:'',
        departmentId: "",
        categoryId:"",
        typeof_sale:null
    });
    console.log("date", fields.date )

    const validationSchemaForRawMaterialCreate = useMemo(
        () =>
            [
                {
                    required: true,
                    value: fields.date,
                    field: "Date",
                },
                {
                    required: true,
                    value: fields.product_id,
                    field: "Product Id",
                },

                
                {
                    required: false,
                    value: fields.amount,
                    field: "Price",
                },
                {
                    required: true,
                    value: fields.logType,
                    field: "log Type",
                },
                {
                    required: false,
                    value: fields.vendor,
                    field: "Vendor Name",
                },
                {
                    required: true,
                    value: fields.categoryId,
                    field:"Category"
                },
                {
                    required: true,
                    value: fields.departmentId,
                    field: "Department Id",
                },
                {
                    required: true,
                    value: fields.rawMaterialId,
                    field: "rawMaterial Id",
                },
                {
                    required: true,
                    value: fields.quantity,
                    field: "Quantity",
                }
            ],
        [fields]
    );

    const validationSchemaForProductCreate = useMemo(
        () =>
            [
                {
                    required: true,
                    value: fields.date,
                    field: "Date",
                },
                {
                    required: true,
                    value: fields.categoryId,
                    field:"Category"
                },
                {
                    required: true,
                    value: fields.product_id,
                    field: "Product Id",
                },

                
                {
                    required: false,
                    value: fields.amount,
                    field: "Price",
                },
                {
                    required: true,
                    value: fields.logType,
                    field: "log Type",
                },
                {
                    required: false,
                    value: fields.vendor,
                    field: "Vendor Name",
                },
                {
                    required: true,
                    value: fields.departmentId,
                    field: "Department Id",
                },
                                {
                    required: true,
                    value: fields.quantity,
                    field: "Quantity",
                }
            ],
        [fields]
    );
  
    const createRawMaterialFunction = async () => {
        const validationResponse = validate(validationSchemaForRawMaterialCreate);

        if (validationResponse === true) {
            setLoading(true);
            dispatch(
                callApiAction(
                    async () => await AddInOutRawMaterialStock({ ...fields }),
                    async (response) => {
                        setLoading(false);
                        dispatch(callSnackBar("Raw Material Stock Added Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchUpdateStockRawMaterialAction(settings.update_stock_raw_material_filters))
                        dispatch(closeModal('CloseTheModal'));
                    },
                    (err) => {
                        setLoading(false);
                        setFields({ ...fields, err });
                    }
                )
            );
        } else {
            setFields({ ...fields, err: validationResponse });
        }
    };

    const createProductFunction = async () => {
        const validationResponse = validate(validationSchemaForProductCreate);

        if (validationResponse === true) {
            setLoading(true);
            dispatch(
                callApiAction(
                    async () => await AddInOutProductStock({ ...fields }),
                    async (response) => {
                        setLoading(false);
                        dispatch(callSnackBar("Product Stock Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchUpdateStockProductAction(settings.update_stock_product_filters))
                        dispatch(closeModal('CloseTheModal'));
                    },
                    (err) => {
                        setLoading(false);
                        setFields({ ...fields, err });
                    }
                )
            );
        } else {
            setFields({ ...fields, err: validationResponse });
        }
    };


    const onSubmit = async (e) => {
        e.preventDefault();
        if (createType === 'isRawMaterial') {
         createRawMaterialFunction()
        } else {
            createProductFunction()
        }
        
    };

 
    return (
        <UpdateStockCreateUi

            isRolePredefined={isRolePredefined}
            title={title}
            isUpdate={id}
            loading={loading}
            fields={fields}
            setFields={setFields}
            onSubmit={onSubmit}
            createType={createType}
            setCreateType={setCreateType}
       
        />
    );
};
export default memo(UpdateStockCreateController);
