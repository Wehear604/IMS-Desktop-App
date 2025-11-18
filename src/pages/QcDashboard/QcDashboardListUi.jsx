import { Button, Grid, ListItem, Paper, Skeleton, Typography, styled } from "@mui/material";
import { Box } from "@mui/system";
import DataTable from "../../components/tables/DataTable";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import AsyncDropDown from "../../components/inputs/AsyncDropDown";
import TimeRangeSelector from "../../components/layouts/common/TimeRangeSelector";
import { FetchFGApi } from "../../apis/FG.api";
import CustomInput from "../../components/inputs/CustomInputs";
import { openModal } from "../../store/actions/modalAction";
import QcDashboardListOnClickCountController from "./QcDashboardListCount.controller";
import { useState } from "react";

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

const QcDashboardListUi = ({
  title,
  filters,
  setFilters,
  list,
  loading,
  columns,
}) => {
  const [count,setCount] = useState(1)
 
  return (
    <>
      <Box mb={3}>
        <Paper elevation={2} sx={{ width: "100%", padding: 4 }}>
          <Box mb={4} mt={3} ml={3}>
            <FilterTitleBox>
              <Typography variant="h3" color={"#000"}>
                {title}
              </Typography>
            </FilterTitleBox>
            {loading ? 
            <>  <Grid container spacing={2} mt={2}>
            <Grid item xs={4} md={4}>
              <Skeleton variant="rounded" width="100%" height="100px" />
            </Grid>
            <Grid item xs={4} md={4}>
              <Skeleton variant="rounded" width="100%" height="100px" />
            </Grid>
            <Grid item xs={4} md={4}>
              <Skeleton variant="rounded" width="100%" height="100px" />
            </Grid>
          </Grid> </>:
            <Box
              sx={{ display: "flex", sm: { gap: "5px" }, gap: "10px",width:"100%" }}
              mt={5}
            >
              <Paper
                elevation={2}
                variant="outlined"
                onClick={()=>setCount(1)}
                sx={{
                  minWidth: "32.5%",
                  height: "33%",
                  padding: 4,
                  textAlign: "center",
                  borderColor: "#55B4B5",
                  backgroundColor: count === 1 ? "#C0E5E5" :"white",
                  cursor:"pointer"
                }}
              >
                <Typography variant="h3" sx={{ color: "#255766" }} p={2}>
                  Total Qc
                </Typography>
                <Typography variant="h4" sx={{ color: "#255766" }}>
                  {list?.total}
                </Typography>
              </Paper>
              <Paper
                elevation={2}
                variant="outlined"
                onClick={()=>setCount(2)}
                sx={{
                  minWidth: "32.5%",
                  height: "33%",
                  padding: 4,
                  textAlign: "center",
                  borderColor: "#55B4B5",
                  backgroundColor: count === 2 ? "#C0E5E5" :"white",
                  cursor:"pointer"
                }}
              >
                <Typography variant="h3" sx={{ color: "#255766" }} p={2}>
                  Pass
                </Typography>
                <Typography variant="h4" sx={{ color: "#255766" }}>
                {  list?.result?.filter(
  item => item?.qc_test?.every(ele => ele?.value === true)
)?.length }
                </Typography>
              </Paper>
              <Paper
                elevation={2}
                variant="outlined"
                onClick={()=>setCount(3)}
                sx={{
                  minWidth: "32.5%",
                  height: "33%",
                  padding: 4,
                  textAlign: "center",
                  borderColor: "#55B4B5",
                  backgroundColor:count === 3 ? "#C0E5E5" :"white",
                  cursor:"pointer"
                }}
              >
                <Typography variant="h3" sx={{ color: "#255766" }} p={2}>
                  Fail
                </Typography>
                <Typography variant="h4" sx={{ color: "#255766" }}>
              {  list?.result?.filter(
  item => item?.qc_test?.some(ele => ele?.value === false)
)?.length }
                </Typography>
              </Paper>
            </Box>}
            <FiltersBox mt={5} >
              <PaddingBoxInDesktop
                mb={2}
                sx={{ display: "flex", gap: "10px", width: "100%"}}
              >
                <AsyncDropDown
                  lazyFun={async (para) => await FetchFGApi({ ...para })}
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem 
                    {...rest}>{option.name}</ListItem>;
                  }}
                  onChange={async (changedVal) => {
                    setFilters({
                      ...filters,
                      product_id: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <CustomInput
                    sx={{height:"55px"}}
                    size="small"
                      {...params}
                      placeholder={"Select Product"}
                      margin="none"
                    />
                  )}
                />
                
                <TimeRangeSelector
                sx={{height:"55px"}}
                  onChange={(newRange) => {
                    setFilters({ ...filters, ...newRange });
                  }}
                />

                <AsyncSearchBar
                  fullWidth
                  sx={{height:"55px",display:"flex",justifyContent:"center"}}
                  title="Search The Qc Created Name/Box Id"
                  size="small"
                  placeholder={"Search The Qc Created Name / Box Id"}
                  defaultValue={filters.search}
                  onChange={(changedVal) => {
                    setFilters({
                      ...filters,
                      pageNo: 1,
                      pageSize: 10,
                      search: changedVal,
                    });
                  }}
                />
              </PaddingBoxInDesktop>
            </FiltersBox>
          </Box>

          <Box sx={{ minHeight: "40vh" }}>
            <DataTable
              key={JSON.stringify(list)}
              columns={columns}
              rows={count == 1 ? list.result :(count == 2 ? list?.result?.filter(
                item => item?.qc_test?.every(ele => ele?.value === true)
              ) : list?.result?.filter(
                item => item?.qc_test?.some(ele => ele?.value === false)
              ))}
              count={count ==1 ? list.total : (count == 2 ? list?.result?.filter(
                item => item?.qc_test?.every(ele => ele?.value === true)
              ).length :  list?.result?.filter(
                item => item?.qc_test?.some(ele => ele?.value === false)
              ).length)}
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
export default QcDashboardListUi;
