import { Box, Button, ButtonGroup, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import DataTable from "../../components/tables/DataTable";
import ButtonComponentsUi from "../../components/button/ButtonComponentsUi";
import { DEVICES, QC_BUTTON_FILTER } from "../../utils/constants";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import AsyncSearchBar from "../../components/inputs/AsyncSearchBar";
import { FiltersBox } from "../../components/layouts/OneViewBox";
import { toTitleCase, toTitleSpaceCase } from "../../utils/main";

const DeviceQcDashboardUi = ({
  list,
  loading,
  filters,
  setFilters,
  columns,
  buttonStatus,
  setButtonStatus,
  counts,
  selectedDevices,
  setSelectedDevices,
}) => {
  const totalCounts =
    (list?.statusCounts?.packagingDone || 0) +
    (list?.statusCounts?.packagingPending || 0) +
    (list?.statusCounts?.rejected || 0);

  return (
    <Box mb={3}>
      <Paper elevation={2} sx={{ width: "100%", padding: 6 }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap", // ✅ REQUIRED
            // gap: 2,
            justifyContent: "space-between",
            mb: 4,
            mt: 4,
          }}
        >
          {counts
            ?.filter((item) => item?.device !== 13)
            .map((item) => (
              <Box key={item?.device} sx={{ width: "14.5vw", mb: 2 }}>
                <ButtonComponentsUi
                  width="100%"
                  onSubmit={() => setSelectedDevices(item?.device)}
                  colorType={selectedDevices === item?.device}
                  Title={item?.deviceName}
                  count={item?.count}
                />
              </Box>
            ))}
        </Box>

        <Box mb={4} sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ width: "75%" }}>
            <ButtonGroup sx={{ width: "100%" }}>
              <ButtonComponentsUi
                ButtonGroupWidth="30vw"
                onSubmit={() => setButtonStatus(QC_BUTTON_FILTER.ALL)}
                ButtonGroup
                STATUSWiseData={buttonStatus === QC_BUTTON_FILTER.ALL}
                Title={"All"}
                CountButtonGroup={totalCounts}
              />
              <ButtonComponentsUi
                onSubmit={() => setButtonStatus(QC_BUTTON_FILTER.PASSED)}
                ButtonGroup
                STATUSWiseData={buttonStatus === QC_BUTTON_FILTER.PASSED}
                Title={"Passed with Packaging"}
                CountButtonGroup={list?.statusCounts?.packagingDone || 0}
              />
              <ButtonComponentsUi
                onSubmit={() => setButtonStatus(QC_BUTTON_FILTER.QC_PENDING)}
                ButtonGroup
                STATUSWiseData={buttonStatus === QC_BUTTON_FILTER.QC_PENDING}
                Title={"Packaging Pending"}
                CountButtonGroup={list?.statusCounts?.packagingPending || 0}
              />
              <ButtonComponentsUi
                ButtonGroupWidth="40vw"
                onSubmit={() => setButtonStatus(QC_BUTTON_FILTER.REJECTED)}
                ButtonGroup
                STATUSWiseData={buttonStatus === QC_BUTTON_FILTER.REJECTED}
                Title={"Rejected"}
                CountButtonGroup={list?.statusCounts?.rejected || 0}
              />
            </ButtonGroup>
          </Box>

          <Box>
            <AsyncSearchBar
              fullWidth
              title="Search By Box Id"
              size="small"
              placeholder={"Search By Box Id"}
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
          </Box>
        </Box>

        <Box sx={{ minHeight: "40vh" }}>
          <DataTable
            columns={columns}
            rows={list?.result ? list?.result : []}
            count={list?.total ?? 0}
            filters={filters}
            setFilters={setFilters}
            loading={loading}
            key={buttonStatus}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DeviceQcDashboardUi;
