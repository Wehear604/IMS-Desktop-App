import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import TypeOfSalesCreateUi from "./TypeOfSalesCreateUi"
import { createTypeofSales, getTypeofSalesByIdApi, updateTypeofSales } from "../../apis/typeofsale.api"
import { fetchTypeOfSalesAction } from "../../store/actions/setting.Action"
import { useCallback } from "react"

const TypeOfSalesCreateController = ({callBack=() => {}, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const { settings } = useSelector((state) => state)
    const title = "Type Of Sales"

    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        type: '',

    })
  
    const [originalDocument, setOriginalDocument] = useState({})


    const validationSchemaForCreate = useMemo(() => ([

        {
            required: true,
            value: fields.type,
            field: 'Type Of Sales',
        }
    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([

        {
            required: true,
            value: fields.type,
            field: 'Type Of Sales',
        }
    ]), [fields])


    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createTypeofSales(fields),
                    async (response) => {

                        await callBack(response)
                        setLoading(false)
                        dispatch(fetchTypeOfSalesAction(settings.type_of_sales_filters))
                        dispatch(closeModal("createtypofsales"))
                        dispatch(callSnackBar("Type Created Successfully", SNACK_BAR_VARIETNS.suceess))
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
                    async () => await updateTypeofSales(updatedData),
                    async (response) => {
                        
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Type Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchTypeOfSalesAction(settings.type_of_sales_filters))
                        !isModal && dispatch(closeModal("updatetypofsales"))
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
                async () => await getTypeofSalesByIdApi( {id} ),
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



    return <TypeOfSalesCreateUi
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
export default memo(TypeOfSalesCreateController)