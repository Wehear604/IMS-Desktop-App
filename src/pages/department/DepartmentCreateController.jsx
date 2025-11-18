import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState, useCallback } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import DepartmentCreateUi from "./DepartmentCreateUi"
import { createDepartment, updateDepartment, getDepartmentByIdApi } from "../../apis/department.api"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchDepartmentAction } from "../../store/actions/setting.Action"

const DepartmentCreateController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Department"

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
            field: 'Department Name',
        }
    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'Department Name',
        }
    ]), [fields])

    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createDepartment(fields),
                    async (response) => {
                        setLoading(false)
                        dispatch(callSnackBar("Department Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(fetchDepartmentAction(settings.department_filters))
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
                    async () => await updateDepartment(updatedData),
                    async (response) => {
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Department Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("UpdateDepartment"))
                        dispatch(fetchDepartmentAction(settings.department_filters))
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
        if (id) updateFunction()
        else createFunction()
    }

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await getDepartmentByIdApi({ id }),
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

    return <DepartmentCreateUi
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

export default memo(DepartmentCreateController)
