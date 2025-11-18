import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import CreateSemiFinishedGoodUi from "./CreateSemiFinishedGoodUi"
import { fetchRawMaterialAction } from "../../store/actions/setting.Action"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { CreateSFGApi, getSFGByIdApi, UpdateSFGApi } from "../../apis/sfg.api"
import { useCallback } from "react"

const CreateSemiFinishedGoodController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const { settings } = useSelector((state) => state)
    const dispatch = useDispatch()
    const title = "Semi Finished Good"

    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
        sfg_Code: '',
        Description: '',
        designator: '',
        mpn: '',
        skds: [
            {
                skdId: null,
                min_of_quantity: null
            }
        ],
        rawMaterials: [
            {
                rawMaterialId: null,
                min_of_quantity: null,
                code: ""
            },
        ],
        sfg_image:""
        // items: [
        //     {
        //         itemId: "",
        //         min_of_quantity: null
        //     },
        // ],
    })

    const [originalDocument, setOriginalDocument] = useState({})

    const validationSchemaForCreate = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'SFG Name',
        },
        {
            required: true,
            value: fields.sfg_Code,
            field: 'SFG Code',
        },
        {
            required: true,
            value: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
            field: 'rawMaterials',
        },

        {
            required: true,
            value: fields.rawMaterials.every((item) => item.min_of_quantity !== null),
            field: 'Min Quantity Of SKD',
        },

    ]), [fields])



    const validationSchemaForUpdate = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'SFG Name',
        },
        {
            required: true,
            value: fields.sfg_Code,
            field: 'SFG Code',
        },
        {
            required: true,
            value: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
            field: 'SkD',
        },

        {
            required: true,
            value: fields.rawMaterials.every((item) => item.min_of_quantity !== null),
            field: 'Min Quantity Of SKD',
        },

    ]), [fields])

    console.log("fields", fields)
    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await CreateSFGApi({ ...fields }),
                    async (response) => {
                        callBack()
                        setLoading(false)
                        dispatch(
                            callSnackBar(
                                "Created Semi Finished Good Successfully",
                                SNACK_BAR_VARIETNS.suceess
                            )
                        );
                        dispatch(fetchRawMaterialAction(settings.rawMaterial_filters))
                        dispatch(closeModal("create_Semi_Finished_Good"))
                    },
                    (err) => {
                        setLoading(false)
                        setFields({ ...fields, err })
                    }
                )
            )
        } else {
            setFields({ ...fields, 'err': validationResponse })
        }
    }

    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate);
        const updatedData = { id };

        for (let field in originalDocument) {
            if (
                originalDocument[field] &&
                fields[field] &&
                fields[field] !== originalDocument[field]
            ) {
                updatedData[field] = fields[field];
            }
        }
        const processedSkd = fields?.skds?.map((entry) => ({
            ...entry,
            skdId: typeof entry.skdId === "object" ? entry.skdId._id : entry.skdId,
        }));

        // const processedItems = fields?.items?.map((entry) => ({
        //     ...entry,
        //     itemId: typeof entry.itemId === "object" ? entry.itemId._id : entry.itemId,
        // }));

        const processedrawMaterialId = fields?.rawMaterials?.map((entry) => ({
            ...entry,
            rawMaterialId: typeof entry.rawMaterialId === "object" ? entry.rawMaterialId._id : entry.rawMaterialId,
        }));
        if (validationResponse === true) {
            setLoading(true);
            dispatch(
                callApiAction(
                    async () => await UpdateSFGApi({ ...fields, skds: processedSkd, rawMaterials: processedrawMaterialId, specialMarking: fields?.specialMarking?._id ? fields?.specialMarking?._id : fields?.specialMarking }),
                    async (response) => {
                        callBack();
                        setLoading(false);
                        dispatch(
                            callSnackBar(
                                "Updated Semi Finished Good Successfully",
                                SNACK_BAR_VARIETNS.suceess
                            )
                        );
                        dispatch(closeModal("update"));
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

    const fetchById = useCallback((id) => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await getSFGByIdApi({ id }),
                async (response) => {
                    setFields((prev) => ({ ...prev, ...response }));
                    setOriginalDocument(response);
                    setLoading(false);
                },
                (err) => {
                    setFields((prev) => ({ ...prev, err }));
                    setLoading(false);
                }
            )
        );
    }, [dispatch]);

    useEffect(() => {
        if (id) fetchById(id);
    }, [id, fetchById]);


    const onSubmit = async (e) => {
        e.preventDefault()
        if (id)
            updateFunction()
        else
            createFunction()
    }

    return <CreateSemiFinishedGoodUi
        title={title}
        isUpdate={id}
        loading={loading}
        fields={fields}
        onSubmit={onSubmit}
        setFields={setFields}
        isModal={isModal}
        handleAreaModalClose={handleAreaModalClose}
    />
}
export default memo(CreateSemiFinishedGoodController)