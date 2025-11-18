import { Box, Button, Paper, Typography } from '@mui/material'
import React from 'react'
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import DataTable from '../../components/tables/DataTable';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import GenerateQrCodeController from './GenerateQrCodeController';
import { openModal } from '../../store/actions/modalAction';
import { useDispatch } from 'react-redux';

const GenerateQrListUi = ({ list, loading, fetchList, filters, columns, setFilters }) => {
    const dispatch = useDispatch()
    const id = 'qrCode';
    const onGenerateBtnClick = () => {
        dispatch(openModal(
            <GenerateQrCodeController
                callBack={() => {
                    fetchList()
                }}
            />, "sm", false, id))
    }

    console.log("object list", list);
    return (
        <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Box>
                    <Typography variant='h3' color={"primary"}>Generate QR</Typography>
                </Box>

                <Box gap={2} display={"flex"}>
                    <Box>
                        <Button variant='contained' onClick={onGenerateBtnClick} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <QrCodeScannerIcon /> &nbsp;
                            <Typography variant='h5'>
                                Generate QR Code
                            </Typography>
                        </Button>
                    </Box>

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

export default GenerateQrListUi