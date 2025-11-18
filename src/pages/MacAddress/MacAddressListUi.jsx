import { Paper, Typography, styled } from "@mui/material";
import { Box } from "@mui/system";
import DataTable from "../../components/tables/DataTable";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";

const FilterTitleBox = styled(Box)(({ theme }) => ({
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    [theme.breakpoints.down("md")]: {
        flexDirection: "column",
    },
}));

const UserIncentiveListUi = ({
    title,
    filters,
    setFilters,
    list,
    loading,
    columns,
}) => {
    return (
        <>
            <Box>
                <Paper elevation={2} sx={{ width: "100%", padding: 4 }}>
                    <Box mt={3}>
                        <FilterTitleBox p={2}>
                            <Typography variant="h3" color={"primary"}>
                                {title}
                            </Typography>
                            <Box
                                display={"flex"}
                                justifyContent={"space-between"}
                                flexDirection={"row"}
                                alignItems={"center"}
                                mt={3}
                            >
                                <Box pl={2} sx={{ display: "flex", width: "20vw" }}>
                                    <AsyncSearchBar
                                        fullWidth
                                        title="Search Name | Email"
                                        size="small"
                                        placeholder={"Search Name | Email"}
                                        defaultValue={filters?.search}
                                        onChange={(changedVal) => {
                                            setFilters({
                                                ...filters,
                                                pageNo: 1,
                                                pageSize: 10,
                                                search: changedVal,
                                            });
                                        }}
                                    />
                                </Box>
                            </Box>
                        </FilterTitleBox>
                    </Box>

                    <Box mt={2} p={2} sx={{ minHeight: "40vh" }}>
                        <DataTable
                            columns={columns}
                            rows={list.result ? list.result : []}
                            count={list.total ?? 0}
                            filters={filters}
                            setFilters={setFilters}
                            loading={loading}
                        />
                    </Box>
                </Paper>
            </Box>
        </>
    );
};
export default UserIncentiveListUi;
