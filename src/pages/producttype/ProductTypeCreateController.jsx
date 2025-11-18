import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchProductTypeAction } from "../../store/actions/setting.Action"
import ProductTypeCreateUi from "./ProductTypeCreateUi"
import { createTypeApi, getTypeByIdApi, updateTypeApi } from "../../apis/productType.api"
import { useCallback } from "react"

const ProductTypeCreateController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Product Type"

    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)


    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
        brand:""
    })

    const [originalDocument, setOriginalDocument] = useState({})


    const validationSchemaForCreate = useMemo(() => ([
        {
            required: true,
            value: fields.brand,
            field: 'Brand',
        },
        {
            required: true,
            value: fields.name,
            field: 'Type',
        }
    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([
        {
            required: true,
            value: fields.brand,
            field: 'Brand',
        },
        {
            required: true,
            value: fields.name,
            field: 'Type Name',
        }
    ]), [fields])


    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createTypeApi(fields),
                    async (response) => {
                        setLoading(false)
                        dispatch(callSnackBar("Product Type Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchProductTypeAction(settings.productType_filters))
                        dispatch(closeModal("department"))
                    },
                    (err) => {
                        setLoading(false)
                        setFields({ ...fields, err })

                        dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
                    }

                )
            )
        } else {
            setFields({ ...fields, 'err': validationResponse })
        }
    }

    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate)
       const data = { id, name: fields?.name, brand: fields?.brand?._id ? fields.brand?._id : fields?.brand }
        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await updateTypeApi(data),
                    async (response) => {
                        await callBack(data)
                        setLoading(false)
                        dispatch(callSnackBar("Product Type Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("delete"))
                        dispatch(fetchProductTypeAction(settings.productType_filters))
                        isModal && handleAreaModalClose()
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



    const onSubmit = async (e) => {
        e.preventDefault()
        if (id)
            updateFunction()
        else
            createFunction()
    }



    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await getTypeByIdApi({ id }),
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
        if (id)
            fetchById(id)

    }, [id, fetchById])


    return <ProductTypeCreateUi
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
export default memo(ProductTypeCreateController)