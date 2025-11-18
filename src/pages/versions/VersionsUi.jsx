import { Box, Button, Paper, Typography } from "@mui/material"
import { Add } from "@mui/icons-material"

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../store/actions/modalAction";
import AddVersionController from "./AddVersionController";
import DataTable from "../../components/tables/DataTable";
import { FilterTitleBox } from "../../components/layouts/OneViewBox";
import MODULES from "../../utils/module.constant";
import { OnCreateButtonAccess } from "../../utils/main";

const VersionsUi = ({ setState, filters, setFilters, callBack, loading, state, columns }) => {
    const dispatch = useDispatch();
    const onAddVersion = () => {
        dispatch(
            openModal(
                <AddVersionController
                    callBack={callBack}
                />,
                "sm",
                false,
                "version"
            )
        );
    };

    console.log("first state", state)
    return <>
        <Box >
            <Paper sx={{ width: "100%", padding: 6 }}>
                <Box mb={4} display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
                    <FilterTitleBox>
                        <Box mt={2}>
                            <Typography variant="h3" color={"#000"}>
                                Versions
                            </Typography>
                        </Box>
                        <Box mb={2} sx={{ display: "flex" }}>
                            <Box mr={2} />
                        </Box>
                        <Box>
                            {OnCreateButtonAccess(MODULES.VERSIONS) &&<Button onClick={onAddVersion} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }} variant='contained'>
                                {/* <AddIcon /> &nbsp; */}
                                <Typography variant='h5' sx={{ display: "flex" }}>
                                    Add Version
                                </Typography>
                            </Button>}
                        </Box>
                    </FilterTitleBox>
                </Box>

                <Box sx={{ minHeight: "40vh" }} mt={8}>
                    <DataTable columns={columns} rows={state} count={state?.length} filters={filters} setFilters={setFilters} loading={loading} />
                </Box>
            </Paper>
        </Box>

    </>
}
export default VersionsUi