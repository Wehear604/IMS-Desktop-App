import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchProductColorAction } from "../../store/actions/setting.Action"
import ProductColorCreateUi from "./ProductColorCreateUi"
import { createColorApi, getColorByIdApi, updateColorApi } from "../../apis/productColor.api"
import { useCallback } from "react"

const ProductColorCreateController = ({callBack=() => {}, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Product Color"

    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)


    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',

    })
  
    const [originalDocument, setOriginalDocument] = useState({})


    const validationSchemaForCreate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Product Color',
        }
    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Product Color Name',
        }
    ]), [fields])


    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createColorApi(fields),
                    async (response) => {

                        setLoading(false)
                        dispatch(callSnackBar("Product Color Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchProductColorAction(settings.productColor_filters))
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
        const updatedData = ({ id })
        
        for (let field in originalDocument) {
            
            if (originalDocument[field] && fields[field] && fields[field] !== originalDocument[field]) {
                updatedData[field] = fields[field]
            }
        }

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await updateColorApi(updatedData),
                    async (response) => {
                        
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Product Brand Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("delete"))
                        dispatch(fetchProductColorAction(settings.productColor_filters))
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
                async () => await getColorByIdApi( {id} ),
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


    return <ProductColorCreateUi
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
export default memo(ProductColorCreateController)