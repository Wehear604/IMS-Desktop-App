import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Card, Chip, Grid, Typography } from '@mui/material';
import DataTable from '../../components/tables/DataTable';
import CustomDialog from '../../components/layouts/common/CustomDialog';
import { DAY_WEEK_MONTH, VENDOR_PRIORITY } from '../../utils/constants';
import { callApiAction } from '../../store/actions/commonAction';
import { useDispatch } from 'react-redux';
import { InformationUI } from '../../components/InformationUI';
import { getVendorByIdApi } from '../../apis/vendor.api';
import { findObjectKeyByValue } from '../../utils/main';

const DataView = ({ TableData, TableTitle, tableKey }) => {
    return (
        <>
            {TableData && TableTitle && <>
                <Box p={2} sx={{ border: "1px solid rgba(0,0,0,0.2)", borderRadius: "10px" }}>
                    <Box p={2}>
                        <Typography fontWeight="bold" variant="h6">{TableTitle}</Typography>
                    </Box>
                    <Card sx={{ marginBottom: 2, padding: 2, backgroundColor: "rgba(0, 0, 0, 0.26)", color: "rgb(0 0 0 / 37%)" }}>
                        <Grid container alignItems="center" spacing={5}>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Name</Typography>
                            </Grid>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Minimum Of Quantity</Typography>
                            </Grid>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Lead Time</Typography>
                            </Grid>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>priority</Typography>
                            </Grid>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Total Quantity Get</Typography>
                            </Grid>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Total Accepted Quantity</Typography>
                            </Grid>
                            <Grid item xs={1.71}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Acceptance Ratio</Typography>
                            </Grid>
                        </Grid>
                    </Card>
                    {TableData.map((item, index) => {
                        return (
                            <Card key={index} sx={{ marginBottom: 2, padding: 2 }}>
                                <Grid container alignItems="center" spacing={5}>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.name}</Typography>
                                    </Grid>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">
                                            {item.min_of_quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.lead_time}</Typography>
                                    </Grid>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.priority}</Typography>
                                    </Grid>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.totalQuantity}</Typography>
                                    </Grid>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.acceptedQuantity}</Typography>
                                    </Grid>
                                    <Grid item xs={1.71} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{<Chip
                                            label={`${item?.acceptanceRatio}%`}
                                            sx={{
                                                backgroundColor: item.acceptanceRatio === 0 ? "grey" : item.acceptanceRatio < 90 ? "red": "green",
                                                color: "white",
                                            }}
                                        />}</Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        )
                    })}
                </Box></>}
        </>
    )
}

const RawMaterialViewController = ({ params }) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState({})
    const fetchById = useCallback((id) => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await getVendorByIdApi({ id: params?._id }),
                async (response) => {
                    setFields((prev) => ({
                        ...response,
                        totalQuantity: params?.totalQuantity,
                        acceptedQuantity: params?.acceptedQuantity,
                        acceptanceRatio: params?.acceptanceRatio,
                        sfgs: response?.sfgs?.map((item) => ({
                            name: item?.sfgId?.name ? item?.sfgId?.name : item.name,
                            min_of_quantity: item.min_of_quantity,
                            lead_time: Number(item?.lead_time ?? 0),
                            priority: item.priority ? findObjectKeyByValue(item.priority, VENDOR_PRIORITY) : "NO PRIORITY DEFINE",
                            acceptanceRatio: item?.acceptanceRatio ?? 0,
                            acceptedQuantity: item?.acceptedQuantity ?? 0,
                            totalQuantity: item?.totalQuantity ?? 0
                        })),
                        skds: response?.skds?.map((item) => ({
                            name: item?.skdId?.name ? item?.skdId?.name : item.name,
                            min_of_quantity: item.min_of_quantity,
                            lead_time: Number(item?.lead_time ?? 0),
                            priority: item.priority ? findObjectKeyByValue(item.priority, VENDOR_PRIORITY) : "NO PRIORITY DEFINE",
                            acceptanceRatio: item?.acceptanceRatio ?? 0,
                            acceptedQuantity: item?.acceptedQuantity ?? 0,
                            totalQuantity: item?.totalQuantity ?? 0
                        })),
                        rawMaterials: response?.rawMaterials?.map((item) => ({
                            name: item?.rawMaterialId?.name ? item?.rawMaterialId?.name : item.name,
                            min_of_quantity: item.min_of_quantity,
                            lead_time: Number(item?.lead_time ?? 0),
                            priority: item.priority ? findObjectKeyByValue(item.priority, VENDOR_PRIORITY) : "NO PRIORITY DEFINE",
                            acceptanceRatio: item?.acceptanceRatio ?? 0,
                            acceptedQuantity: item?.acceptedQuantity ?? 0,
                            totalQuantity: item?.totalQuantity ?? 0
                        }))
                    }));
                    setLoading(false);
                },
                (err) => {
                    setFields((prev) => ({ ...prev, err }));
                    setLoading(false);
                }
            )
        );
    }, [dispatch, getVendorByIdApi]);

    useEffect(() => {
        if (params) fetchById(params);
    }, [params, fetchById]);


    return (
        <CustomDialog
            id={"infoupdateee"}
            title={"Vendor Information"}
            closeText="Close"
            loading={loading}
        >
            <Box>
                <InformationUI
                    Data={[
                        { label: "Vendor Name :", value: fields?.name ? fields?.name : "NA" },
                        { label: "Vendor Phone :", value: fields?.phone ? fields?.phone : "NA" },
                        { label: "Vendor email :", value: fields?.email ? fields?.email : "NA", IsFullLine: true },
                        
                        { label: "Address :", value: fields?.address ? fields?.address : "NA", IsFullLine: true },
                        { label: "Vendor country :", value: fields?.country ? fields?.country : "NA" },
                        { label: "GST Number :", value: fields?.gst_no ? fields?.gst_no : "NA" },
                        { label: "Total Quantity :", value: fields?.totalQuantity ? fields?.totalQuantity : "NA" },
                        { label: "Accepted Quantity :", value: fields?.acceptedQuantity ? fields?.acceptedQuantity : "NA" },
                        { label: "Acceptance Ratio :", value: fields?.acceptanceRatio ? fields?.acceptanceRatio : "NA" },
                    ]}
                />
            </Box>
            {fields?.sfgs?.length > 0 && <Box mb={2}>
                <DataView
                    TableTitle={"Semi Finished Good"}
                    TableData={fields?.sfgs}
                    tableKey="sfgs"
                />
            </Box>}
            {fields?.skds?.length > 0 && <Box mb={2}>
                <DataView
                    TableTitle={"Semi Knocked Down"}
                    TableData={fields?.skds}
                    tableKey="skds"
                />
            </Box>}
            {fields?.rawMaterials?.length > 0 && <Box mb={2}>
                <DataView
                    TableTitle={"Raw Materials"}
                    TableData={fields?.rawMaterials}
                    tableKey="rawMaterials"
                />
            </Box>}
        </CustomDialog>
    )
}

export default RawMaterialViewController