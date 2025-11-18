import { useMemo, useState } from "react"
import useValidate from "../../store/hooks/useValidator"
import { useDispatch } from 'react-redux'
import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"
import SignUpUi from "./SignUpUi"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { callApiAction } from "../../store/actions/commonAction"
import { signUpApi } from "../../apis/auth.api"
const SignUpController = () => {


    const dispatch = useDispatch()
    const validate = useValidate()

    const [loading, setLoading] = useState(false)



    const [state, setState] = useState({
        name: "",
        phone: "",
        email: "",
        err: "",
        password: ""
    })

    const validationSchema = useMemo(() => ([
        {
            required: true,
            value: state.name,
            field: 'Name',

        },
        {
            required: true,
            value: state.email,
            field: 'Email',
            isEmail: true,
        },
        {
            required: true,
            value: state.password,
            field: 'Password',
        },
        {
            required: true,
            value: state.phone,
            field: 'Phone No.',

        }
    ]), [state])

    const navigate = useNavigate()
    const onSubmit = async (e) => {
        e.preventDefault()

        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await signUpApi(state),
                    async (response) => {
                        dispatch(callSnackBar("You Signedup Successfully", SNACK_BAR_VARIETNS.suceess))
                        navigate('/sign-in', { replace: true })
                        setLoading(false)

                    },
                    (err) => {
                        setState({ ...state, err })
                        setLoading(false)

                    }
                )
            )
        } else {
            setState({ ...state, 'err': validationResponse })

        }
    }



    return <SignUpUi state={state} setState={setState} onSubmit={onSubmit} loading={loading} />
}
export default SignUpController