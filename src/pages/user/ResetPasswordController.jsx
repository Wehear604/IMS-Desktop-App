import { memo, useMemo, useState } from "react"
import useValidate from "../../store/hooks/useValidator"
import { useDispatch } from 'react-redux'
import { callApiAction } from "../../store/actions/commonAction"
import { userResetPasswordApi } from "../../apis/user.api"
import { closeModal } from "../../store/actions/modalAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import ResetPasswordUi from "./ResetPasswordUi"
import { callSnackBar } from "../../store/actions/snackbarAction"

const ResetPasswordController = ({ callBack, id }) => {
    const validate = useValidate()
    const dispatch = useDispatch()

    const title = "Reset Password"

    const updateApi = userResetPasswordApi


    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        password: '',
    })

    const validationSchemaForUpdate = useMemo(() => ([

        {
            required: true,
            value: fields.password,
            field: 'Password',
        }
    ]), [fields])


    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate)
        let updatedData = { id, password: fields.password }

        if (validationResponse === true) {

            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await updateApi(updatedData),
                    async (response) => {

                        await callBack(response, updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Password Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal())
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
        updateFunction()

    }

    return <ResetPasswordUi title={title} loading={loading} fields={fields} onSubmit={onSubmit} setFields={setFields} />
}
export default memo(ResetPasswordController)