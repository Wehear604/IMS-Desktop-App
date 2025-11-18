import { Box, Button, ButtonGroup, Paper, Typography } from "@mui/material";
import React from "react";
import DataTable from "../../components/tables/DataTable";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../store/actions/modalAction";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import TimeRangeSelector from "../../components/layouts/common/TimeRangeSelector";
import UpdateStockCreateController from "./UpdateStockCreateController";
import { USER_ROLES } from "../../utils/constants";

const LeadListUi = ({
  columns,
  list,
  filters,
  setFilters,
  loading,
  setItemType,
  itemType,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)
  const id = "CloseTheModal";
  const onCreateBtnClick = () => {
    dispatch(
      openModal(<UpdateStockCreateController />, "sm", false, id)
    );
  }
  return (
    <>
      <Box>
        <Paper sx={{ width: "100%", padding: 6 }}>
          <Box mb={4} display="flex" flexDirection="column">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h3" color={"#000"}>
                Stocks In/Out
              </Typography>

              <Box mt={2} display="flex" alignItems="flex-end">
                <Button
                  onClick={onCreateBtnClick}
                  sx={{ width: "200px", height: "6vh", mb: 2 }}
                  variant="contained"
                >
                  <Typography variant="h5">
                    Update Stock
                  </Typography>
                </Button>
              </Box>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >

              {user.data.role !== USER_ROLES.PURCHASE && (<Box>
                <ButtonGroup disableElevation sx={{}}>
                  <Button
                    sx={{ height: "6vh" }}
                    variant={
                      itemType === "rawMaterial" ? "contained" : "outlined"
                    }
                    onClick={() => setItemType("rawMaterial")}
                  >
                    <Typography variant='h6' sx={{ fontWeight: "bold" }}> Raw Materials</Typography>
                  </Button>
                  <Button
                    sx={{ height: "6vh" }}
                    variant={itemType === "product" ? "contained" : "outlined"}
                    onClick={() => setItemType("product")}
                  >
                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Products</Typography>
                  </Button>
                </ButtonGroup>
              </Box>)}

              <PaddingBoxInDesktop
                sx={{
                  display: "flex",
                  width: "30vw",
                  flexDirection: "flex-start",
                }}
              >
                <TimeRangeSelector
                  onChange={(val) => setFilters({ ...filters, ...val })}
                />
              </PaddingBoxInDesktop>
              <Box>

                <PaddingBoxInDesktop
                  sx={{
                    display: "flex",
                    width: "20vw",
                    flexDirection: "flex-start",
                  }}
                >
                  <AsyncSearchBar
                    fullWidth
                    title="Search By Name"
                    size="small"
                    placeholder={"Search By Name"}
                    defaultValue={filters?.search}
                    onChange={(changedVal) =>
                      setFilters({
                        ...filters, pageNo: 1,
                        pageSize: 10, search: changedVal
                      })
                    }
                  />
                </PaddingBoxInDesktop>
              </Box>
            </Box>
          </Box>

          <Box sx={{ minHeight: "60vh" }}>
            <DataTable
              key={itemType}
              columns={columns}
              rows={list?.result ?? []}
              count={list?.total ?? 0}
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

export default LeadListUi;
