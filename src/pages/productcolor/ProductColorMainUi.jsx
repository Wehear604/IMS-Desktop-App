import { Box, Button, Paper, Typography } from '@mui/material'
import React from 'react'
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/tables/DataTable';
import { FilterTitleBox, FiltersBox } from '../../components/layouts/OneViewBox';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/actions/modalAction';
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import ProductColorCreateController from './ProductColorCreateController';
import { OnCreateButtonAccess } from '../../utils/main';
import MODULES from '../../utils/module.constant';


const ProductColorMainUi = ({ columns, list, filters, setFilters, loading }) => {
  const dispatch = useDispatch()
  const id = 'department';
  const onCreateBtnClick = () => {
    dispatch(openModal(
    <ProductColorCreateController
    />, "sm", false, id))
  }
  return (
    <>
      <Box mb={3}>
        <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
          <Box  mb={4}  display={"flex"}  flexDirection={"column"} justifyContent={"center"} alignItems={"flex-end"}>
            <FilterTitleBox>
              <Box mt={2} >
                <Typography variant="h3" color={"#000"}>
                  Product Color
                </Typography>
              </Box>

              <Box mb={2} sx={{ display: "flex" }}>
                <Box mr={2} />
              </Box>
              <Box>
               {OnCreateButtonAccess(MODULES.COLOR) && <Button onClick={onCreateBtnClick}sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent:"center" }} variant='contained'>
                    <AddIcon /> &nbsp;
                  <Typography variant='h5' sx={{ display: "flex" }}>
                    Add Product Color
                  </Typography>
                </Button>}
              </Box>
            </FilterTitleBox>

            <FiltersBox mt={4}>
              <PaddingBoxInDesktop
                mb={4}
                sx={{ display: "flex",width:"20vw", justifyContent: "flex-end" }}
                pl={3}
              >
                <AsyncSearchBar
                  fullWidth
                  title="Search By Name"
                  size="small"
                  placeholder={"Search By Name"}
                defaultValue={filters.search}
                onChange={(changedVal) => {
                  setFilters({ ...filters, pageNo: 1,
                    pageSize: 10, search: changedVal });
                }}
                />
              </PaddingBoxInDesktop>
            </FiltersBox>
          </Box>

          <Box sx={{ minHeight:"40vh"}}>
            <DataTable columns={columns} rows={list?.result ? list?.result : []} count={list?.total ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
          </Box>
        </Paper>
      </Box>


    </>
  )
}

export default ProductColorMainUi