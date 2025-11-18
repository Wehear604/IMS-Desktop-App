import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import DataTable from "../../components/tables/DataTable";
import { useDispatch, useSelector } from "react-redux";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";

const BatchListUi = ({
  columns,
  list,
  filters,
  setFilters,
  loading,

}) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch();

  return (
    <>
      <Box>
        <Paper
          sx={{
            width: "100%",
            padding: 6,
          }}
        >
          <Box mb={4} display="flex" flexDirection="column">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 5 }}
            >
              <Typography variant="h3" color={"#000"}>
                Quality Check
              </Typography>


            </Box>

            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              mt={1}
            >


              <Box>
                <PaddingBoxInDesktop
                  sx={{
                    display: "flex",
                    width: "20vw",
                  }}
                >
                  <AsyncSearchBar
                    fullWidth
                    title="Search By Name"
                    size="small"
                    placeholder={"Search By Serial No."}
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

          <Box
            sx={{
              minHeight: "40vh",
            }}
          >
            <DataTable
              columns={columns}
              rows={list?.result ? list?.result : []}
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

export default BatchListUi;
