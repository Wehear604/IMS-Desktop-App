import React, { useMemo, useRef, useState } from 'react'
import { closeModal } from '../../store/actions/modalAction'
import { LOG_TYPE, SNACK_BAR_VARIETNS } from '../../utils/constants'
import { callSnackBar } from '../../store/actions/snackbarAction'
import useValidate from '../../store/hooks/useValidator'
import { useDispatch } from 'react-redux'
import { callApiAction } from '../../store/actions/commonAction'
import moment from 'moment'
import GenerateQrCodeUi from './GenerateQrCodeUi'
import { GenerateQrCodeApi } from '../../apis/inventoryLogs.api'
import html2canvas from "html2canvas";

const GenerateQrCodeController = ({ callBack = () => { } }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [fields, setFields] = useState({
        err: '',
        date: moment().toISOString(),
        materialType: null,
        materialId: '',
        quantity: '',
        amount: '',
        vendorId: "",
        logType: LOG_TYPE.In,
        itemCode: "",
    })
    const [QRCode, setQRCode] = useState()
    const validationSchemaForCreate = useMemo(() => ([

        {
            required: true,
            value: fields.date,
            field: 'Date',
        },

        {
            required: true,
            value: fields.materialType,
            field: 'Material Type',
        },

        {
            required: true,
            value: fields.materialId,
            field: 'Material Name',
        },

        {
            required: true,
            value: fields.logType,
            field: 'Log Type',
        },

        {
            required: true,
            value: fields.quantity,
            field: 'Quantity',
        },

        {
            required: false,
            value: fields.itemCode,
            field: 'Item Code',
        },

    ]), [fields])
    const qrRef = useRef(null);
    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)

        if (validationResponse === true) {
            if (!QRCode) {
                setLoading(true)
                dispatch(
                    callApiAction(
                        async () => await GenerateQrCodeApi({ ...fields }),
                        async (response) => {
                            callBack()
                            setQRCode(true)
                            console.log("qrresponse", response)

                            setFields({ ...response })
                            setLoading(false)
                            dispatch(callSnackBar("Inventory Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                        },
                        (err) => {
                            setLoading(false)
                            setFields({ ...fields, err })
                        }
                    )
                )
            } else {
                if (!qrRef.current) { return setFields({ ...fields, err: "not download" }); }
                else if (qrRef.current) {
                    const canvas = await html2canvas(qrRef.current);
                    const image = canvas.toDataURL("image/png");

                    const link = document.createElement("a");
                    link.href = image;
                    link.download = "qr-code.png";
                    link.click();
                    setQRCode(false)
                    dispatch(closeModal("qrCode"))
                    setFields({ ...fields, err: "" });
                }
            }
        } else {
            setFields({ ...fields, 'err': validationResponse })
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        createFunction()
    }
    return (
        <GenerateQrCodeUi
            onSubmit={onSubmit}
            fields={fields}
            setFields={setFields}
            loading={loading}
            QRCodes={QRCode}
            qrRef={qrRef}
        />
    )
}

export default GenerateQrCodeController