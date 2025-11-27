import React, { useState } from 'react'
import DeviceQcListUi from './DeviceQcListUi'
import { useLocation } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import CoonectDeviceModule from '../../components/bluetooth/CoonectDeviceModule';
import DeviceConnectUi from './DeviceConnectUi';

const DeviceQcListController = () => {
    const [data, setData] = useState({})
    const { state } = useLocation();
    const [fields, setFields] = useState(state?.patientData || { suggestedProduct: [], device: null });
    const [filters, setFilters] = useState({
        search: ""
    });
    return (
        <Paper elevation={3} sx={{ padding: '20px', display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight:"85vh" }}>
            <Box>
                {/* <DeviceQcListUi
                    data={data}
                    setData={setData}
                    fields={fields}
                    setFields={setFields}
                    filters={filters}
                    setFilters={setFilters}
                /> */}
                <DeviceConnectUi />
            </Box>

            <Box p={2} mt={4} sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                <Button variant='contained' sx={{ width: "8vw" }}>
                    <Typography variant="h5" sx={{ textTransform: "none" }}>
                        Next
                    </Typography>
                </Button>
            </Box>
        </Paper>
    )
}

export default DeviceQcListController