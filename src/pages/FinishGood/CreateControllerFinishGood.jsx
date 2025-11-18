import { useDispatch } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState, useCallback } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import CreateFinishGoodUI from "./CreateFinishGoodUI"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { CreateFGApi, getFGByIdApi, UpdateFGApi } from "../../apis/FG.api"

const CreateControllerFinishGood = ({ callBack = () => { }, id, isModal }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Finished Good"

    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
        fg_Code: '',
        sfg: [
            {
                sfgId: "",
                min_of_quantity: null,
            }
        ],
        // items: [
        //     {
        //         itemId: "",
        //         min_of_quantity: null,
        //         code: "",
        //     },
        // ],
        rawMaterials: [
            {
                rawMaterialId: null,
                min_of_quantity: 0,
                code: ""
            },
        ],
        skds: [
            {
                skdId: null,
                min_of_quantity: null
            }
        ],
        description: "",
        lead_time: "",
        product_price: "",
        product_type: "",
        product_color: "",
        product_brand: "",
        role: 'Day',
        product_image: "",
        country_category: "",
    })

    const [originalDocument, setOriginalDocument] = useState({})

    const validationSchemaForCreate = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'Finished Good Name',
        },
        {
            required: true,
            value: fields.fg_Code,
            field: 'Finished Good Code',
        },

        {
            required: true,
            value: fields.product_type,
            field: "Finished Good Type",
        },
        {
            required: true,
            value: fields.product_color,
            field: "Finished Good Color",
        },
        {
            required: true,
            value: fields.product_brand,
            field: "Finished Good Brand",
        },

        {
            required: false,
            value: fields.product_price,
            field: "Finished Good Price",
        },

        // {
        //     required: true,
        //     value: fields.sfg.every((item) => item.sfgId !== ""),
        //     field: 'SFG',
        // },

        // {
        //     required: true,
        //     value: fields.sfg.every((item) => item.min_of_quantity !== null),
        //     field: 'Min Quantity Of SFG',
        // },
        // {
        //     required: true,
        //     value: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
        //     field: 'rawMaterials',
        // },

        // {
        //     required: true,
        //     value: fields.rawMaterials.every((item) => item.min_of_quantity !== null),
        //     field: 'Min Quantity Of SKD',
        // },
        // {
        //     required: true,
        //     value: fields.description,
        //     field: 'Description',
        // },
        // {
        //     required: true,
        //     value: fields.country_category,
        //     field: 'Country Category',
        // },
        // {
        //     required: true,
        //     value: fields.product_image,
        //     field: 'Product Image',
        // },

    ]), [fields])



    const validationSchemaForUpdate = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'Finished Good Name',
        },
        {
            required: true,
            value: fields.fg_Code,
            field: 'Finished Good Code',
        },
        {
            required: true,
            value: fields.product_type,
            field: "Finished Good Type",
        },
        {
            required: true,
            value: fields.product_color,
            field: "Finished Good Color",
        },
        {
            required: true,
            value: fields.product_brand,
            field: "Finished Good Brand",
        },
        {
            required: false,
            value: fields.product_price,
            field: "Finished Good Price",
        },
        {
            required: true,
            value: fields.sfg.every((item) => item.sfgId !== ""),
            field: 'SFG',
        },
        {
            required: true,
            value: fields.sfg.every((item) => item.min_of_quantity !== null),
            field: 'Min Quantity Of SFG',
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
        // {
        //     required: true,
        //     value: fields.product_image,
        //     field: 'Product Image',
        // },


    ]), [fields])

    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)
        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await CreateFGApi({ ...fields, product_brand: fields?.product_brand?._id }),
                    async (response) => {
                        callBack()
                        setLoading(false)
                        dispatch(callSnackBar("Created Finished Good Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal("create_Finished_Good"))
                    },
                    (err) => {
                        setLoading(false)
                        setFields({ ...fields, err })
                    }
                )
            )
        } else {
            setFields({ ...fields, err: validationResponse })
        }
    }

    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate)
        const updatedData = { id }

        for (let field in originalDocument) {
            if (originalDocument[field] && fields[field] && fields[field] !== originalDocument[field]) {
                updatedData[field] = fields[field]
            }
        }
        const processedsfg = fields?.sfg?.map((entry) => ({
            ...entry,
            sfgId: typeof entry.sfgId === "object" ? entry.sfgId._id : entry.sfgId,
        }));

        // const processedItems = fields?.items?.map((entry) => ({
        //     ...entry,
        //     itemId: typeof entry.itemId === "object" ? entry.itemId._id : entry.itemId,
        // }));
        const processedRawMaterials = fields?.rawMaterials?.map((entry) => ({
            ...entry,
            rawMaterialId: typeof entry.rawMaterialId === "object" ? entry.rawMaterialId._id : entry.rawMaterialId,
        }));
        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await UpdateFGApi({ ...fields, product_type: fields?.product_type?._id? fields?.product_type?._id: fields?.product_type, rawMaterials: processedRawMaterials, sfg: processedsfg, specialMarking: fields?.specialMarking?._id ? fields?.specialMarking?._id : fields?.specialMarking }),
                    async (response) => {
                        callBack(response, updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Updated Finished Good Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal("update"))
                    },
                    (err) => {
                        setLoading(false)
                        setFields({ ...fields, err })
                    }
                )
            )
        } else {
            setFields({ ...fields, err: validationResponse })
        }
    }

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await getFGByIdApi({ id }),
                async (response) => {
                    setFields((prev) => ({ ...prev, ...response }))
                    setOriginalDocument(response)
                    setLoading(false)
                },
                (err) => {
                    setFields((prev) => ({ ...prev, err }))
                    setLoading(false)
                }
            )
        )
    }, [dispatch])

    useEffect(() => {
        if (id) fetchById(id)
    }, [id, fetchById])

    const onSubmit = async (e) => {
        e.preventDefault()
        if (id) updateFunction()
        else createFunction()
    }

    return <CreateFinishGoodUI
        title={title}
        isUpdate={id}
        loading={loading}
        fields={fields}
        onSubmit={onSubmit}
        setFields={setFields}
        isModal={isModal}
    />
}

export default memo(CreateControllerFinishGood)
