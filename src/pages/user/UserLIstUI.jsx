import {
  Button,
  ButtonGroup,
  Paper,
  Typography,
  styled,
} from "@mui/material";
import { Box } from "@mui/system";
import DataTable from "../../components/tables/DataTable";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import AddIcon from "@mui/icons-material/Add";
import { OnCreateButtonAccess } from "../../utils/main";
import MODULES from "../../utils/module.constant";

const FilterTitleBox = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));
const FiltersBox = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",

  flexWrap: "wrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const ListUi = ({
  title,
  filters,
  setFilters,
  list,
  roles,
  loading,
  onCreateBtnClick,
  columns,
}) => {
  return (
    <>
      <Box mb={3}>
        <Paper elevation={2} sx={{ width: "100%", padding: 4 }}>
          <Box mb={4} mt={3} >
            <FilterTitleBox>
              <Typography variant="h3" color={"#000"}>
                {title}
              </Typography>

              <Box>
                {OnCreateButtonAccess(MODULES.USER) && <Button
                  onClick={onCreateBtnClick}
                  sx={{
                    width: "100%",
                    height: "6vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  variant="contained"
                >
                  <AddIcon /> &nbsp;
                  <Typography variant="h4" sx={{ display: "flex" }}>
                    Add Member
                  </Typography>
                </Button>}
              </Box>
            </FilterTitleBox>

            <FiltersBox mt={5}>
              <PaddingBoxInDesktop
                mb={4}
                sx={{ display: "flex", width: "20vw" }}
              >
                <AsyncSearchBar
                  fullWidth
                  title="Search Name | Email"
                  size="small"
                  placeholder={"Search Name | Email"}
                  defaultValue={filters.search}
                  onChange={(changedVal) => {
                    setFilters({ ...filters, pageNo: 1,
                      pageSize: 10, search: changedVal });
                  }}
                />
              </PaddingBoxInDesktop>

              <PaddingBoxInDesktop
                mb={2}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
                pl={3}
              >
                <ButtonGroup
                  disableElevation
                  variant="outlined"
                  sx={{ height: "6vh" }}
                >
                  <Button
                    onClick={() => setFilters({ ...filters, deleted: null })}
                    variant={filters.deleted == null ? "contained" : "outlined"}
                  >
                    <Typography variant="h5"> Active User</Typography>
                  </Button>
                  <Button
                    onClick={() => setFilters({ ...filters, deleted: true })}
                    variant={filters.deleted === true ? "contained" : "outlined"}
                  >
                    <Typography variant="h5"> Deleted User</Typography>
                  </Button>
                </ButtonGroup>
              </PaddingBoxInDesktop>
            </FiltersBox>
          </Box>

          <Box sx={{ minHeight: "40vh" }}>
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
export default ListUi;
