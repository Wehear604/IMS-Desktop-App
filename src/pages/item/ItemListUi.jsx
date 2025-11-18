import React from 'react'
import CreateItemController from './CreateItemController';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/actions/modalAction';
import { Box, Paper, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import DataTable from '../../components/tables/DataTable';
import { FilterTitleBox, FiltersBox } from '../../components/layouts/OneViewBox';
import { OnCreateButtonAccess } from '../../utils/main';
import MODULES from '../../utils/module.constant';

const ItemListUi = ({ columns, list, filters, setFilters, loading, callBack }) => {
  const dispatch = useDispatch()
  const id = 'item';
  const onCreateBtnClick = () => {
    dispatch(openModal(
      <CreateItemController
        callBack={callBack}
      />, "sm", false, id))
  }
  return (
    <>
      <Box mb={3}>
        <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
          <Box mb={4} display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"flex-end"}>
            <FilterTitleBox>
              <Box mt={2} >
                <Typography variant="h3" color={"#000"}>
                  Asset
                </Typography>
              </Box>

              <Box mb={2} sx={{ display: "flex" }}>
                <Box mr={2} />
              </Box>
              <Box>
                {OnCreateButtonAccess(MODULES.ASSET) && <Button onClick={onCreateBtnClick} sx={{ width: "100%", height: "6vh", display: "flex", alignItems: "center", justifyContent: "center" }} variant='contained'>
                  <AddIcon /> &nbsp;
                  <Typography variant='h5' sx={{ display: "flex" }}>
                    Add Asset
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

export default ItemListUi