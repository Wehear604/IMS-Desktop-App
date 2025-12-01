import React, { useState } from 'react'
import DeviceQcListUi from './DeviceQcListUi'
import { useLocation } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import DeviceConnectUi from './DeviceConnectUi';

const DeviceQcListController = () => {
    const [fields, setFields] = useState();
    const [filters, setFilters] = useState({
        search: ""
    });
    const [step, setStep] = useState(0)
    return (
        <Paper elevation={3} sx={{ padding: '20px', display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {step === 0 && <> <Box>
                <DeviceQcListUi
                    fields={fields}
                    setFields={setFields}
                    filters={filters}
                    setFilters={setFilters}
                />
            </Box>

                <Box p={2} mt={4} sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    <Button variant='contained' sx={{ width: "8vw" }} onClick={() => setStep(step + 1)}>
                        <Typography variant="h5" sx={{ textTransform: "none" }}>
                            Next
                        </Typography>
                    </Button>
                </Box>
            </>}
            {step === 1 && <>
                <DeviceConnectUi />

                <Box p={2} mt={4} sx={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
                    <Button variant='contained' sx={{ width: "8vw" }} onClick={() => setStep(step - 1)}>
                        <Typography variant="h5" sx={{ textTransform: "none" }}>
                            Back
                        </Typography>
                    </Button>
                </Box>
            </>}
        </Paper>
    )
}

export default DeviceQcListController