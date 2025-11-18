import { Box, Button, ButtonGroup, Paper, Typography } from "@mui/material";
import React from "react";
import DataTable from "../../components/tables/DataTable";
import { useSelector } from "react-redux";
import DashboardProductCounts from "./DashboardProductCounts";
import { USER_ROLES } from "../../utils/constants";
import ButtonComponentsUi from "../../components/button/ButtonComponentsUi";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import ProjectAnalysisUi from "./ProjectAnalysisUi";

const DashboardListUi = ({
  data,
  setData,
  columns,
  list,
  filters,
  setFilters,
  loading,
  setButtonStatus,
  buttonStatus,
  Material,
  setStatus,
  Status,
  fetchProductList,
  fields,
  setFields
}) => {
  const user = useSelector((state) => state.user)
  return (
    <>
      <Box>
        <Paper sx={{ width: "100%", padding: 6 }}>
          <Box mb={4} display="flex" flexDirection="column">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 5 }}
            >
              <Typography variant="h3" color={"#000"}>
                Dashboard
              </Typography>
            </Box>

            <ButtonGroup >
              <ButtonComponentsUi
                onSubmit={() => setButtonStatus("Finished_Good")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "Finished_Good"}
                Title={"Finished Good"}
              />
              <ButtonComponentsUi
                onSubmit={() => setButtonStatus("Semi_Finished_Good")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "Semi_Finished_Good"}
                Title={"Semi Finished Good"}
              />
              <ButtonComponentsUi
                onSubmit={() => setButtonStatus("Semi_Knocked_Down")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "Semi_Knocked_Down"}
                Title={"Semi Knocked Down"}
              />
              <ButtonComponentsUi
                onSubmit={() => setButtonStatus("Raw_Material")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "Raw_Material"}
                Title={"Raw Material"}
              />
            </ButtonGroup >
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-start", width: "80%" }}>
              <ButtonGroup sx={{ width: "40%" }}>
                <ButtonComponentsUi
                  onSubmit={() => setStatus("Product_Stock")}
                  ButtonGroup
                  STATUSWiseData={Status === "Product_Stock"}
                  Title={"Product Stock"}
                  fontSize={"12px"}
                />
                <ButtonComponentsUi
                  onSubmit={() => setStatus("Project_Analysis")}
                  ButtonGroup
                  STATUSWiseData={Status === "Project_Analysis"}
                  Title={"Project Analysis"}
                  fontSize={"12px"}
                />
              </ButtonGroup>
            </Box>
            {Status === "Product_Stock" && <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "20%"
              }}
            >
              <AsyncSearchBar
                fullWidth
                title={`Search By ${Material(buttonStatus).lable}`}
                size="small"
                placeholder={`Search By ${Material(buttonStatus).lable}`}
                defaultValue={filters?.search}
                onChange={(changedVal) =>
                  setFilters({
                    ...filters,
                    pageNo: 1,
                    pageSize: 10,
                    search: changedVal,
                  })
                }
              />
            </Box>}
          </Box>

          {Status === "Product_Stock" && <Box
            mt={5}
            sx={{
              height: "40vh"
            }}
          >
            <DataTable
              key={buttonStatus}
              columns={columns}
              rows={list?.result ? list?.result : []}
              count={list?.total ?? 0}
              filters={filters}
              setFilters={setFilters}
              loading={loading}
            />
          </Box>}

          {Status === "Project_Analysis" && <Box><ProjectAnalysisUi
            data={data}
            setData={setData}
            fields={fields}
            setFields={setFields}
          />
          </Box>}
        </Paper>
      </Box>
    </>
  );
};

export default DashboardListUi;
