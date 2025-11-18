import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState, useCallback } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchItemTypeAction } from "../../store/actions/setting.Action"
import { createItemTypeApi, getitemTypeByIdApi, updateitemTypeApi } from "../../apis/itemType.api"
import ItemTypeCreateUi from "./itemTypeCreateUi"

const ItemTypeCreateController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Item Type"
    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
    })

    const [originalDocument, setOriginalDocument] = useState({})

    const validationSchema = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'Item Type',
        }
    ]), [fields])

    const createFunction = async () => {
        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createItemTypeApi(fields),
                    async () => {
                        setLoading(false)
                        dispatch(callSnackBar("Item Type Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchItemTypeAction(settings.itemType_filters))
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
            setFields({ ...fields, err: validationResponse })
        }
    }

    const updateFunction = async () => {
        const validationResponse = validate(validationSchema)
        const updatedData = { id }

        for (let field in originalDocument) {
            if (originalDocument[field] && fields[field] && fields[field] !== originalDocument[field]) {
                updatedData[field] = fields[field]
            }
        }

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await updateitemTypeApi(updatedData),
                    async () => {
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Item Type Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("delete"))
                        dispatch(fetchItemTypeAction(settings.itemType_filters))
                        if (isModal) handleAreaModalClose()
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

    const onSubmit = async (e) => {
        e.preventDefault()
        if (id) updateFunction()
        else createFunction()
    }

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await getitemTypeByIdApi({ id }),
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

    return <ItemTypeCreateUi
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

export default memo(ItemTypeCreateController)
