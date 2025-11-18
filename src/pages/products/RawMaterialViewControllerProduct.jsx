import React, { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';
import DataTable from '../../components/tables/DataTable';
import CustomDialog from '../../components/layouts/common/CustomDialog';

const RawMaterialViewControllerProduct = ({ params }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const columns = useMemo(
        () => [

            {
                id: 1,
                fieldName: "rawMaterialName",
                label: "Raw-Materials",
                align: "left",
                sort: true,
            },

            {
                id: 2,
                fieldName: "quantity",
                label: "Quantity Required",
                align: "left",
                sort: true,
            },

        ], [dispatch])

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
            id={"infoupdate"}
            title={"Raw-Materials Information"}
            closeText="Close"
        >
            <Box>
                <Box sx={{ minHeight: "30vh", overflow: "auto", scrollbarWidth: "none" }}>
                    <DataTable columns={columns} noPagination rows={params?.requiredRawMaterials ? params?.requiredRawMaterials : []} count={params?.requiredRawMaterials?.length ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
                </Box>
                <Box>
                    <Typography variant='h5'>Raw-Materials Count = {params?.requiredRawMaterials?.length}</Typography>
                </Box>
            </Box>
        </CustomDialog>
    )
}

export default RawMaterialViewControllerProduct