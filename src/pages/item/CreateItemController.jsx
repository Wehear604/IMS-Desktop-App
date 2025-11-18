import React from 'react'
import CreateItemUi from './CreateItemUi'
import { useDispatch } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { ITEM_STATUS, SNACK_BAR_VARIETNS } from "../../utils/constants"
import { CreateItemApi, CreateItemHistoryApi, getItemByIdApi, UpdateItemApi, UpdateItemHistoryApi } from '../../apis/item.api'


const CreateItemController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Asset"

    const [loading, setLoading] = useState(false)

    const [fields, setFields] = useState({
        err: '',
        id,
        name: '',
        itemType: '',
        status: ITEM_STATUS.ASSIGNED
    })

    const [originalDocument, setOriginalDocument] = useState({})


    const validationSchemaForCreate = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'Item name',
        },
        {
            required: true,
            value: fields.itemType,
            field: 'Item Type',
        },
        // {
        //     required: true,
        //     value: fields.user,
        //     field: 'User Name',
        // },

    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([

        {
            required: true,
            value: fields.name,
            field: 'Item Name',
        },
        {
            required: true,
            value: fields.itemType,
            field: 'Item Type',
        },
        {
            required: fields.status == ITEM_STATUS.AVAILABLE && true,
            value: fields.user,
            field: 'User Name',
        },
    ]), [fields])


    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await CreateItemApi({ ...fields, status: ITEM_STATUS.AVAILABLE }),
                    async (response) => {  
                        // await CreateItemHistoryApi({
                        //     item: response._id,
                        //     userName: fields?.userName,
                        //     user: fields?.user,
                        //     status: ITEM_STATUS.AVAILABLE   
                        // });
                        callBack()
                        setLoading(false)
                        dispatch(callSnackBar("Item Created Successfully", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal("item"))
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

        const isStatusChanged = fields.status == ITEM_STATUS.ASSIGNED ? ITEM_STATUS.AVAILABLE : ITEM_STATUS.ASSIGNED 
        if (validationResponse === true ) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await UpdateItemApi({ ...fields, status: isStatusChanged, itemType: fields?.itemType?._id ? fields?.itemType?._id : fields?.itemType }),
                    async (response) => {
                        if (isStatusChanged === ITEM_STATUS.ASSIGNED) {
                            await CreateItemHistoryApi({
                                item: id,
                                userName: fields?.userName,
                                user: fields?.user,
                                status: isStatusChanged
                            });
                        } else {
                            await UpdateItemHistoryApi({
                                item: id,
                                remarks: fields?.remarks,
                                status: isStatusChanged
                            });
                        }
                        await callBack(updatedData)
                        setLoading(false)
                        dispatch(callSnackBar("Product Brand Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        !isModal && dispatch(closeModal("edit"))
                        isModal && handleAreaModalClose()
                    },
                    (err) => {
                        setLoading(false)
                        setFields({ ...fields, err })
                    }
                )
            )
        } else {
            setFields({ ...fields, err: validationResponse === true ? "Please Changed Asset Status" : validationResponse })
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
                async () => await getItemByIdApi({ id }),
                async (response) => {
                    setFields({ ...fields, ...response })
                    setOriginalDocument(response.status)
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

    return (
        <CreateItemUi
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

export default CreateItemController