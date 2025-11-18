import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../components/tables/DataTable";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../store/actions/modalAction";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import CreateProductController from "./CreateProductController";
import { USER_ROLES } from "../../utils/constants";

const ProductListUi = ({
  columns,
  list,
  filters,
  setFilters,
  loading,
}) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const id = "product";
  const onCreateBtnClick = () => {
    dispatch(openModal(<CreateProductController />, "sm", false, id));
  };
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
                Products
              </Typography>

              {user.data.role !== USER_ROLES.ACCOUNT && user.data.role !==USER_ROLES.PACKAGING_AND_DISPATCH  && ( <Box mt={2} display="flex" alignItems="flex-end">
                <Button
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
                  <Typography
                    variant="h5"
                    sx={{
                      display: "flex",
                    }}
                  >
                    Add Product
                  </Typography>
                </Button>
              </Box>)}
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
                    placeholder={"Search By Name"}
                    defaultValue={filters?.search}
                    onChange={(changedVal) =>
                      setFilters({ ...filters, pageNo: 1,
                        pageSize: 10, search: changedVal })
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

export default ProductListUi;
