import React, { useEffect, useMemo, useRef, useState } from 'react'
import InventoryLogsCreateui from './InventoryLogsCreateui'
import { closeModal } from '../../store/actions/modalAction'
import { LOG_TYPE, MATERIAL_TYPE, SNACK_BAR_VARIETNS } from '../../utils/constants'
import { callSnackBar } from '../../store/actions/snackbarAction'
import useValidate from '../../store/hooks/useValidator'
import { batch, useDispatch } from 'react-redux'
import { callApiAction } from '../../store/actions/commonAction'
import moment from 'moment'
import { CreateInventoryLogsApi, FetchQrApi, FetchQrByIdApi, UpadteInventoryIQCApi } from '../../apis/inventoryLogs.api'
import { useCallback } from 'react'
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api'
import { FetchSKDApi } from '../../apis/skd.api'
import { FetchSFGApi } from '../../apis/sfg.api'
import { FetchFGApi } from '../../apis/FG.api'

const InventoryLogsCreateController = ({ id, callBack = () => { } }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [QrId, SetQrId] = useState("")
    const QrLoading = useRef(false)
    const [fields, setFields] = useState({
        err: '',
        date: moment().toISOString(),
        materialType: null,
        materialId: '',
        quantity: '',
        amount: '',
        invoiceNumber: "",
        vendorId: "",
        batchNumber: "",
        logType: LOG_TYPE.In,
        itemCode: "",
        pricePerUnits: "",
        iqc: {
            quantity: 0,
            accepted: 0,
            rejected: [{
                quantity: 0,
                reason: "68593b996343fcfdb8e17f56",
                name: "No Rejection"
            }],
            date: moment(),
        }
    })
    const [originalDocument, setOriginalDocument] = useState({})

    const [devices, setDevices] = useState([]);

    const checkHIDDevice = async () => {
        try {
            if (!navigator.hid) {
                throw new Error("WebHID API is not supported in this browser.");
            }
            const connectedDevices = await navigator.hid.getDevices();

            console.log("HID Devices:", connectedDevices);

            if (connectedDevices.length === 0) {
                throw new Error("Please connect Scanner Device.");
            }

            setDevices(connectedDevices);
        } catch (error) {
            console.error(error.message);
            dispatch(callSnackBar(error.message, SNACK_BAR_VARIETNS.info))

        }
    };
    useEffect(() => {
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            checkHIDDevice();
        }
    }, [id]);

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
            required: true,
            value: fields.batchNumber,
            field: "Batch Number"
        },

        {
            required: true,
            value: fields.itemCode,
            field: 'Item Code',
        },
        {
            required: fields?.materialType !== MATERIAL_TYPE.FG && true,
            value: fields.vendorId,
            field: 'Material Type',
        },
    ]), [fields])

    const validationSchemaForUpdate = useMemo(() => ([

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
            required: true,
            value: fields.batchNumber,
            field: "Batch Number"
        },

        // {
        //     required: true,
        //     value: fields?.iqc?.accepted !== null && fields?.iqc?.accepted >= 0,
        //     field: 'Non Negative Accepted Quantity*',
        // },
        // {
        //     required: true,
        //     value: fields?.iqc?.rejected !== null && fields?.iqc?.rejected >= 0,
        //     field: 'Non Negative Rejected Quantity',
        // },
        {
            required: true,
            value: fields.location,
            field: 'Location',
        },

    ]), [fields])

    const createFunction = async () => {
        const validationResponse = validate(validationSchemaForCreate)
        console.log("object  validationResponse", validationResponse);
        if (validationResponse === true) {
            if (QrLoading.current === true) {
                setLoading(true)
                dispatch(
                    callApiAction(
                        async () => await CreateInventoryLogsApi({ ...fields, vendorId: fields?.vendorId?._id ? fields?.vendorId?._id : fields?.vendorId, materialId: fields?.materialId?._id ? fields?.materialId?._id : fields?.materialId, qrId: QrId }),
                        async (response) => {
                            callBack(response)
                            setLoading(false)
                            dispatch(callSnackBar("Inventory Updated Successfully", SNACK_BAR_VARIETNS.suceess))
                            dispatch(closeModal("inventoryLog"))
                        },
                        (err) => {
                            setLoading(false)
                            setFields({ ...fields, err })

                            dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
                        }

                    )
                )
            }
        } else {
            setFields({ ...fields, 'err': validationResponse })
        }
    }

    const updateFunction = async () => {
        const validationResponse = validate(validationSchemaForUpdate);
        const updatedData = { id };

        for (let field in originalDocument) {
            if (
                originalDocument[field] &&
                fields[field] &&
                fields[field] !== originalDocument[field]
            ) {
                updatedData[field] = fields[field];
            }
        }

        if (validationResponse === true) {
            setLoading(true);
            dispatch(
                callApiAction(
                    async () => await UpadteInventoryIQCApi({
                        ...fields, _id: id,
                        materialId: fields?.materialId?._id ? fields?.materialId?._id : fields?.materialId,
                        vendorId: fields?.vendorId?._id ? fields?.vendorId?._id : fields?.vendorId,
                        iqc: {
                            ...fields.iqc,
                            accepted: Number(fields.quantity) - fields?.iqc?.rejected?.reduce((sum, item) => sum + Number(item?.quantity || 0), 0),
                            quantity: fields.quantity
                        }
                    }),
                    async (response) => {
                        callBack()
                        setLoading(false);
                        dispatch(
                            callSnackBar(
                                "Updated Finished Good Successfully",
                                SNACK_BAR_VARIETNS.suceess
                            )
                        );
                        dispatch(closeModal("update"));
                    },
                    (err) => {
                        setLoading(false);
                        setFields({ ...fields, err });
                    }
                )
            );
        } else {
            setFields({ ...fields, err: validationResponse });
        }
    };

    const fetchById = useCallback((id) => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await FetchQrByIdApi({ id }),
                async (response) => {
                    setFields({
                        ...fields, ...response, iqc: {
                            ...fields.iqc, rejected: [{
                                quantity: 0,
                                reason: "68593b996343fcfdb8e17f56",
                                name: "No Rejection"
                            }]
                        }
                    });
                    setOriginalDocument(response);
                    setLoading(false);
                },
                (err) => {
                    setFields({ ...fields, err });
                    setLoading(false);
                }
            )
        );
    }, [dispatch]);

    useEffect(() => {
        if (id) fetchById(id);
    }, [id, fetchById]);

    const onSubmit = async (e) => {
        e.preventDefault()
        if (QrLoading.current) {
            if (id) {
                updateFunction()
            } else {
                createFunction()
            }
        }
    }

    const fetchList = useCallback(() => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await FetchQrApi({ id: QrId }),
                (response) => {
                    if (response) {
                        setFields(response);
                        setLoading(false);
                        QrLoading.current = true
                    } else {
                        setFields({ ...fields, err: "Data Not Found" })
                    }
                },
                (err) => {
                    setFields({ ...fields, err: "Data Not Found" })
                    setLoading(false);
                }
            )
        );
    }, [dispatch, QrId]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (QrId) {
                fetchList();
            }
        }, 1000);
        return () => { clearTimeout(timeoutId); };
    }, [QrId, fetchList]);

    const APICall = (type, changedVal) => {
        switch (type) {
            case MATERIAL_TYPE.RAW_MATERIALS:
                return { api: fetchRawMaterialApi, label: "Select Raw Material", code: changedVal?.rawMaterial_code };
            case MATERIAL_TYPE.SKD:
                return { api: FetchSKDApi, label: "Select Semi Knock Down", code: changedVal?.skd_Code };
            case MATERIAL_TYPE.SFG:
                return { api: FetchSFGApi, label: "Select Semi Finished Good", code: changedVal?.sfg_Code };
            case MATERIAL_TYPE.FG:
                return { api: FetchFGApi, label: "Select Finished Good", code: changedVal?.fg_Code };
            default:
                return null;
        }
    };


    return (
        <InventoryLogsCreateui
            onSubmit={onSubmit}
            loading={loading}
            fields={fields}
            setFields={setFields}
            SetQrId={SetQrId}
            QrId={QrId}
            setLoading={setLoading}
            QrLoading={QrLoading}
            id={id}
            validationSchemaForCreate={validationSchemaForCreate}
            APICall={APICall}
        />
    )
}

export default InventoryLogsCreateController