import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import DataTable from "../../components/tables/DataTable";

const DeviceQcDashboardUi = ({ list, loading, filters, setFilters, columns }) => {
    console.log("DeviceQcDashboardUi list", list);
  return <Box mb={3}>
                <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
                    
                    <Box>
                        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" fontWeight="bold">Device QC Dashboard</Typography>
                            </Box>
                    </Box>

                    <Box sx={{ p:2, minHeight: "40vh" }}>
                        <DataTable columns={columns} rows={list?.result ? list?.result : []} count={list?.total ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
                    </Box>
                </Paper>
            </Box>
};

export default DeviceQcDashboardUi;
