import { Box, Button, Paper, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import React from 'react'
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import DataTable from '../../components/tables/DataTable';


const PurchaseRequestListUi = ({ onCreateBtnClick, list, setList, loading, filters, columns, setFilters }) => {

    return (
        <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Box>
                    <Typography variant='h3' color={"primary"}>Material Requests</Typography>
                </Box>

                <Box gap={2} display={"flex"}>
                    <Box>
                        <Button variant='contained' onClick={onCreateBtnClick} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {/* <AddIcon /> &nbsp; */}
                            <Typography variant='h5'>
                                Create Material Request
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

export default PurchaseRequestListUi