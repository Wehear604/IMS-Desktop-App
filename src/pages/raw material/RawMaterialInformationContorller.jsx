import React, { useMemo, useState } from 'react'
import { Box } from '@mui/material';
import DataTable from '../../components/tables/DataTable';
import { DAY_WEEK_MONTH } from '../../utils/constants';
import CustomDialog from '../../components/layouts/common/CustomDialog';

const RawMaterialInformationContorller = ({ params }) => {

    const listdata = [params]
    const columns = useMemo(
        () => [

            {
                id: 1,
                fieldName: "min_stock_quantity",
                label: "Min. Stock Quantity",
                align: "left",
                sort: true,
            },
            {
                id: 2,
                fieldName: "price_per_unit",
                label: "Price per Unit",
                align: "left",
                sort: true,
            },

            {
                id: 4,
                fieldName: "location",
                label: "Location",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => params?.location,
            },

            {
                id: 3,
                fieldName: "lead_time",
                label: "Lead Time",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => {
                    if (params.lead_time <= 7) {
                        return `${params.lead_time} ${DAY_WEEK_MONTH.DAY}`;
                    } else {
                        if (params.lead_time % 7 === 0) {
                            return `${Math.floor(params.lead_time / 7)} ${DAY_WEEK_MONTH.WEEK} `;
                        }
                        return `${Math.floor(params.lead_time / 7)} ${DAY_WEEK_MONTH.WEEK} ${params.lead_time % 7} ${DAY_WEEK_MONTH.DAY}`;
                    }
                },
            },

            {
                id: 2,
                fieldName: "alternative_vendor",
                label: "Alternative Vendor",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => params?.alternative_vendor?.map((e) => e?.name),
            },


        ], [])

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
            title={"Raw-Materials Information"}
            closeText="Close"
        >
            <Box>

                <Box sx={{ minHeight: "30vh", overflow: "auto", scrollbarWidth: "none" }}>
                    <DataTable columns={columns} noPagination rows={listdata ? listdata : []} count={listdata ?? 0} filters={filters} setFilters={setFilters} loading={false} />
                </Box>
            </Box>
        </CustomDialog>
    )
}

export default RawMaterialInformationContorller