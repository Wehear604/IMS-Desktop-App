import { memo, useEffect, useMemo, useState } from "react";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { closeModal } from "../../store/actions/modalAction";
import { useParams } from "react-router-dom";
import { SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { addProductApi, getProductByIdApi, updateProductApi } from "../../apis/product.api";
import { fetchProductAction, fetchQualityCheckAction } from "../../store/actions/setting.Action";
import CreateBatchUi from "./CreateBatchUi";
import moment from "moment";
import { CreateBatchApi } from "../../apis/qc.api";

const CreateBatchController = ({ callBack, id, role = null }) => {
    const validate = useValidate();
    const { settings } = useSelector((state) => state)
    const dispatch = useDispatch();
    const params = useParams();
    const modalKey = 'batch';
    const title = "Add Batch";
    const [loading, setLoading] = useState(false);
    const isRolePredefined = role !== null;
    const [fields, setFields] = useState({
        err: "",
        id,
        product_id: "",
        batch_no: "",
        quantity: null,
        date: moment().toISOString(),
        product_type_id: "",
        color_id: "",
        brand_id: "",

    });
    const [originalDocument, setOriginalDocument] = useState({});

    const validationSchemaForCreate = useMemo(
        () =>
            [
                {
                    required: true,
                    value: fields.product_id,
                    field: "Product Name",
                },
                {
                    required: true,
                    value: fields.batch_no,
                    field: "Product Batch",
                },
                {
                    required: true,
                    value: fields.quantity,
                    field: "Quantity",
                },
                {
                    required: true,
                    value: fields.date,
                    field: "Date",
                },


            ],
        [fields]
    );


    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate);

        if (validationResponse === true) {
            setLoading(true);
            setTimeout(() => {
                dispatch(fetchQualityCheckAction(settings.qualityCheck_filters))
                dispatch(closeModal("batchadd"));
                setLoading(false);
            }, [5000])
            dispatch(
                callApiAction(
                    async () => await CreateBatchApi({ ...fields }),
                    async (response) => {
                        // callBack()
                        setLoading(false);
                        dispatch(callSnackBar("Batch Added Successfully", SNACK_BAR_VARIETNS.suceess))
                        // dispatch(fetchQualityCheckAction(settings.qualityCheck_filters))
                        // dispatch(closeModal("batchadd"));
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
        createFunction();
    };

    // const fetchById = (id) => {
    //     setLoading(true);
    //     dispatch(
    //         callApiAction(
    //             async () => await getProductByIdApi({ id }),
    //             async (response) => {
    //                 setFields({ ...fields, ...response });
    //                 setOriginalDocument(response);
    //                 setLoading(false);
    //             },
    //             (err) => {
    //                 setFields({ ...fields, err });
    //                 setLoading(false);
    //             }
    //         )
    //     );
    // };

    // useEffect(() => {
    //     if (id) fetchById(id);
    // }, [id]);

    return (
        <CreateBatchUi

            isRolePredefined={isRolePredefined}
            modalKey={modalKey}
            title={title}
            isUpdate={id}
            loading={loading}
            fields={fields}
            onSubmit={onSubmit}
            setFields={setFields}
        />
    );
};
export default memo(CreateBatchController);
