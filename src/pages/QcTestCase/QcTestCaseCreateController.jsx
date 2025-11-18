import { memo, useEffect, useMemo, useState } from "react"
import useValidate from "../../store/hooks/useValidator"
import { useDispatch, useSelector } from 'react-redux'
import { callApiAction } from "../../store/actions/commonAction"
import { closeModal } from "../../store/actions/modalAction"
import { CATEGORY, SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants"
import { callSnackBar } from "../../store/actions/snackbarAction"
import QcTestCaseCreateUi from "./QcTestCaseCreateUi"
import { CreateQcTestCaseApi, fetchQcTestCaseByIdApi, updateQcTestCaseApi } from "../../apis/qcTestCase.api"

const QcTestCaseCreateController = ({ callBack=()=>{} , id,  }) => {
    
    const validate = useValidate()
    const dispatch = useDispatch()

    const title =  "Create Qc Test Case"
    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
        category: '',
        test_case_band: '',
        test_case_hearing_add_left:"",
        test_case_hearing_add_right:"",
        test_case_hearing_aid:"",
        product_id:[],
    })
    const [originalDocument, setOriginalDocument] = useState({})


    const validationSchemaForCreate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Name',
        },
        
        {
            required: true,
            value: fields.category,
            field: 'Hearing Category',
        },
        {
            required: fields.category == CATEGORY.HEARING_BAND ? true : false,
            value: fields.test_case_band,
            field: 'Select Test Case For Hearing Band',
        },
        {
            required: fields.category == CATEGORY.HEARING_AID ? true : false,
            value: fields.test_case_hearing_aid,
            field: 'Select Test Case For Hearing Aid',
        },
        {
            required: true,
            value: fields.product_id,
            field: 'Product',
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
            value: fields.category,
            field: 'Hearing Category',
        },
        {
            required: fields.category == CATEGORY.HEARING_BAND ? true : false,
            value: fields.test_case_band,
            field: 'Select Test Case For Hearing Band',
        },
       
        {
            required: fields.category == CATEGORY.HEARING_AID ? true : false,
            value: fields.test_case_hearing_aid,
            field: 'Select Test Case For Hearing Aid',
        },
        {
            required: true,
            value: fields.product_id,
            field: 'Product',
        },

    ]), [fields])



    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await CreateQcTestCaseApi({...fields}),
                    async (response) => {
                        setLoading(false)
                        dispatch(closeModal("qc-test-case"))
                        dispatch(callSnackBar("Qc Test Case Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        callBack()
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
       
        for (let field in originalDocument) {
            if (originalDocument[field] && fields[field] && fields[field] != originalDocument[field]) {    
                updatedData[field] = fields[field]
            }
          }

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await updateQcTestCaseApi({...updatedData}),
                    async (response) => {
                        console.log("responseseeee",response)
                        console.log("updatededede datatata",updatedData)
                        await callBack(response,updatedData)
                        setLoading(false)
                        dispatch(closeModal("qc-test-case"))
                        dispatch(callSnackBar("Qc Test Case Updated Successfully", SNACK_BAR_VARIETNS.suceess))
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

    const fetchById = (id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await fetchQcTestCaseByIdApi({ id }),
                async (response) => {


                    setFields(response)
                    setOriginalDocument(response)
                    setLoading(false)

                },
                (err) => {
                    setFields({ ...fields, err })
                    setLoading(false)

                }
            )
        )
    }

    useEffect(() => {
        if (id)
            fetchById(id)

    }, [id])


    return <QcTestCaseCreateUi title={title} isUpdate={id} loading={loading} fields={fields} onSubmit={onSubmit} setFields={setFields} />
}
export default memo(QcTestCaseCreateController)