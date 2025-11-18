import { memo, useEffect, useMemo, useState } from "react";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { closeModal } from "../../store/actions/modalAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import CreateProductUi from "./CreateProductUi";
import { addProductApi, getProductByIdApi, updateProductApi } from "../../apis/product.api";
import { fetchProductAction } from "../../store/actions/setting.Action";

const CreateProductController = ({ callBack, id, role = null }) => {
    const validate = useValidate();
    const { settings } = useSelector((state) => state)
    const dispatch = useDispatch();
    const modalKey = 'product';
    const title = "Product";
    const [loading, setLoading] = useState(false);
    const isRolePredefined = role !== null;
    const [fields, setFields] = useState({
        err: "",
        id,
        product_name: "",
        product_code: "",
        requiredRawMaterials: [
            {
                rawMaterialId: "",
                quantity: "",
                rawMaterialName: "",
            }
        ],
        lead_time: "",
        product_price: "",
        product_type: "",
        product_color: "",
        product_brand: "",
        department: "",
        current_stock: "",
    });
    const [originalDocument, setOriginalDocument] = useState({});

    const validationSchemaForCreate = useMemo(
        () =>
            [
                {
                    required: true,
                    value: fields.product_name,
                    field: "Product Name",
                },
                {
                    required: true,
                    value: fields.product_code,
                    field: "Product Code",
                },
                {
                    required: true,
                    value: fields.lead_time,
                    field: "Lead Time",
                },
                {
                    required: true,
                    value: fields.product_price,
                    field: "Product Price",
                },

                {
                    required: true,
                    value: fields.department,
                    field: "Department",
                },

                {
                    required: true,
                    value: fields.product_type,
                    field: "Product Type",
                },
                {
                    required: true,
                    value: fields.product_color,
                    field: "Product Color",
                },
                {
                    required: true,
                    value: fields.product_brand,
                    field: "Product Brand",
                },


                {
                    required: true,
                    value: fields.current_stock,
                    field: "Current Stock",
                },
            ],
        [fields]
    );

    const validationSchemaForUpdate = useMemo(
        () =>
            [
                {
                    required: true,
                    value: fields.product_name,
                    field: "Product Name",
                },
                {
                    required: true,
                    value: fields.product_code,
                    field: "Product Code",
                },
                {
                    required: true,
                    value: fields.lead_time,
                    field: "Lead Time",
                },
                {
                    required: true,
                    value: fields.product_price,
                    field: "Product Price",
                },

                {
                    required: true,
                    value: fields.department,
                    field: "Department",
                },

            ],
        [fields]
    );

    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate);

        if (validationResponse === true) {
            setLoading(true);
            dispatch(
                callApiAction(
                    async () => await addProductApi({ ...fields, lead_time: fields.role === 'day' ? fields.lead_time : 7 * fields.lead_time }),
                    async (response) => {
                        setLoading(false);
                        dispatch(callSnackBar("Product Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchProductAction(settings.product_filters))
                        dispatch(closeModal(modalKey));
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

    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate)
        const updatedData = ({ id })

        for (let field in originalDocument) {

            if (originalDocument[field] && fields[field] && fields[field] != originalDocument[field]) {
                updatedData[field] = fields[field]
            }
        }

        if (validationResponse === true) {
            setLoading(true);
            dispatch(
                callApiAction(
                    async () => await updateProductApi(updatedData),
                    async (response) => {
                        setLoading(false);
                        dispatch(callSnackBar("Product Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchProductAction(settings.product_filters))
                        dispatch(closeModal("productupdate"));
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
        if (id) updateFunction();
        else createFunction();
    };

    const fetchById = (id) => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await getProductByIdApi({ id }),
                async (response) => {
                    setFields({ ...fields, ...response });
                    setOriginalDocument(response);
                    setLoading(false);
                },
                (err) => {
                    setFields({ ...fields, err });
                    setLoading(false);
                }
            )
        );
    };

    useEffect(() => {
        if (id) fetchById(id);
    }, [id]);

    return (
        <CreateProductUi

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
export default memo(CreateProductController);
