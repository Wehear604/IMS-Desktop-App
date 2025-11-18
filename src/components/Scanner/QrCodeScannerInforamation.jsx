import React, { useEffect, useMemo, useState } from 'react'
import { closeModal, openModal } from '../../store/actions/modalAction'
import { useDispatch } from 'react-redux';
import QrScannerPopup from './QrScannerPopup';
import { Box, Card, CircularProgress, Grid, Typography } from '@mui/material';
import { callApiAction } from '../../store/actions/commonAction';
import CustomDialog from '../layouts/common/CustomDialog';
import { Chip } from '@mui/material';
import { CenteredBox } from '../layouts/OneViewBox';
import DataTable from '../tables/DataTable';
import { InformationUI } from '../InformationUI';
import { findObjectKeyByValue } from '../../utils/main';
import { LOG_TYPE, MATERIAL_TYPE } from '../../utils/constants';

const DataViewer = ({ Data }) => (
    <Box sx={{ height: "auto", width: "100%", border: "2px solid #1D013B", borderRadius: "10px" }}>
        <Grid container p={2}>
            {Data?.map((item, index) => (
                item?.label !== "Title" && <>
                    <Grid item mt={2} md={3} xs={6} sm={4}>
                        <Typography fontWeight="bold" variant="h6">{item?.label}</Typography>
                    </Grid>
                    <Grid item mt={2} md={3} xs={6} sm={8}>
                        {Array.isArray(item?.value) ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {item?.value.map((val, i) => (
                                    <Chip key={i} label={val} color="primary" variant="outlined" />
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="h6" sx={{ color: "#808080" }}>
                                {String(item?.value)}
                            </Typography>
                        )}
                    </Grid>
                </>
            ))}
        </Grid>
    </Box>
);

const flattenObject = (obj, parentKey = '', result = []) => {
    for (let key in obj) {
        const value = obj[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (value === "" || value === null) continue;

        if (Array.isArray(value)) {
            if (value.length > 0) {
                result.push({
                    label: newKey.replace(/\./g, ' > ').replace(/\[\d+\]/g, ''),
                    value: value,
                    isArray: true
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            flattenObject(value, newKey, result);
        } else {
            result.push({
                label: newKey.replace(/\./g, ' > ').replace(/\[\d+\]/g, ''),
                value: value,
                isArray: false
            });
        }
    }
    return result;
};

const DataView = ({ TableData, TableTitle, tableKey }) => {
    const istrue = tableKey === "rawMaterials"
    return (
        <>
            {TableData && TableTitle && <>
                <Box p={2} sx={{ border: "1px solid rgba(0,0,0,0.2)", borderRadius: "10px" }}>
                    <Box p={2}>
                        <Typography fontWeight="bold" variant="h6">{TableTitle}</Typography>
                    </Box>
                    <Card sx={{ marginBottom: 2, padding: 2, backgroundColor: "rgba(0, 0, 0, 0.26)", color: "rgb(0 0 0 / 37%)" }}>
                        <Grid container alignItems="center" spacing={5}>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Date</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Quantity</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Vendor</Typography>
                            </Grid>

                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>log Type</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Invoice Number</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Location</Typography>
                            </Grid>
                        </Grid>
                    </Card>
                    {TableData.map((item, index) => {
                        return (
                            <Card key={index} sx={{ marginBottom: 2, padding: 2 }}>
                                <Grid container alignItems="center" spacing={5}>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item?.date}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item?.quantity}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item?.vendor}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{findObjectKeyByValue(item?.logType, LOG_TYPE)}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item?.invoiceNumber}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item?.location}</Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        )
                    })}
                </Box></>}
        </>
    )
}

const QrCodeScannerInforamation = ({ GetApi, title, isDataView }) => {
    const [qrCode, setQrCode] = useState(true);
    const [fields, setFields] = useState({});
    const [list, setList] = useState([]);
    const dispatch = useDispatch()

    const isValidObjectId = (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }
    let OnTimeScan = true
    const onScan = (data) => {
        if (isValidObjectId(data.text) === true && OnTimeScan) {
            OnTimeScan = false
            dispatch(
                callApiAction(
                    async () => await GetApi({ id: data?.text }),
                    async (response) => {
                        isDataView ? setList(response) : setFields(flattenObject(response))
                        dispatch(closeModal("scanner"))
                        setQrCode(false);
                    },
                    (err) => {
                        setFields((prev) => ({ ...prev, err }))
                        dispatch(closeModal(""))
                        dispatch(closeModal("scanner"))
                    }
                )
            )
        }
    };
    const onQrBtnClick = () => {
        dispatch(
            openModal(
                <QrScannerPopup
                    onScan={onScan}
                // onClose={() => console.log("close")}
                />,
                "sm",
                false,
                "scanner"
            )
        );
    };

    useEffect(() => {
        if (qrCode) {
            onQrBtnClick();
        }
    }, [qrCode])
    console.log("fields", fields);

    return (<>
        {!qrCode && !isDataView ? <CustomDialog
            id={""}
            title={fields[0].value}
        >
            <DataViewer Data={fields} />
        </CustomDialog> : <CustomDialog
            id={""}
            title={"Location Master List"}
        >
            {list?.map((item, index) => (
                <Box key={index} mb={3}>
                    <InformationUI
                        Title={`Material Name : ${item?.materialName || "NA"}`}
                        Data={[
                            { label: "Material Type :", value: findObjectKeyByValue(item?.materialType, MATERIAL_TYPE) || "NA" },
                            { label: "Current Quantity :", value: item?.currentQuantity || "NA" },
                            { label: "Total In :", value: item?.totalIn || "NA" },
                            { label: "Total Out :", value: item?.totalOut || "NA" }
                        ]}
                    />

                    {item?.inLogs?.length > 0 && (
                        <Box mb={2}>
                            <DataView TableTitle="History Location Log In" TableData={item?.inLogs} />
                        </Box>
                    )}

                    {item?.outLogs?.length > 0 && (
                        <Box mb={2}>
                            <DataView TableTitle="History Location Log Out" TableData={item?.outLogs} />
                        </Box>
                    )}
                </Box>
            ))}

        </CustomDialog>
        }</>
    )
}

export default QrCodeScannerInforamation
