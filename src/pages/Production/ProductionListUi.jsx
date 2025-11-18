import {
  Box,
  Button,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import DataTable from "../../components/tables/DataTable";
import {
  FilterTitleBox,
} from "../../components/layouts/OneViewBox";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import AsyncDropDown from "../../components/inputs/AsyncDropDown";
import { StyledSearchBar } from "../../components/inputs/SearchBar";
import CustomInput from "../../components/inputs/CustomInputs";
import { FetchFGApi } from "../../apis/FG.api";
import CreateProductionPlanController from "./CreateProductionPlanController";
import { openModal } from "../../store/actions/modalAction";
import { useDispatch } from "react-redux";
import MODULES from "../../utils/module.constant";
import { OnCreateButtonAccess } from "../../utils/main";

const ProductionListUi = ({
  columns,
  list,
  filters,
  setFilters,
  loading,
  title,
  fields,
  setFields,
  fetchList,
  generateTable,
  callBack
}) => {
  const dispatch = useDispatch()

  const onCreateBtnClick = () => {
    dispatch(openModal(
      <CreateProductionPlanController
        id={filters?.product_id}
        quantity={fields.quantity}
        callBack={callBack}
      />, "lg", false, "Production-Planning"))
  }

  return (
    <>
      <Box>
        <Paper
          sx={{
            width: "100%",
            height: "85vh",
            padding: 6,
          }}
        >
          <Box
            mb={4}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <FilterTitleBox>
              <Box mt={2}>
                <Typography variant="h3" color={"#000"}>
                  {title}
                </Typography>
              </Box>
            </FilterTitleBox>

            {OnCreateButtonAccess(MODULES.PRODUCTIONPLANNING) &&
              <PaddingBoxInDesktop
                mt={5}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: "39%" }}>
                  <AsyncDropDown
                    lazyFun={async (para) => {
                      return await FetchFGApi({ ...para, allStatus: true });
                    }}
                    OptionComponent={({ option, ...rest }) => <ListItem {...rest}>{option?.name}</ListItem>}
                    value={filters?.product_id}
                    onChange={async (changedVal) => {
                      setFilters({ ...filters, product_id: changedVal ? changedVal?._id : null });
                    }}
                    titleKey={'name'}
                    valueKey={'_id'}
                    InputComponent={(params) => (
                      <StyledSearchBar placeholder={'Select Finished Goods (FG)*'} {...params} margin="none" />
                    )}
                  />
                </Box>

                <Box width={"39%"}>
                  <CustomInput
                    disabled={loading}
                    value={fields.quantity}
                    onChange={(e) =>
                      setFields((prevFields) => ({
                        ...prevFields,
                        quantity: e.target.value,
                      }))
                    }
                    type="text"
                    label={"Quantity"}
                    sx={{ height: "56px" }}
                  />
                </Box>

                <Box width={"20%"}>
                  <Button
                    onClick={() => onCreateBtnClick()}
                    disabled={
                      !(
                        filters?.product_id &&
                        fields.quantity &&
                        fields.quantity > 0
                      )
                    }
                    sx={{
                      width: "100%",
                      height: "8vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    variant="contained"
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        display: "flex",
                      }}
                    >
                      Generate Plan
                    </Typography>
                  </Button>
                </Box>


              </PaddingBoxInDesktop>
            }

            <Box mt={OnCreateButtonAccess(MODULES.PRODUCTIONPLANNING) ? 5 : 8} width={"100%"} justifyContent={"center"}>
              <DataTable columns={columns} rows={list?.result ? list?.result : []} count={list?.total ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
            </Box>

          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProductionListUi;