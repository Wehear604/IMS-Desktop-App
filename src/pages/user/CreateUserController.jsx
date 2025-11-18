import { memo, useEffect, useMemo, useState } from "react"
import useValidate from "../../store/hooks/useValidator"
import { useDispatch, useSelector } from 'react-redux'
import { callApiAction } from "../../store/actions/commonAction"
import { closeModal } from "../../store/actions/modalAction"
import { SNACK_BAR_VARIETNS, SOFTWARE_ACCESS, USER_ROLES } from "../../utils/constants"
import { createUserApi, fetchUserByIdApi, userUpdateApi } from "../../apis/user.api"
import CreateUserUi from "./CreateUserUi"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { useCallback } from "react"

const CreateUserController = ({ callBack, id }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state)

    const title = "User "
    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
        email: '',
        phone: null,
        password: '',
        role: null,
        inventory: "",
        softwareAccess: [SOFTWARE_ACCESS.IMS],

    })
    const [originalDocument, setOriginalDocument] = useState({


    })


    const validationSchemaForCreate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Name',
        },

        {
            required: true,
            value: fields.email,
            field: 'Email',
            isEmail: true,
        },
        {
            required: true,
            value: fields.phone,
            field: 'Phone no ',
        },
        {
            required: true,
            value: fields.password,
            field: 'Password',
        },

        {
            required: true,
            value: fields.role,
            field: 'Role',
        },

        {
            required: fields.role === USER_ROLES.ADMIN ? false : true,
            value: fields.inventory,
            field: 'Inventory',
        },



    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Name',
        },
        {
            required: true,
            value: fields.phone,
            field: 'Phone no ',
        },

        {
            required: true,
            value: fields.role,
            field: 'Role',
        },

        {
            required: fields.role === USER_ROLES.ADMIN ? false : true,
            value: fields.inventory,
            field: 'Inventory',
        },

    ]), [fields])



    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createUserApi(fields),
                    async (response) => {

                        await callBack(response)
                        setLoading(false)
                        dispatch(callSnackBar("User Created Successfully", SNACK_BAR_VARIETNS.suceess))
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


    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate)
        let updatedData = { id }
        for (let field in fields) {

            if (originalDocument[field] && fields[field] && fields[field] !== originalDocument[field]) {
                updatedData[field] = fields[field]
            }
            if (!originalDocument[field]) {
                updatedData[field] = fields[field]
            }
        }
        updatedData['mail_pass'] = fields['mail_pass']
        updatedData['phone'] = fields['phone']

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await userUpdateApi(updatedData),
                    async (response) => {
                        await callBack(response, updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("User Updated Successfully", SNACK_BAR_VARIETNS.suceess))
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
        if (id)
            updateFunction()
        else
            createFunction()

    }

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await fetchUserByIdApi({ id }),
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


    return <CreateUserUi title={title} isUpdate={id} loading={loading} fields={fields} onSubmit={onSubmit} setFields={setFields} />
}
export default memo(CreateUserController)