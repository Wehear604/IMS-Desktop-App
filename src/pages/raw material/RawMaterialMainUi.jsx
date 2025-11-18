import { Box, Button, Paper, Typography } from '@mui/material'
import React from 'react'
import DataTable from '../../components/tables/DataTable';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../../store/actions/modalAction';
import RawMaterialCreateController from './RawMaterialCreateController';
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import { USER_ROLES } from '../../utils/constants';
import { OnCreateButtonAccess } from '../../utils/main';
import MODULES from '../../utils/module.constant';


const RawMaterialMainUi = ({ columns, list, filters, setFilters, loading }) => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const id = 'rawMaterial';
  const onCreateBtnClick = () => {
    dispatch(openModal(<RawMaterialCreateController
    />, "sm", false, id))
  }

  return (
    <>
      <Box >
        <Paper sx={{ width: "100%", padding: 6 }}>

          <Box mb={4} display="flex" flexDirection="column">
            <Box
              display="flex"
              width={"100%"}
              justifyContent="flex-end"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              {OnCreateButtonAccess(MODULES.BOM) && (<Box mt={2} display="flex" alignItems="flex-end">
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
                  <Typography
                    variant="h5"
                    sx={{
                      display: "flex",
                    }}
                  >
                    Add Raw Material
                  </Typography>
                </Button>
              </Box>)}
            </Box>



          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mt={1}
            mb={4}
          >

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
                  setFilters({
                    ...filters, pageNo: 1,
                    pageSize: 10, search: changedVal
                  })
                }
              />
            </PaddingBoxInDesktop>
          </Box>

          <Box sx={{ minHeight: "30vh" }}>
            <DataTable columns={columns} rows={list?.result ? list?.result : []} count={list?.total ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
          </Box>
        </Paper>
      </Box>


    </>
  )
}

export default RawMaterialMainUi