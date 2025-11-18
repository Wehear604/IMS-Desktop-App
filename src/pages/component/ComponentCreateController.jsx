import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchComponentAction } from "../../store/actions/setting.Action"
import { createComponentApi, getComponentByIdApi, updateComponentApi } from "../../apis/component.api"
import ComponentCreateUi from "./ComponentCreateUi"

const ComponentCreateController = ({ callBack = () => {}, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Component"

    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
    })

    const [originalDocument, setOriginalDocument] = useState({})

    const validationSchema = useMemo(() => [
        {
            required: true,
            value: fields.name,
            field: 'Component Name',
        }
    ], [fields.name])

    const createFunction = async () => {
        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    () => createComponentApi(fields),
                    async (response) => {
                        setLoading(false)
                        dispatch(callSnackBar("Component Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchComponentAction(settings.component_filters))
                        dispatch(closeModal("department"))
                    },
                    (err) => {
                        setLoading(false)
                        setFields(prev => ({ ...prev, err }))
                        dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
                    }
                )
            )
        } else {
            setFields(prev => ({ ...prev, err: validationResponse }))
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
                    () => updateComponentApi(updatedData),
                    async (response) => {
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Component Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("delete"))
                        dispatch(fetchComponentAction(settings.component_filters))
                        isModal && handleAreaModalClose()
                    },
                    (err) => {
                        setLoading(false)
                        setFields(prev => ({ ...prev, err }))
                    }
                )
            )
        } else {
            setFields(prev => ({ ...prev, err: validationResponse }))
        }
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (id) updateFunction()
        else createFunction()
    }

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                () => getComponentByIdApi({ id }),
                (response) => {
                    setFields(prev => ({ ...prev, ...response }))
                    setOriginalDocument(response)
                    setLoading(false)
                },
                (err) => {
                    setFields(prev => ({ ...prev, err }))
                    setLoading(false)
                }
            )
        )
    }, [dispatch])

    useEffect(() => {
        if (id) fetchById(id)
    }, [id, fetchById])

    return (
        <ComponentCreateUi
            title={title}
            isUpdate={id}
            loading={loading}
            fields={fields}
            onSubmit={onSubmit}
            setFields={setFields}
            isModal={isModal}
            handleAreaModalClose={handleAreaModalClose}
        />
    )
}

export default memo(ComponentCreateController)
