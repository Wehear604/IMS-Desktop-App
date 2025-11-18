import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import CategoryTypeCreateUi from "./CategoryTypeCreateUi"
import { createCategoryApi, getCategoryByIdApi, updateCategoryApi } from "../../apis/category.api"
import { fetchCategoryAction } from "../../store/actions/setting.Action"

const CategoryTypeCreateController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Category"
    const { settings } = useSelector((state) => state)


    const [loading, setLoading] = useState(false)

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
            field: 'Category Name',
        }
    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Category Name',
        }
    ]), [fields])


    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {


            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await createCategoryApi(fields),
                    async (response) => {

                        await callBack(response)
                        setLoading(false)
                        dispatch(fetchCategoryAction(settings.category_filters))
                        dispatch(closeModal("createcategory"))
                        dispatch(callSnackBar("Category Created Successfully", SNACK_BAR_VARIETNS.suceess))
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
                    async () => await updateCategoryApi(updatedData),
                    async (response) => {

                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Type Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("updatetypofsales"))
                        dispatch(fetchCategoryAction(settings.category_filters))
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
                async () => await getCategoryByIdApi({ id }),
                async (response) => {
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



    return <CategoryTypeCreateUi
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
export default memo(CategoryTypeCreateController)