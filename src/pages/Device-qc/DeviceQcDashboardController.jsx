import React, { memo, useEffect, useMemo, useState } from "react";
import DeviceQcDashboardUi from "./DeviceQcDashboardUi";
import { fetchDeviceApi } from "../../apis/deviceQc.api";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import { toTitleSpaceCase } from "../../utils/main";
import { Visibility } from "@mui/icons-material";
import DeviceQcInformationUi from "./DeviceQcInformationUi";
import { openModal } from "../../store/actions/modalAction";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const dispatch = useDispatch();

  const onInfo = () => {
    dispatch(
      openModal(
        <DeviceQcInformationUi id={params?._id} IsVeiw={true} />,
        "lg",
        false,
        "device-qc-information"
      )
    );
  };

  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <IconButton size="inherit" onClick={onInfo}>
        <Visibility color="info" fontSize="inherit" />
      </IconButton>
    </Box>
  );
});

const DeviceQcDashboardController = () => {
  const dispatch = useDispatch();
  const [list, SetList] = useState();
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "",
    sortDirection: -1,
  });

  const fetchDevice = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchDeviceApi({ ...filters }),
        (response) => {
          SetList(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "deviceName",
        label: "Device Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {toTitleSpaceCase(params?.deviceName) || "NA"}
          </Typography>
        ),
      },
      {
        id: 2,
        fieldName: "boxId",
        label: "Box ID",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {params?.boxId || "NA"}
          </Typography>
        ),
      },
      {
        id: 3,
        fieldName: "deviceColor",
        label: "Device Color",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {toTitleSpaceCase(params?.deviceColor?.name) || "NA"}
          </Typography>
        ),
      },

      {
        id: 4,
        fieldName: "",
        label: "Left Device QC Result",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          const isPassed = params.left.result;

          return (
            <Chip
              label={isPassed ? "Passed" : "Failed"}
              size="small"
              sx={{
                backgroundColor: isPassed ? "success.main" : "error.main",
                color: "#fff",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          );
        },
      },

      {
        id: 5,
        fieldName: "",
        label: "Right Device QC Result",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          const isPassed = params.right.result;

          return (
            <Chip
              label={isPassed ? "Passed" : "Failed"}
              size="small"
              sx={{
                backgroundColor: isPassed ? "success.main" : "error.main",
                color: "#fff",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          );
        },
      },

      {
        id: 6,
        fieldName: "",
        label: "QC Executive",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {toTitleSpaceCase(params?.qcExcecutive?.name) || "NA"}
          </Typography>
        ),
      },

      {
        id: 7,
        fieldName: "",
        label: "Action",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <ActionComponent params={params} setParams={setParams} />
        ),
      },
    ],
    [fetchDevice]
  );

  useEffect(() => {
    fetchDevice();
  }, [filters]);

  return (
    <DeviceQcDashboardUi
      list={list}
      fetchDevice={fetchDevice}
      loading={loading}
      filters={filters}
      setFilters={setFilters}
      columns={columns}
    />
  );
};

export default DeviceQcDashboardController;
