import { useMemo, useState } from "react"
import useValidate from "../../store/hooks/useValidator"

import SignInUI from "./SignInUi"
import { useDispatch } from 'react-redux'
import { signInAction } from "../../store/actions/userReducerAction"

import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"
const SignInController = () => {

    const { enqueueSnackbar } = useSnackbar();

    const dispatch = useDispatch()
    const validate = useValidate()

    const [loading, setLoading] = useState(false)



    const [state, setState] = useState({
        email: "",
        err: "",
        password: ""
    })

    const validationSchema = useMemo(() => ([
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
        }
    ]), [state])

    const navigate = useNavigate()
    
    const onSubmit = async (e) => {
        e.preventDefault()

        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)

            dispatch(
                signInAction(
                  state,
                  (err) => {
                    setState({ ...state, err });
                    setLoading(false);
                  },
                  () => {
                    enqueueSnackbar("Signed in Successfully", { variant: "success" });
                    navigate("/");
                  }
                )
              );
        } else {
            setState({ ...state, err: validationResponse })
        }
    }



    return <SignInUI state={state} setState={setState} onSubmit={onSubmit} loading={loading} />
}
export default SignInController