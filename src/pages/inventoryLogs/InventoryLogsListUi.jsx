import { Box, Button, Paper, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import React from 'react'
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import DataTable from '../../components/tables/DataTable';
import QrCodeScannerInforamation from '../../components/Scanner/QrCodeScannerInforamation';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { FetchQrInfoByIdApi } from '../../apis/inventoryLogs.api';
import { openModal } from '../../store/actions/modalAction';
import { useDispatch } from 'react-redux';
import { OnCreateButtonAccess } from '../../utils/main';
import MODULES from '../../utils/module.constant';

const InventoryLogsListUi = ({ onCreateBtnClick, callBack, list, setList, loading, filters, columns, setFilters }) => {
    const dispatch = useDispatch();
    const handleOpen = () => {
        dispatch(
            openModal(
                <QrCodeScannerInforamation
                    GetApi={FetchQrInfoByIdApi}
                />,
                "md",
                false,
                ""
            )
        );
    };
    return (
        <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Box>
                    <Typography variant='h3' color={"primary"}>GRN</Typography>
                </Box>

                <Box gap={2} display={"flex"}>
                    <Box>
                        <Button variant='contained' onClick={handleOpen} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <QrCodeScannerIcon />
                            {/* &nbsp;
                            <Typography variant='h5'>
                                Scan QR Code
                            </Typography> */}
                        </Button>
                    </Box>
                    {OnCreateButtonAccess(MODULES.GRN) && <Box>
                        <Button variant='contained' onClick={onCreateBtnClick} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {/* <AddIcon /> &nbsp; */}
                            <Typography variant='h5'>
                                Create GRN
                            </Typography>
                        </Button>
                    </Box>}
                </Box>
            </Box>

            <Box mt={4} width={"100%"} display={"flex"} justifyContent={"flex-end"}>
                <Box
                    mb={4}
                    sx={{ display: "flex", width: "20vw", justifyContent: "flex-end" }}
                    pl={3}
                >
                    <AsyncSearchBar
                        fullWidth
                        title="Search By Name"
                        size="small"
                        placeholder={"Search By Name"}
                        defaultValue={filters.search}
                        onChange={(changedVal) => {
                            setFilters({
                                ...filters, pageNo: 1,
                                pageSize: 10, search: changedVal
                            });
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ minHeight: "40vh" }}>
                <DataTable
                    columns={columns} rows={list?.result ? list?.result : []} count={list?.total ?? 0} filters={filters} setFilters={setFilters} loading={loading}
                />
            </Box>
        </Paper>
    )
}

export default InventoryLogsListUi