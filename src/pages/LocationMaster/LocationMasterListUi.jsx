import { Box, Button, Paper, Typography } from '@mui/material'
import React from 'react'
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/tables/DataTable';
import { FilterTitleBox, FiltersBox } from '../../components/layouts/OneViewBox';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/actions/modalAction';
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import LocationMasterCreateController from './LocationMasterCreateController';
import MODULES from '../../utils/module.constant';
import { OnCreateButtonAccess } from '../../utils/main';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import QrCodeScannerInforamation from '../../components/Scanner/QrCodeScannerInforamation';
import { FetchLocationHistoryApi } from '../../apis/locationMaster.api';


const LocationMasterListUi = ({ columns, list, filters, setFilters, loading, callBack }) => {
    const dispatch = useDispatch()
    const id = 'Create';
    const onCreateBtnClick = () => {
        dispatch(openModal(
            <LocationMasterCreateController
                callBack={callBack}
            />, "sm", false, id))
    }

    const handleOpen = () => {
        dispatch(
            openModal(
                <QrCodeScannerInforamation
                    GetApi={FetchLocationHistoryApi}
                    isDataView={true}
                />,
                "md",
                false,
                ""
            )
        );
    };
    return (
        <>
            <Box mb={3}>
                <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
                    <Box mb={4} display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"flex-end"}>
                        <FilterTitleBox>
                            <Box mt={2} >
                                <Typography variant="h3" color={"#000"}>
                                    Location Master
                                </Typography>
                            </Box>


                            <Box sx={{ display: "flex", gap: 2, width: "30%" }}>
                                {/* <Box> */}
                                <Button variant='contained' onClick={handleOpen} sx={{ width: "50%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <QrCodeScannerIcon />

                                </Button>
                                {/* </Box> */}
                                {OnCreateButtonAccess(MODULES.SPECIAL_MARKING) && <Button onClick={onCreateBtnClick} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }} variant='contained'>
                                    {/* <AddIcon /> &nbsp; */}
                                    <Typography variant='h5' sx={{ display: "flex" }}>
                                        Add Location Master
                                    </Typography>
                                </Button>}
                            </Box>
                        </FilterTitleBox>

                        <FiltersBox mt={4}>
                            <PaddingBoxInDesktop
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
                            </PaddingBoxInDesktop>
                        </FiltersBox>
                    </Box>

                    <Box sx={{ minHeight: "40vh" }}>
                        <DataTable columns={columns} rows={list?.result ? list?.result : []} count={list?.total ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
                    </Box>
                </Paper>
            </Box>


        </>
    )
}

export default LocationMasterListUi