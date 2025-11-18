import React, { useMemo, useState } from 'react'
import RejectedQuantityUI from './RejectedQuantityUI'
import CustomDialog from '../../components/layouts/common/CustomDialog'
import { CenteredBox } from '../../components/layouts/OneViewBox'
import { Box, Chip, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import useValidate from '../../store/hooks/useValidator'
import { SNACK_BAR_VARIETNS } from '../../utils/constants'
import { callSnackBar } from '../../store/actions/snackbarAction'
import { closeModal } from '../../store/actions/modalAction'
import { UpdateRejectedQuantityApi } from '../../apis/inventoryLogs.api'
import { callApiAction } from '../../store/actions/commonAction'
import AddIcon from '@mui/icons-material/Add';
import moment from 'moment'
import { InformationUI } from '../../components/InformationUI'

const RejectedQuantityController = ({ id, callBack, params, isview, Type }) => {
    const [loading, setLoading] = useState(false)
    const validate = useValidate()
    const dispatch = useDispatch()

    const [fields, setFields] = useState({
        err: '',
        _id:id,
        rejected: params?.rejected?.length > 0 ? params?.rejected :
        [{
            quantity: null,
            reason: ""
            }]
    })
    const validationSchema = useMemo(() => ([
        {
            required: true,
            value: fields.rejected.every((item) => item.quantity !== null),
            field: 'Reason Quantity',
        },
        {
            required: true,
            value: fields.rejected.every((item) => item.reason !== ""),
            field: 'Rejected Reason',
        }
    ]), [fields])

    const onSubmit = async (e) => {
        e.preventDefault()
        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(
                callApiAction(
                    async () => await UpdateRejectedQuantityApi({ ...fields }),
                    async () => {
                        setLoading(false)
                        callBack()
                        dispatch(callSnackBar("Successfully Rejected", SNACK_BAR_VARIETNS.suceess))
                        dispatch(closeModal("RejectedQuantity"))
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

    const handleDeleteItem = (index) => {
        const updatedItems = fields.rejected.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", rejected: updatedItems });
    };

    return (
        <CustomDialog
            id={"RejectedQuantity"}
            loading={loading}
            err={fields?.err}
            onSubmit={!isview ? (e) => onSubmit(e) : false}
            title={"Rejected Quantity"}
            closeText="Close"
            confirmText={"Submit"}
        >
            {loading ?
                <CenteredBox> <CircularProgress /> </CenteredBox>
                :
                <>
                    <InformationUI
                        Data={[
                            { label: "Date :", value: moment(params?.date).format("DD/MM/YYYY") },
                            { label: "Material Type :", value: params?.materialCollection || "NA" },
                            { label: "Material Name :", value: params?.materialDetails?.name || "NA" },
                            {
                                label: "Batch Number :", isArray: true, value: params?.batchNumbers?.map((item, index) => `${item?.batchNumber + " - " + item?.quantity}`)
                            },
                            { label: "Amount :", value: params?.amount || "NA" },
                            { label: "Quantity :", value: params?.quantity || "NA" },
                            { label: "Invoice Number :", value: params?.invoiceNumber || "NA" },
                            { label: "Category :", value: params?.category?.name || "NA" },
                        ]}
                    />
                    {<Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
                    
                    <Box >
                        <RejectedQuantityUI handleDeleteItem={handleDeleteItem} setFields={setFields} loading={loading} fields={fields} isview={isview} />
                    </Box>
                    {!isview && <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                        <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                            setFields((data) => {
                                let arr = [...data.rejected];
                                arr.push({
                                    quantity: null,
                                    reason: ""
                                });
                                return { ...data, rejected: arr };
                            });
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "60%", borderRadius: "50%", border: "2px solid" }}>
                                <AddIcon sx={{ width: "100%", height: "4vh" }} />
                            </Box>
                        </IconButton>
                    </Box>}
                </Box>}</>}
        </CustomDialog>
    )
}

export default RejectedQuantityController