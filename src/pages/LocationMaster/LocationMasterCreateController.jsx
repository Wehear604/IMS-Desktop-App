import { useDispatch, useSelector } from "react-redux"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState, useCallback } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchInventoryMasterAction } from "../../store/actions/setting.Action"
import LocationMasterCreateUi from "./LocationMasterCreateUi"
import useValidate from "../../store/hooks/useValidator"
import { CreateSpecialMarkingApi, getSpecialMarkingByIdApi, UpdateSpecialMarkingApi } from "../../apis/SpecialMarking.api"
import { createlocationMasterApi, getlocationMasterByIdApi, updatelocationMasterApi } from "../../apis/locationMaster.api"

const LocationMasterCreateController = ({ callBack = () => { }, id, isModal, }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Location Master"
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
            field: 'Special Marking Name',
        }
    ]), [fields])

    const createFunction = async () => {
        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createlocationMasterApi(fields),
                    async () => {
                        setLoading(false)
                        callBack()
                        dispatch(callSnackBar("Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal("Create"))
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
                    async () => await updatelocationMasterApi(updatedData),
                    async () => {
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal("Update"))
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
                async () => await getlocationMasterByIdApi({ id }),
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

    console.log("first isUpdate", id)

    return <LocationMasterCreateUi
        title={title}
        isUpdate={id}
        loading={loading}
        fields={fields}
        onSubmit={onSubmit}
        setFields={setFields}
        isModal={isModal}
    />
}

export default memo(LocationMasterCreateController)
