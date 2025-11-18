import React, { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import DataTable from '../../components/tables/DataTable';
import CustomDialog from '../../components/layouts/common/CustomDialog';
import ImageComponent from '../../components/layouts/upload/ImageComponent';
import { findObjectKeyByValue, titleCase } from '../../utils/main';
import { GRN_TYPE, LOG_TYPE, MATERIAL_TYPE, UNITS } from '../../utils/constants';
import { InformationUI } from '../../components/InformationUI';
import moment from 'moment';


const InventoryLogsViewController = ({ params }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const listdata = [params];

    const columns = useMemo(() => {
        return [
            {
                id: 1,
                fieldName: "",
                label: "Total Stock Quantity",
                align: "left",
                renderValue: (params) => params?.quantity,
            },
            {
                id: 2,
                fieldName: "",
                label: "Accepted Stock Quantity",
                align: "left",
                renderValue: (params) => params?.iqc?.accepted,
            },
            {
                id: 3,
                fieldName: "",
                label: "Rejected Details",
                align: "left",
                renderValue: (params) => (
                    <>
                        {params?.iqc?.rejected?.map((e, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 1,
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: "8px", fontSize: "16px", fontWeight: "bolder" }}>•</span>
                                    <span style={{ whiteSpace: 'nowrap' }}>{e.name} ({e.quantity} {findObjectKeyByValue(params?.materialDetails?.unit, UNITS)})</span>
                                </Box>
                                {e.photo && (
                                    <Box
                                        sx={{
                                            width: '100px',
                                            height: '100px',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ImageComponent
                                            src={e.photo}
                                            alt="Product"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </>
                ),
            }
        ];
    }, [params]);

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 100,
        search: "",
        searchable: ['name'],
        role: "",
        sort: "createdAt",
        sortDirection: -1,
    });

    return (
        <CustomDialog
            id={"infoupdatee"}
            title={"Inventory Logs Information"}
            closeText="Close"
        >
            <Box>
                <InformationUI
                    Data={[
                        { label: "Date :", value: moment(params.date).format("DD/MM/YYYY") },
                        {
                            label: "Material Type:",
                            value: titleCase(findObjectKeyByValue(params.materialType, MATERIAL_TYPE) || "NA")
                        },
                        { label: "Material Name :", value: params.materialIds?.name || "NA" },
                        {
                            label: "Log Type :", value: titleCase(
                                findObjectKeyByValue(params.logType, LOG_TYPE) || "NA"
                            )
                        },
                        { label: "Quantity :", value: params.quantity || "NA" },
                        { label: "Invoice No :", value: params.invoiceNumber || "NA" },
                        { label: "Amount :", value: params.amount || "NA" },

                        { label: "Vendor :", value: params.vendorName || params.vendorId?.name || "NA" },
                        { label: "Item Code :", value: params.itemCode || "NA" },
                        { label: "GRN Status", value: findObjectKeyByValue(params?.grnType, GRN_TYPE) || "NA"}
                    ]}
                />
                <Box mt={5}>
                    <DataTable
                        columns={columns}
                        noPagination
                        rows={listdata}
                        count={listdata.length}
                        filters={filters}
                        setFilters={setFilters}
                        loading={loading}
                    />
                </Box>
            </Box>
        </CustomDialog>
    )
}

export default InventoryLogsViewController;
